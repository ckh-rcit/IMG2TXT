import { Sun, Moon } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface HeaderProps {
  dark: boolean
  onToggle: () => void
}

export function Header({ dark, onToggle }: HeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-6 py-4">
        <span className="font-display text-sm font-semibold tracking-tight bg-gradient-to-r from-foreground to-neutral-500 bg-clip-text text-transparent">
          IMG2TXT
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Switch to {dark ? 'light' : 'dark'} mode
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}