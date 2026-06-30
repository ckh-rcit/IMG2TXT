import { ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  imageSrc: string | null
  dragOver: boolean
  setDragOver: (v: boolean) => void
  handleDrop: (e: React.DragEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  readFile: (file: File) => void
}

export function ImageUpload({
  imageSrc,
  dragOver,
  setDragOver,
  handleDrop,
  fileInputRef,
  readFile,
}: ImageUploadProps) {
  return (
    <div
      className={`relative flex items-center justify-center h-80 rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${
        dragOver
          ? 'border-muted-foreground bg-accent'
          : imageSrc
          ? 'border-border bg-card'
          : 'border-border bg-card hover:border-muted-foreground hover:bg-accent/50'
      }`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
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
        onChange={e => { if (e.target.files?.[0]) readFile(e.target.files[0]) }}
      />
    </div>
  )
}