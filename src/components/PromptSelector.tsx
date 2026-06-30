import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { PromptType, Mode } from '@/types'

interface PromptSelectorProps {
  selectedPrompt: PromptType
  setSelectedPrompt: (v: PromptType) => void
  mode: Mode
}

export function PromptSelector({ selectedPrompt, setSelectedPrompt, mode }: PromptSelectorProps) {
  const allOptions = [
    { value: 'default', label: 'Default' },
    { value: 'ocr', label: 'OCR' },
    { value: 'flux1', label: 'FLUX.1-dev' },
    { value: 'flux2', label: 'FLUX.2-dev' },
  ] as const satisfies { value: PromptType | 'ocr'; label: string }[]

  const options = allOptions.filter(opt => {
    if (mode === 'imgocr') return opt.value === 'ocr'
    return opt.value !== 'ocr'
  })

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-muted-foreground w-12 shrink-0">Prompt</label>
      <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
        <SelectTrigger className="flex-1 h-9 text-sm">
          <SelectValue placeholder="Select prompt style" />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}