import { useState, useRef, useCallback } from 'react'

export function useImageUpload() {
  const [imageB64, setImageB64] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const b64 = (e.target?.result as string).split(',')[1]
      setImageB64(b64)
      setImageSrc(URL.createObjectURL(file))
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
    setImageB64(null)
    setImageSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

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