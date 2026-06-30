import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, RotateCcw, FileText, Copy, Check, Trash2, Sun, Moon } from 'lucide-react'

const PROMPTS: Record<string, string> = {
  default: 'Describe this image in detail.',
  ocr: 'Extract all text visible in this image. Return ONLY the extracted text with no additional output, commentary, or formatting. Stop immediately after outputting the text.',
  flux1: `Analyze this image and produce a detailed text-to-image prompt for FLUX.1-dev. Use natural language structured around these elements: SUBJECT (who/what is the focus), LOCATION (setting/environment), STYLE (artistic direction), CAMERA SETTINGS (perspective, lens, shot type), LIGHTING (quality, source, direction), COLORS (dominant palette), EFFECTS (atmosphere, mood, visual treatments), and any ADDITIONAL ELEMENTS. Write as a fluid, descriptive sentence that could recreate this image faithfully. Include specific visual details, textures, spatial relationships, and composition notes.`,
  flux2: `Analyze this image and produce a detailed text-to-image prompt for FLUX.2. Structure it as: Subject + Action + Style + Context. Place the most important elements first (priority order: main subject, key action, critical style, essential context, secondary details). For photorealism, specify camera model, lens, and film stock (e.g. "shot on Sony A7IV, 85mm f/1.4"). Use hex color codes for precise color matching where relevant (e.g. "color #C4725A"). Describe what IS present — no negative phrasing. Write a clear, natural language description that could recreate this image.`,
}

type Status = 'idle' | 'sending' | 'generating' | 'done' | 'error'

const VISION_PREFIXES = [
  'llava', 'moondream', 'bakllava', 'gemma3', 'gemma4',
  'llama3.2-vision', 'llama3.3-vision',
  'qwen2-vl', 'qwen2.5-vl', 'qwen3-vl', 'qwen3.5',
  'minicpm-v', 'pixtral', 'smolvlm', 'phi3-vision',
  'cogvlm', 'deepseek-vl', 'internvl', 'xgen-mm', 'yi-vision',
  'llava-llama3', 'llava-phi3', 'tinyllava',
  'glm-ocr', 'glm4v', 'glm',
]
const PRIORITY = [
  'llava', 'moondream', 'bakllava', 'gemma3', 'gemma4',
  'llama3.2-vision', 'pixtral', 'qwen2-vl', 'qwen3-vl', 'qwen3.5', 'glm',
]

function guessVision(model: { name: string; details?: { families?: string[] } }): boolean {
  const fam = model.details?.families ?? []
  if (fam.some((f) => ['clip', 'vit', 'vision'].includes(f))) return true
  const n = model.name.toLowerCase()
  return VISION_PREFIXES.some((p) => n.startsWith(p))
}

function guessCloud(name: string): boolean {
  return name.toLowerCase().includes(':cloud')
}

function cleanOutput(text: string): string {
  let s = text.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }
  return s
}

interface OllamaModel {
  name: string
  details?: { families?: string[] }
}

function App() {
  const [imageB64, setImageB64] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [models, setModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState('default')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('Drop an image to get started')
  const [copied, setCopied] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descEndRef = useRef<HTMLDivElement>(null)
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    return stored ? stored === 'dark' : true
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/tags')
      if (!res.ok) throw Error()
      const data = await res.json()
      const all = (data.models ?? []) as OllamaModel[]
      const sorted = [...all].sort((a, b) => Number(guessVision(b)) - Number(guessVision(a)))
      setModels(sorted)
      setStatusMsg(`${all.length} model(s), ${sorted.filter(guessVision).length} vision-capable`)
      const found = PRIORITY.find((p) => sorted.some((m) => m.name.startsWith(p)))
      if (found) setSelectedModel(sorted.find((m) => m.name.startsWith(found))!.name)
      else if (sorted.length) setSelectedModel(sorted[0].name)
    } catch {
      setStatus('error')
      setStatusMsg('Could not reach Ollama at localhost:11434')
    }
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  useEffect(() => {
    if (descEndRef.current) descEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [description])

  const setStatusAll = useCallback((s: Status, msg: string) => {
    setStatus(s)
    setStatusMsg(msg)
  }, [])

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusAll('error', 'Not a valid image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      setImageSrc(data)
      setImageB64(data.split(',')[1])
      setStatusAll('idle', 'Image loaded.')
    }
    reader.onerror = () => setStatusAll('error', 'Failed to read file.')
    reader.readAsDataURL(file)
  }, [setStatusAll])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }, [readFile])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const file = e.clipboardData?.files?.[0]
    if (file?.type.startsWith('image/')) readFile(file)
  }, [readFile])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const clearAll = useCallback(() => {
    setImageB64(null)
    setImageSrc(null)
    setDescription('')
    setCopied(false)
    setStatusAll('idle', 'Cleared.')
  }, [setStatusAll])

  const describe = useCallback(async () => {
    if (!imageB64) return
    const prompt = PROMPTS[selectedPrompt] || PROMPTS.default
    const model = selectedModel || 'llava'
    setDescription('')
    setTokenCount(0)
    setStatusAll('sending', 'Sending to Ollama...')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt, images: [imageB64] }],
          stream: true,
          options: selectedPrompt === 'ocr' ? { num_predict: 512 } : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Ollama error (${res.status}): ${err}`)
      }

      setStatusAll('generating', 'Generating description...')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const json = JSON.parse(line)
            if (json.message?.content) {
              full += json.message.content
              setDescription(full)
            }
            if (json.done) {
              setStatusAll('done', 'Description complete.')
              if (json.eval_count) setTokenCount(json.eval_count)
            }
          } catch { /* skip partial */ }
        }
      }

      if (!full) {
        setStatusAll('error', 'Empty response from model.')
      } else {
        setDescription(cleanOutput(full))
        setStatusAll('done', 'Description complete.')
      }
    } catch (err) {
      setStatusAll('error', (err as Error).message.includes('fetch')
        ? 'Cannot reach Ollama at localhost:11434'
        : (err as Error).message)
    }
  }, [imageB64, selectedPrompt, selectedModel, setStatusAll])

  const copyDesc = useCallback(() => {
    navigator.clipboard.writeText(description).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [description])

  const statusColor = status === 'sending' ? 'bg-blue-500' :
    status === 'generating' ? 'bg-yellow-500' :
    status === 'done' ? 'bg-green-500' :
    status === 'error' ? 'bg-neutral-500' :
    'bg-neutral-700'

  const pulsing = status === 'sending' || status === 'generating'

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-6 py-4">
          <span className="font-display text-sm font-semibold tracking-tight bg-linear-to-r from-foreground to-neutral-500 bg-clip-text text-transparent">
            IMG2TXT
          </span>
          <button
            onClick={() => setDark(!dark)}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            title={`Switch to ${dark ? 'light' : 'dark'} mode`}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
      <div className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-5">
            <div
              className={`relative flex items-center justify-center h-80 rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${
                dragOver
                  ? 'border-muted-foreground bg-accent'
                  : imageSrc
                    ? 'border-border bg-card'
                    : 'border-border bg-card hover:border-muted-foreground hover:bg-accent/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageSrc ? (
                <img src={imageSrc} alt="Upload" className="max-w-full max-h-full object-contain p-3" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <p className="text-sm leading-relaxed text-center">
                    Drop an image here<br />or click to browse
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) readFile(e.target.files[0]) }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground w-12 shrink-0">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="flex-1 h-9 text-sm">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => {
                      const isVision = guessVision(m)
                      const isCloud = guessCloud(m.name)
                      return (
                        <SelectItem key={m.name} value={m.name} className="pr-8">
                          <span className="flex items-center gap-1.5">
                            {m.name}
                            {isVision && <Badge className="bg-orange-500/15 text-orange-500 text-[10px] px-1.5 py-0 font-normal border-0">vision</Badge>}
                            {isCloud && <Badge className="bg-blue-500/15 text-blue-500 text-[10px] px-1.5 py-0 font-normal border-0">cloud</Badge>}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={fetchModels} title="Refresh models">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground w-12 shrink-0">Prompt</label>
                <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                  <SelectTrigger className="flex-1 h-9 text-sm">
                    <SelectValue placeholder="Select prompt style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="ocr">OCR</SelectItem>
                    <SelectItem value="flux1">FLUX.1-dev</SelectItem>
                    <SelectItem value="flux2">FLUX.2-dev</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={describe} disabled={!imageB64 || status === 'sending' || status === 'generating'}>
                  <FileText className="h-4 w-4" />
                  Describe
                </Button>
                <Button variant="outline" className="flex-1" onClick={clearAll} disabled={!imageB64 && !description}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground min-h-5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor} ${pulsing ? 'animate-pulse' : ''}`} />
              <span>{statusMsg}</span>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-2">
            <ScrollArea className="h-115 rounded-xl border border-border bg-card">
              <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word min-h-full">
                {description || <span className="text-muted-foreground/40">Description will appear here</span>}
                <div ref={descEndRef} />
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between min-h-6">
              <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                {description.length} {description.length === 1 ? 'character' : 'characters'}
                {tokenCount > 0 && <> &middot; {tokenCount} tokens</>}
              </span>
              {description && (
                <Button variant="ghost" size="sm" className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground" onClick={copyDesc}>
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy description'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="pb-6 pt-2 text-center">
        <a
          href="https://github.com/ckh-rcit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <GithubIcon />
          ckh-rcit &middot; {new Date().getFullYear()}
        </a>
      </footer>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

export default App
