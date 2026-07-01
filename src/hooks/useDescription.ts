import { useState, useCallback } from 'react'
import { buildPrompt } from '@/constants/prompts'
import { cleanOutput } from '@/utils/cleanOutput'
import type { Status, PromptType } from '@/types'

interface UseDescriptionOptions {
  setStatus: (s: Status, msg: string) => void
}

export function useDescription({ setStatus }: UseDescriptionOptions) {
  const [description, setDescription] = useState('')
  const [tokenCount, setTokenCount] = useState(0)

  const generate = useCallback(async (
    imageB64: string,
    promptType: PromptType | 'ocr',
    detailLevel: string,
    selectedModel: string,
    imageCapable = true
  ) => {
    const prompt = buildPrompt(promptType, detailLevel)
    const model = selectedModel || 'llava'
    setDescription('')
    setTokenCount(0)
    setStatus(
      'sending',
      imageCapable
        ? 'Sending image to Ollama...'
        : 'Sending request... selected model may ignore images (likely non-vision).'
    )

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt, images: [imageB64] }],
          stream: true,
          options: promptType === 'ocr' ? { num_predict: 1024 } : { num_predict: 2048 },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Ollama error (${res.status}): ${err}`)
      }

      setStatus('generating', 'Generating description...')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let full = ''

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
            if (json.message?.content) {
              full += json.message.content
              setDescription(full)
            }
            if (json.done) {
              setStatus('done', 'Description complete.')
              if (json.eval_count) setTokenCount(json.eval_count)
            }
          } catch { /* skip partial */ }
        }
      }

      if (!full) {
        setStatus('error', 'Empty response from model.')
      } else {
        setDescription(cleanOutput(full, promptType))
        setStatus('done', 'Description complete.')
      }
    } catch (err) {
      setStatus('error', (err as Error).message.includes('fetch')
        ? 'Cannot reach Ollama at localhost:11434'
        : (err as Error).message)
    }
  }, [setStatus])

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(description)
  }, [description])

  const clear = useCallback(() => {
    setDescription('')
    setTokenCount(0)
  }, [])

  return { description, setDescription, tokenCount, setTokenCount, generate, copy, clear }
}