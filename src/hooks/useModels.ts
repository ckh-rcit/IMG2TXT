import { useState, useCallback } from 'react'
import type { OllamaModel, ModelOption } from '@/types'
import { guessVision, guessCloud } from '@/constants/vision'

export function useModels() {
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [statusMsg, setStatusMsg] = useState('Loading models...')

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/tags')
      if (!res.ok) throw Error()
      const data = await res.json()
      const all = (data.models ?? []) as OllamaModel[]
      const sorted = [...all].sort((a, b) => Number(guessVision(b)) - Number(guessVision(a)))
      const options = sorted.map(m => ({
        name: m.name,
        isVision: guessVision(m),
        isCloud: guessCloud(m.name),
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

  return { models, selectedModel, setSelectedModel, statusMsg, fetchModels }
}