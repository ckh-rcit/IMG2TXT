import { useState, useCallback } from 'react'
import type { OllamaModel, ModelOption } from '@/types'
import { guessVision, guessCloud, guessOcr } from '@/constants/vision'

// Curated recommended models for easy pulling
export const RECOMMENDED_MODELS = [
  'qwen3-vl:8b-instruct',
  'qwen3-vl:latest',
  'qwen3.5:latest',
  'qwen3.5:9b',
  'huihui_ai/qwen3-vl-abliterated:8b-instruct',
  'llava:latest',
  'glm-ocr:latest',
  'gemma4:e2b',
  'gemma4:e4b',
] as const

export type PullStatus = 'idle' | 'pulling' | 'success' | 'error'

export function useModels() {
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [statusMsg, setStatusMsg] = useState('Loading models...')
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
      const visionCount = options.filter(m => m.isVision).length
      setStatusMsg(`${all.length} model(s), ${visionCount} vision-capable`)
      const found = (['llava', 'moondream', 'bakllava', 'gemma3', 'gemma4', 'llama3.2-vision', 'pixtral', 'qwen2-vl', 'qwen3-vl', 'qwen3.5', 'glm'] as const)
        .find(p => options.some(m => m.name.startsWith(p)))
      if (found) {
        const model = options.find(m => m.name.startsWith(found))
        if (model) setSelectedModel(model.name)
      }
    } catch {
      setStatusMsg('Cannot reach Ollama at localhost:11434')
    }
  }, [])

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

  return { models, selectedModel, setSelectedModel, statusMsg, fetchModels, pullModel, pullStatus, pullProgress }
}