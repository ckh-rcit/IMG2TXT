import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModelSelectorProps {
  models: { name: string; isVision: boolean; isCloud: boolean }[]
  selectedModel: string
  setSelectedModel: (v: string) => void
  fetchModels: () => void
}

export function ModelSelector({
  models,
  selectedModel,
  setSelectedModel,
  fetchModels,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-muted-foreground w-12 shrink-0">Model</label>
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="flex-1 h-9 text-sm">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {models.map(m => (
            <SelectItem key={m.name} value={m.name} className="pr-8">
              <span className="flex items-center gap-1.5">
                {m.name}
                {m.isVision && <Badge className="bg-orange-500/15 text-orange-500 text-[10px] px-1.5 py-0 font-normal border-0">vision</Badge>}
                {m.isCloud && <Badge className="bg-blue-500/15 text-blue-500 text-[10px] px-1.5 py-0 font-normal border-0">cloud</Badge>}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={fetchModels} title="Refresh models">
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}