import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface DetailSelectorProps {
  selectedDetail: string
  setSelectedDetail: (v: string) => void
  disabled?: boolean
}

const DETAIL_OPTIONS = [
  { value: 'simple', label: 'Simple', description: '~100-300 tokens — one short paragraph' },
  { value: 'detailed', label: 'Detailed', description: '~300-800 tokens — thorough multi-paragraph description' },
  { value: 'very-detailed', label: 'Very Detailed', description: '~800-1500 tokens — exhaustive coverage of all elements' },
  { value: 'extreme', label: 'Extreme Detail', description: '~1500+ tokens — systematic granular breakdown of every element' },
] as const

export function DetailSelector({ selectedDetail, setSelectedDetail, disabled }: DetailSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2 w-full">
        <label className="text-xs font-medium text-muted-foreground w-12 shrink-0">Detail</label>
        <Select value={selectedDetail} onValueChange={setSelectedDetail} disabled={disabled}>
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue placeholder="Select detail level" />
          </SelectTrigger>
          <SelectContent>
            {DETAIL_OPTIONS.map(opt => (
              <Tooltip key={opt.value}>
                <TooltipTrigger asChild>
                  <SelectItem value={opt.value}>
                    {opt.label}
                  </SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right" align="start">
                  {opt.description}
                </TooltipContent>
              </Tooltip>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[10px] text-muted-foreground/50 ml-12">
        Simple → brief overview; Extreme → granular systematic breakdown
      </p>
    </div>
  )
}