export const VISION_PREFIXES = [
  'llava', 'moondream', 'bakllava', 'gemma3', 'gemma4',
  'llama3.2-vision', 'llama3.3-vision',
  'qwen2-vl', 'qwen2.5-vl', 'qwen3-vl', 'qwen3.5',
  'minicpm-v', 'pixtral', 'smolvlm', 'phi3-vision',
  'cogvlm', 'deepseek-vl', 'deepseek-ocr', 'internvl', 'xgen-mm', 'yi-vision',
  'llava-llama3', 'llava-phi3', 'tinyllava',
  'glm-ocr', 'glm4v',
] as const

export const PRIORITY = [
  'llava', 'moondream', 'bakllava', 'gemma3', 'gemma4',
  'llama3.2-vision', 'pixtral', 'qwen2-vl', 'qwen3-vl', 'qwen3.5', 'glm4v', 'glm-ocr',
] as const

function normalizeName(name: string): { full: string; base: string } {
  const full = name.toLowerCase()
  const withoutTag = full.split(':')[0]
  const base = withoutTag.split('/').pop() ?? withoutTag
  return { full: withoutTag, base }
}

export function guessVision(model: { name: string; details?: { families?: string[] } }): boolean {
  const fam = model.details?.families ?? []
  if (fam.some((f) => ['clip', 'vit', 'vision', 'multimodal'].includes(f))) return true

  const { full, base } = normalizeName(model.name)

  if (VISION_PREFIXES.some((p) => full.startsWith(p) || base.startsWith(p))) return true

  // Conservative fallback: only trust explicit multimodal markers.
  return /(vision|(?:^|[-_])vl(?:$|[-_])|multimodal|(?:^|[-_])ocr(?:$|[-_])|4v|(?:^|[-_])mm(?:$|[-_]))/.test(base)
}

export function guessCloud(name: string): boolean {
  return name.toLowerCase().includes(':cloud')
}

export function guessOcr(model: { name: string; details?: { families?: string[] } }): boolean {
  const n = model.name.toLowerCase()
  // Check for OCR-specific model names
  return n.includes('ocr') || n.includes('glm-ocr')
}