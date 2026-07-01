export type Mode = 'img2txt' | 'imgocr'
export type PromptType = 'default' | 'ocr' | 'flux1' | 'flux2'
export type DetailLevel = 'simple' | 'detailed' | 'very-detailed' | 'extreme'

export const MODES = [
  { value: 'img2txt', label: 'IMG2TXT' },
  { value: 'imgocr', label: 'IMGOCR' },
] as const

export const DETAIL_LEVELS: { value: DetailLevel; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'very-detailed', label: 'Very Detailed' },
  { value: 'extreme', label: 'Extreme Detail' },
] as const

export const IMG2TXT_PROMPTS: PromptType[] = ['default', 'flux1', 'flux2']
export const IMGOCR_PROMPTS: PromptType[] = ['ocr']

export function getPromptsForMode(mode: Mode): PromptType[] {
  return mode === 'img2txt' ? IMG2TXT_PROMPTS : IMGOCR_PROMPTS
}

const NO_EM_DASH = ' Do not use em dashes (—). Use commas, semicolons, or periods instead.'
const FLUX_OUTPUT_RULES = ' Output a single plain-text prompt only. No markdown, no bullet lists, no section labels, no JSON, no backticks, no quotation wrappers, no meta commentary, no e.g., no i.e., and no etc.'

const BASE_PROMPTS: Record<PromptType | 'ocr', string> = {
  default: 'Describe this image.' + NO_EM_DASH,
  ocr: 'Extract all text visible in this image. Output the raw text only — no markdown, no code blocks, no backticks, no formatting, no commentary, no labels. Just the text itself.',
  flux1: `Analyze this image and write a production-ready FLUX.1-dev prompt in clear natural language. Prioritize useful visual information in this order: primary subject, key action or pose, location and environment, style and medium, camera and framing, lighting, color palette, effects and atmosphere, and supporting elements. Keep only details that improve image recreation fidelity. Prefer concrete visual terms over filler words.` + FLUX_OUTPUT_RULES + NO_EM_DASH,
  flux2: `Analyze this image and write a production-ready FLUX.2-dev prompt using this structure: Subject + Action + Style + Context. Word order is critical, so place the most important elements first in this priority: main subject, key action, critical style, essential context, then secondary details. Use positive phrasing only and describe what should be present. For photorealistic scenes, include camera model, lens, and film stock when clearly inferable. Use hex colors only when specific object-color mapping is important.` + FLUX_OUTPUT_RULES + NO_EM_DASH,
}

const DETAIL_MODIFIERS: Record<DetailLevel, string> = {
  simple: ' Keep it brief and concise — one short paragraph.',
  detailed: ' Keep it a single coherent paragraph with strong specificity across key elements.',
  'very-detailed': ' Keep it a single coherent paragraph with dense, high-signal detail covering composition, lighting, color, material, and spatial relationships.',
  extreme: ' Keep it a single coherent paragraph with maximum useful specificity, emphasizing exact visual attributes and compositional relationships while avoiding repetition.',
}

export function buildPrompt(type: PromptType | 'ocr', detail: string): string {
  const base = BASE_PROMPTS[type]
  if (type === 'ocr') return base
  return base + DETAIL_MODIFIERS[detail as DetailLevel]
}

export const PROMPT_LABELS: Record<PromptType | 'ocr', string> = {
  default: 'Default',
  ocr: 'OCR',
  flux1: 'FLUX.1-dev',
  flux2: 'FLUX.2-dev',
}

export const PROMPT_OPTIONS: { value: PromptType | 'ocr'; label: string }[] = [
  { value: 'default', label: PROMPT_LABELS.default },
  { value: 'ocr', label: PROMPT_LABELS.ocr },
  { value: 'flux1', label: PROMPT_LABELS.flux1 },
  { value: 'flux2', label: PROMPT_LABELS.flux2 },
] as const