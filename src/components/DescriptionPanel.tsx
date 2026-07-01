import { Copy, Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useEffect, useRef } from 'react'

interface DescriptionPanelProps {
  description: string
  tokenCount: number
  copied: boolean
  isFluxPrompt: boolean
  cleanupApplied: boolean
  onCopy: () => void
}

export function DescriptionPanel({ description, tokenCount, copied, isFluxPrompt, cleanupApplied, onCopy }: DescriptionPanelProps) {
  const descEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    descEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [description])

  return (
    <div className="space-y-2">
      <ScrollArea className="h-140 rounded-xl border border-border bg-card">
        <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-full">
          {description || <span className="text-muted-foreground/40">Description will appear here</span>}
          <div ref={descEndRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between min-h-6">
        <span className="text-[11px] text-muted-foreground/50 tabular-nums">
          {description.length} {description.length === 1 ? 'character' : 'characters'}
          {tokenCount > 0 && <>&nbsp;&middot;&nbsp;{tokenCount} tokens</>}
          {isFluxPrompt && cleanupApplied && <>&nbsp;&middot;&nbsp;format cleaned</>}
        </span>
        {description && (
          <Button variant="ghost" size="sm" className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground" onClick={onCopy}>
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? 'Copied!' : 'Copy description'}
          </Button>
        )}
      </div>
    </div>
  )
}