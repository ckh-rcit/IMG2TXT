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
  const [cleanupApplied, setCleanupApplied] = useState(false)

  const requestSingleTurn = useCallback(async (model: string, imageB64: string, content: string, numPredict: number) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content, images: [imageB64] }],
        stream: false,
        options: { num_predict: numPredict },
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Ollama error (${res.status}): ${err}`)
    }
    const json = await res.json()
    return (json?.message?.content ?? '').toString().trim()
  }, [])

  const buildSceneAnchor = useCallback(async (model: string, imageB64: string) => {
    const anchorInstruction = [
      'Describe exactly what is visible in this image in one short sentence.',
      'Include only the main subject, key action, and setting.',
      'No style words, no camera terms, no abstract reinterpretation, no markdown.',
      'Do not use em dashes, e.g., i.e., or etc.',
    ].join(' ')
    const raw = await requestSingleTurn(model, imageB64, anchorInstruction, 96)
    return cleanOutput(raw, 'flux1')
  }, [requestSingleTurn])

  const generate = useCallback(async (
    imageB64: string,
    promptType: PromptType | 'ocr',
    detailLevel: string,
    selectedModel: string,
    imageCapable = true
  ) => {
    if (!imageCapable) {
      setStatus('error', 'Selected model is likely non-vision. Choose a vision-capable model for image prompts.')
      return
    }

    const model = selectedModel || 'llava'
    const isFluxMode = promptType === 'flux1' || promptType === 'flux2'

    setDescription('')
    setTokenCount(0)
    setCleanupApplied(false)

    let sceneAnchor = ''
    if (isFluxMode) {
      setStatus('sending', 'Analyzing visible scene...')
      try {
        sceneAnchor = await buildSceneAnchor(model, imageB64)
      } catch {
        // Fall back to direct prompt generation if the prepass fails.
      }
    }

    const prompt = buildPrompt(promptType, detailLevel, sceneAnchor)
    setStatus('sending', 'Sending image to Ollama...')

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
        const cleaned = cleanOutput(full, promptType)
        setCleanupApplied(cleaned !== full.trim())
        setDescription(cleaned)
        setStatus('done', 'Description complete.')
      }
    } catch (err) {
      setStatus('error', (err as Error).message.includes('fetch')
        ? 'Cannot reach Ollama at localhost:11434'
        : (err as Error).message)
    }
  }, [setStatus, buildSceneAnchor])

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(description)
  }, [description])

  const clear = useCallback(() => {
    setDescription('')
    setTokenCount(0)
    setCleanupApplied(false)
  }, [])

  return { description, setDescription, tokenCount, setTokenCount, cleanupApplied, generate, copy, clear }
}
