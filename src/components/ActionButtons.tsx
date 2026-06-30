import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActionButtonsProps {
  onDescribe: () => void
  disabled: boolean
  onClear: () => void
  clearDisabled: boolean
}

export function ActionButtons({ onDescribe, disabled, onClear, clearDisabled }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button className="flex-1" onClick={onDescribe} disabled={disabled}>
        <FileText className="h-4 w-4" />
        Describe
      </Button>
      <Button variant="outline" className="flex-1" onClick={onClear} disabled={clearDisabled}>
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>
    </div>
  )
}