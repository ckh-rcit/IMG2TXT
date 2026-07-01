import { useState, useCallback } from 'react'
import type { OllamaModel, ModelOption } from '@/types'
import { guessVision, guessCloud, guessOcr, PRIORITY } from '@/constants/vision'

// Curated recommended models for easy pulling
export const RECOMMENDED_MODELS = [
  'qwen3-vl:8b-instruct',
  'qwen3-vl:latest',
  'huihui_ai/qwen3-vl-abliterated:8b-instruct',
  'llava:latest',
  'glm-ocr:latest',
] as const

export type PullStatus = 'idle' | 'pulling' | 'success' | 'error'

const PREFERRED_DEFAULTS = [
  'qwen3-vl:8b-instruct',
  'qwen3-vl:latest',
  'huihui_ai/qwen3-vl-abliterated:8b-instruct',
] as const

export function useModels() {
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [pullStatus, setPullStatus] = useState<PullStatus>('idle')
  const [pullProgress, setPullProgress] = useState('')

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/tags')
      if (!res.ok) throw Error()
      const data = await res.json()
      const all = (data.models ?? []) as OllamaModel[]
      const sorted = [...all].sort((a, b) => Number(guessVision(b)) - Number(guessVision(a)))
      const options = sorted.map(m => ({
        name: m.name,
        displayName: m.name.split('/').pop() || m.name,
        isVision: guessVision(m),
        isCloud: guessCloud(m.name),
        isOcr: guessOcr(m),
      }))
      setModels(options)

      // Keep user selection stable across refresh if the model still exists.
      if (selectedModel && options.some(m => m.name === selectedModel)) return

      const preferred = PREFERRED_DEFAULTS.find(name => options.some(m => m.name === name))
      if (preferred) {
        setSelectedModel(preferred)
        return
      }

      const found = PRIORITY
        .find(p => options.some(m => m.name.startsWith(p)))
      if (found) {
        const model = options.find(m => m.name.startsWith(found))
        if (model) setSelectedModel(model.name)
      } else if (options[0]) {
        setSelectedModel(options[0].name)
      }
    } catch {
      // Leave current list/selection untouched on network errors.
    }
  }, [selectedModel])

  const pullModel = useCallback(async (modelName: string) => {
    setPullStatus('pulling')
    setPullProgress('Starting...')
    try {
      const res = await fetch('/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const json = JSON.parse(line)
            if (json.status) setPullProgress(json.status)
            if (json.completed && json.total) {
              const pct = Math.round((json.completed / json.total) * 100)
              setPullProgress(`${json.status} ${pct}%`)
            }
          } catch { /* skip partial */ }
        }
      }

      setPullStatus('success')
      setPullProgress('Done!')
      await fetchModels()
      setTimeout(() => setPullStatus('idle'), 2000)
    } catch (err) {
      setPullStatus('error')
      setPullProgress((err as Error).message)
    }
  }, [fetchModels])

  return { models, selectedModel, setSelectedModel, fetchModels, pullModel, pullStatus, pullProgress }
}