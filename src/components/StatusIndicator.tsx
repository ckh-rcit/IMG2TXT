import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  color: string
  pulsing: boolean
  message: string
}

export function StatusIndicator({ color, pulsing, message }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground min-h-5">
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', color, pulsing && 'animate-pulse')} />
      <span>{message}</span>
    </div>
  )
}