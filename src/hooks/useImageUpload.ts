import { useState, useRef, useCallback, useEffect } from 'react'

export function useImageUpload() {
  const [imageB64, setImageB64] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result
      if (typeof result !== 'string') return
      const b64 = result.split(',')[1]
      if (!b64) return
      setImageB64(b64)
      setImageSrc(prev => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0])
  }, [readFile])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0]
    if (file?.type.startsWith('image/')) readFile(file)
  }, [readFile])

  const clear = useCallback(() => {
    if (imageSrc?.startsWith('blob:')) URL.revokeObjectURL(imageSrc)
    setImageB64(null)
    setImageSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [imageSrc])

  useEffect(() => {
    return () => {
      if (imageSrc?.startsWith('blob:')) URL.revokeObjectURL(imageSrc)
    }
  }, [imageSrc])

  return {
    imageB64,
    imageSrc,
    dragOver,
    setDragOver,
    fileInputRef,
    readFile,
    handleDrop,
    handlePaste,
    clear,
  }
}