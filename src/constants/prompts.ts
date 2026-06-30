export type PromptType = 'default' | 'ocr' | 'flux1' | 'flux2'
export type DetailLevel = 'simple' | 'detailed' | 'very-detailed' | 'extreme'

export const DETAIL_LEVELS: { value: DetailLevel; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'very-detailed', label: 'Very Detailed' },
  { value: 'extreme', label: 'Extreme Detail' },
] as const

const NO_EM_DASH = ' Do not use em dashes (—). Use commas, semicolons, or periods instead.'

const BASE_PROMPTS: Record<PromptType, string> = {
  default: 'Describe this image.' + NO_EM_DASH,
  ocr: 'Extract all text visible in this image. Output the raw text only — no markdown, no code blocks, no backticks, no formatting, no commentary, no labels. Just the text itself.',
  flux1: `Analyze this image and produce a detailed text-to-image prompt for FLUX.1-dev. Use natural language structured around these elements: SUBJECT (who/what is the focus), LOCATION (setting/environment), STYLE (artistic direction), CAMERA SETTINGS (perspective, lens, shot type), LIGHTING (quality, source, direction), COLORS (dominant palette), EFFECTS (atmosphere, mood, visual treatments), and any ADDITIONAL ELEMENTS. Write as a fluid, descriptive sentence that could recreate this image faithfully. Include specific visual details, textures, spatial relationships, and composition notes.` + NO_EM_DASH,
  flux2: `Analyze this image and produce a detailed text-to-image prompt for FLUX.2. Structure it as: Subject + Action + Style + Context. Place the most important elements first (priority order: main subject, key action, critical style, essential context, secondary details). For photorealism, specify camera model, lens, and film stock (e.g. "shot on Sony A7IV, 85mm f/1.4"). Use hex color codes for precise color matching where relevant (e.g. "color #C4725A"). Describe what IS present — no negative phrasing. Write a clear, natural language description that could recreate this image.` + NO_EM_DASH,
}

const DETAIL_MODIFIERS: Record<DetailLevel, string> = {
  simple: ' Keep it brief and concise — one short paragraph.',
  detailed: ' Provide a thorough description with multiple paragraphs covering key elements.',
  'very-detailed': ' Provide an exhaustive, multi-paragraph description covering every notable detail: subjects, setting, lighting, colors, textures, composition, mood, and technical qualities.',
  extreme: ' Provide an extremely granular, exhaustive description. Break down every element systematically: subject identification with precise attributes, spatial relationships, lighting analysis (direction, quality, color temperature), color palette with specific tones, material textures, composition rules used, camera perspective implications, atmospheric conditions, and any text or symbols. Leave nothing unexamined.',
}

export function buildPrompt(type: PromptType, detail: string): string {
  const base = BASE_PROMPTS[type]
  if (type === 'ocr') return base
  return base + DETAIL_MODIFIERS[detail as DetailLevel]
}

export const PROMPT_LABELS: Record<PromptType, string> = {
  default: 'Default',
  ocr: 'OCR',
  flux1: 'FLUX.1-dev',
  flux2: 'FLUX.2-dev',
}

export const PROMPT_OPTIONS = [
  { value: 'default', label: PROMPT_LABELS.default },
  { value: 'ocr', label: PROMPT_LABELS.ocr },
  { value: 'flux1', label: PROMPT_LABELS.flux1 },
  { value: 'flux2', label: PROMPT_LABELS.flux2 },
] as const