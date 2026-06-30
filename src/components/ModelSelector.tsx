import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RECOMMENDED_MODELS } from '@/hooks/useModels'

interface ModelSelectorProps {
  models: { name: string; displayName: string; isVision: boolean; isCloud: boolean }[]
  selectedModel: string
  setSelectedModel: (v: string) => void
  fetchModels: () => void
  pullModel: (name: string) => void
  pullStatus: 'idle' | 'pulling' | 'success' | 'error'
  pullProgress: string
}

export function ModelSelector({
  models,
  selectedModel,
  setSelectedModel,
  fetchModels,
  pullModel,
  pullStatus,
  pullProgress,
}: ModelSelectorProps) {
  const isPulling = pullStatus === 'pulling'
  const missingRecommended = RECOMMENDED_MODELS.filter(r => !models.some(m => m.name === r))

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="text-xs font-medium text-muted-foreground w-12 shrink-0 cursor-help">Model</label>
          </TooltipTrigger>
          <TooltipContent side="bottom">Select a vision model</TooltipContent>
        </Tooltip>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map(m => (
              <SelectItem key={m.name} value={m.name} className="pr-8">
                <span className="flex items-center gap-1.5">
                  {m.displayName}
                  {m.isVision && <Badge className="bg-orange-500/15 text-orange-500 text-[10px] px-1.5 py-0 font-normal border-0">vision</Badge>}
                  {m.isCloud && <Badge className="bg-blue-500/15 text-blue-500 text-[10px] px-1.5 py-0 font-normal border-0">cloud</Badge>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tooltip>
<TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={fetchModels}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
          <TooltipContent side="bottom">Refresh model list</TooltipContent>
        </Tooltip>
        {missingRecommended.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => pullModel(missingRecommended[0])}
                disabled={isPulling}
              >
                {isPulling ? <span className="animate-spin">⏳</span> : <Download className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isPulling ? (
                <div className="space-y-1.5 min-w-[200px]">
                  <div className="flex items-center gap-2 text-xs">
                    <span>Downloading...</span>
                    <span className="text-muted-foreground">{pullProgress}</span>
                  </div>
                  <Progress value={pullStatus === 'pulling' ? 50 : 100} className="h-1.5" />
                </div>
              ) : (
                'Pull recommended model'
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}