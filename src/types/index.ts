export interface OllamaModel {
  name: string
  details?: { families?: string[] }
}

export type Status = 'idle' | 'sending' | 'generating' | 'done' | 'error'

export type Mode = 'img2txt' | 'imgocr'
export type PromptType = 'default' | 'ocr' | 'flux1' | 'flux2'
export type DetailLevel = 'simple' | 'detailed' | 'very-detailed' | 'extreme'

export interface ModelOption {
  name: string
  displayName: string
  isVision: boolean
  isCloud: boolean
  isOcr: boolean
}