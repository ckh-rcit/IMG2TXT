import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { Mode } from '@/types'

interface ModeSelectorProps {
  selectedMode: Mode
  setSelectedMode: (v: Mode) => void
}

const MODE_OPTIONS = [
  { value: 'img2txt', label: 'IMG2TXT' },
  { value: 'imgocr', label: 'IMGOCR' },
] as const

export function ModeSelector({ selectedMode, setSelectedMode }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-muted-foreground w-12 shrink-0">Mode</label>
      <Select value={selectedMode} onValueChange={setSelectedMode}>
        <SelectTrigger className="flex-1 h-9 text-sm">
          <SelectValue placeholder="Select mode" />
        </SelectTrigger>
        <SelectContent>
          {MODE_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}