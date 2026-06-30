export const VISION_PREFIXES = [
  'llava', 'moondream', 'bakllava', 'gemma3', 'gemma4',
  'llama3.2-vision', 'llama3.3-vision',
  'qwen2-vl', 'qwen2.5-vl', 'qwen3-vl', 'qwen3.5',
  'minicpm-v', 'pixtral', 'smolvlm', 'phi3-vision',
  'cogvlm', 'deepseek-vl', 'deepseek-ocr', 'internvl', 'xgen-mm', 'yi-vision',
  'llava-llama3', 'llava-phi3', 'tinyllava',
  'glm-ocr', 'glm4v', 'glm',
] as const

export const PRIORITY = [
  'llava', 'moondream', 'bakllava', 'gemma3', 'gemma4',
  'llama3.2-vision', 'pixtral', 'qwen2-vl', 'qwen3-vl', 'qwen3.5', 'glm',
] as const

export function guessVision(model: { name: string; details?: { families?: string[] } }): boolean {
  const fam = model.details?.families ?? []
  if (fam.some((f) => ['clip', 'vit', 'vision'].includes(f))) return true
  const n = model.name.toLowerCase()
  // Check start of name (for simple names) and after namespace separator (for namespaced models)
  return VISION_PREFIXES.some((p) => n.startsWith(p) || n.includes(`/${p}`))
}

export function guessCloud(name: string): boolean {
  return name.toLowerCase().includes(':cloud')
}

export function guessOcr(model: { name: string; details?: { families?: string[] } }): boolean {
  const n = model.name.toLowerCase()
  // Check for OCR-specific model names
  return n.includes('ocr') || n.includes('glm-ocr')
}