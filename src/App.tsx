import { useState, useEffect, useCallback } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { ModelSelector } from '@/components/ModelSelector'
import { ModeSelector } from '@/components/ModeSelector'
import { PromptSelector } from '@/components/PromptSelector'
import { DetailSelector } from '@/components/DetailSelector'
import { ActionButtons } from '@/components/ActionButtons'
import { StatusIndicator } from '@/components/StatusIndicator'
import { DescriptionPanel } from '@/components/DescriptionPanel'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/hooks/useTheme'
import { useModels } from '@/hooks/useModels'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useDescription } from '@/hooks/useDescription'
import type { PromptType, Mode } from '@/types'

function App() {
  const { dark, toggle } = useTheme()
  const { models, selectedModel, setSelectedModel, fetchModels, pullModel, pullStatus, pullProgress } = useModels()
  const { imageB64, imageSrc, dragOver, setDragOver, fileInputRef, handleDrop, handlePaste, readFile, clear: clearImage } = useImageUpload()
  const [status, setStatus] = useState<'idle' | 'sending' | 'generating' | 'done' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('Drop an image to get started')
  const [copied, setCopied] = useState(false)
  const [selectedMode, setSelectedMode] = useState<Mode>('img2txt')
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>('default')
  const [selectedDetail, setSelectedDetail] = useState<string>('detailed')

  const setStatusAll = useCallback((s: typeof status, msg: string) => {
    setStatus(s)
    setStatusMsg(msg)
  }, [])

  const { description, setDescription, tokenCount, generate } = useDescription({ setStatus: setStatusAll })

  useEffect(() => { fetchModels() }, [fetchModels])

  useEffect(() => {
    if (selectedMode === 'imgocr') {
      const ocrModel = models.find(m => m.isOcr)
      if (ocrModel && selectedModel !== ocrModel.name) {
        setSelectedModel(ocrModel.name)
      }
    }
  }, [selectedMode, models, selectedModel, setSelectedModel])

  const clearAll = useCallback(() => {
    clearImage()
    setDescription('')
    setCopied(false)
    setStatusAll('idle', 'Cleared.')
  }, [clearImage, setDescription, setStatusAll])

  const copyDesc = useCallback(() => {
    navigator.clipboard.writeText(description).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [description])

  const handleDescribe = useCallback(() => {
    if (!imageB64 || !selectedModel) return
    const promptType = selectedMode === 'imgocr' ? 'ocr' : selectedPrompt
    generate(imageB64, promptType, selectedDetail, selectedModel)
  }, [imageB64, selectedModel, selectedMode, selectedPrompt, selectedDetail, generate])

  useEffect(() => {
    const handler = (e: ClipboardEvent) => handlePaste(e as unknown as React.ClipboardEvent)
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [handlePaste])

  const statusColor = status === 'sending' ? 'bg-blue-500' :
    status === 'generating' ? 'bg-yellow-500' :
    status === 'done' ? 'bg-green-500' :
    status === 'error' ? 'bg-neutral-500' :
    'bg-neutral-700'

  const pulsing = status === 'sending' || status === 'generating'

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header dark={dark} onToggle={toggle} />
      <div className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <ImageUpload
              imageSrc={imageSrc}
              dragOver={dragOver}
              setDragOver={setDragOver}
              handleDrop={handleDrop}
              fileInputRef={fileInputRef}
              readFile={readFile}
            />
            <div className="space-y-3">
              <ModeSelector
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
              />
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                fetchModels={fetchModels}
                pullModel={pullModel}
                pullStatus={pullStatus}
                pullProgress={pullProgress}
              />
              {selectedMode === 'img2txt' && (
                <>
                  <PromptSelector
                    selectedPrompt={selectedPrompt}
                    setSelectedPrompt={setSelectedPrompt}
                    mode={selectedMode}
                  />
                  <DetailSelector
                    selectedDetail={selectedDetail}
                    setSelectedDetail={setSelectedDetail}
                  />
                </>
              )}
              <ActionButtons
                onDescribe={handleDescribe}
                disabled={!imageB64 || status === 'sending' || status === 'generating'}
                onClear={clearAll}
                clearDisabled={!imageB64 && !description}
              />
            </div>
            <StatusIndicator
              color={statusColor}
              pulsing={pulsing}
              message={statusMsg}
            />
          </div>

          <DescriptionPanel
            description={description}
            tokenCount={tokenCount}
            copied={copied}
            onCopy={copyDesc}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App