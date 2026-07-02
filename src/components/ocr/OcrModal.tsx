import { useState, useEffect } from 'react'
import { X, ScanText, Loader, Palette } from 'lucide-react'
import { OcrDropZone } from './OcrDropZone'
import { OcrResultsPanel } from './OcrResultsPanel'
import { ColorDetectorTab } from './ColorDetectorTab'
import { extractTextFromImage } from '../../lib/ocr/ocrEngine'
import type { OcrBlock } from '../../lib/ocr/ocrEngine'
import { suggestFieldMappings } from '../../lib/ocr/textMapper'
import type { FieldMappingSuggestion } from '../../lib/ocr/textMapper'
import { useProjectStore } from '../../lib/store/projectStore'
import type { Section } from '../../lib/types/project.types'

interface Props {
  section: Section
  onClose: () => void
}

export function OcrModal({ section, onClose }: Props) {
  const updateSection = useProjectStore((state) => state.updateSection)
  
  const [activeModalTab, setActiveModalTab] = useState<'ocr' | 'colors'>('ocr')
  const [image, setImage] = useState<File | string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [blocks, setBlocks] = useState<OcrBlock[]>([])
  const [suggestions, setSuggestions] = useState<FieldMappingSuggestion[]>([])
  const [mappings, setMappings] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Start processing once image is loaded/dropped
  useEffect(() => {
    if (!image) return

    async function processOCR() {
      setLoading(true)
      setProgress(0)
      setError(null)
      try {
        const ocrResults = await extractTextFromImage(image!, (pct) => {
          setProgress(pct)
        })

        if (ocrResults.length === 0) {
          setError('No se detectó ningún bloque de texto en la imagen. Intenta con una imagen de mayor resolución o mejor contraste.')
          setLoading(false)
          return
        }

        setBlocks(ocrResults)
        const fieldSuggestions = suggestFieldMappings(ocrResults, section.type)
        setSuggestions(fieldSuggestions)

        // Pre-fill mapping suggestions with high confidence
        const initialMappings: Record<number, string> = {}
        fieldSuggestions.forEach((s) => {
          if (s.confidence >= 40) {
            initialMappings[s.blockIndex] = s.suggestedField
          }
        })
        setMappings(initialMappings)
      } catch (err) {
        console.error(err)
        setError('Ocurrió un error al procesar la imagen con OCR. Por favor verifica que la imagen no esté corrupta.')
      } finally {
        setLoading(false)
      }
    }

    processOCR()
  }, [image, section.type])

  const handleMappingChange = (blockIndex: number, fieldName: string) => {
    setMappings((prev) => ({
      ...prev,
      [blockIndex]: fieldName,
    }))
  }

  const handleBlockTextChange = (blockIndex: number, newText: string) => {
    setBlocks((prev) => {
      const updated = [...prev]
      updated[blockIndex] = { ...updated[blockIndex], text: newText }
      return updated
    })
  }

  const handleReset = () => {
    setImage(null)
    setBlocks([])
    setSuggestions([])
    setMappings({})
    setProgress(0)
    setError(null)
  }

  const handleApply = () => {
    const patch: any = {}
    
    // Simple text mappings
    const getMappedText = (fieldName: string) => {
      const idx = Object.keys(mappings).find((k) => mappings[Number(k)] === fieldName)
      return idx !== undefined ? blocks[Number(idx)].text : null
    }

    const titleVal = getMappedText('title')
    const subTitleVal = getMappedText('subtitle') || getMappedText('description')
    const eyebrowVal = getMappedText('eyebrow')
    const sectionNumVal = getMappedText('sectionNumber')
    const pageCounterVal = getMappedText('pageCounter')
    const contextTextVal = getMappedText('contextText') || getMappedText('description')

    if (titleVal !== null) patch.title = titleVal
    if (subTitleVal !== null) {
      if (section.data.subtitle !== undefined) patch.subtitle = subTitleVal
      if (section.data.description !== undefined) patch.description = subTitleVal
    }
    if (eyebrowVal !== null) patch.eyebrow = eyebrowVal
    if (sectionNumVal !== null) patch.sectionNumber = sectionNumVal
    if (pageCounterVal !== null) patch.pageCounter = pageCounterVal
    if (contextTextVal !== null) {
      if (section.data.contextText !== undefined) patch.contextText = contextTextVal
    }

    // List pairings: metrics
    const metricLabels = blocks.filter((_, idx) => mappings[idx] === 'metric.label').map((b) => b.text)
    const metricValues = blocks.filter((_, idx) => mappings[idx] === 'metric.value').map((b) => b.text)
    if (metricLabels.length > 0 || metricValues.length > 0) {
      const existingMetrics = section.data.metrics || []
      const maxLength = Math.max(metricLabels.length, metricValues.length)
      const mergedMetrics = []

      for (let i = 0; i < maxLength; i++) {
        mergedMetrics.push({
          label: metricLabels[i] || (existingMetrics[i]?.label || 'Métrica'),
          value: metricValues[i] || (existingMetrics[i]?.value || '0'),
        })
      }
      patch.metrics = mergedMetrics
    }

    // List pairings: process steps / color palette items
    const itemTitles = blocks.filter((_, idx) => mappings[idx] === 'item.title').map((b) => b.text)
    const itemValues = blocks.filter((_, idx) => mappings[idx] === 'item.value').map((b) => b.text)
    if (itemTitles.length > 0 || itemValues.length > 0) {
      const maxLength = Math.max(itemTitles.length, itemValues.length)
      
      if (section.type === 'process') {
        const existingSteps = section.data.steps || []
        const mergedSteps = []
        for (let i = 0; i < maxLength; i++) {
          mergedSteps.push({
            title: itemTitles[i] || (existingSteps[i]?.title || 'Paso'),
            description: itemValues[i] || (existingSteps[i]?.description || ''),
            icon: existingSteps[i]?.icon || 'ArrowRight',
          })
        }
        patch.steps = mergedSteps
      } else if (section.type === 'color-palette') {
        const existingColors = section.data.colors || []
        const mergedColors = []
        for (let i = 0; i < maxLength; i++) {
          mergedColors.push({
            name: itemTitles[i] || (existingColors[i]?.name || 'Color'),
            hex: existingColors[i]?.hex || '#888888',
            role: itemValues[i] || (existingColors[i]?.role || ''),
          })
        }
        patch.colors = mergedColors
      }
    }

    // Update section store data
    updateSection(section.id, patch)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-[#13131a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#18181f] shrink-0">
          <div className="flex items-center gap-2 text-violet-400">
            {activeModalTab === 'ocr' ? <ScanText size={18} /> : <Palette size={18} />}
            <h2 className="font-bold text-sm text-white tracking-tight uppercase">
              Estudio de Análisis y Paleta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        {/* Tab Selector */}
        <div className="flex bg-[#18181f] px-6 py-2 border-b border-white/5 gap-5 shrink-0 select-none">
          <button
            onClick={() => setActiveModalTab('ocr')}
            className={`pb-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border-b-2 tracking-wider ${
              activeModalTab === 'ocr'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Extracción de Texto (OCR)
          </button>
          <button
            onClick={() => setActiveModalTab('colors')}
            className={`pb-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border-b-2 tracking-wider ${
              activeModalTab === 'colors'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Detector de Colores (Paleta)
          </button>
        </div>

        {/* Content */}
        <main className="p-6 flex-1 overflow-y-auto min-h-[350px] custom-scrollbar">
          {activeModalTab === 'ocr' ? (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex flex-col gap-2">
                  <p className="font-semibold">{error}</p>
                  <button
                    onClick={handleReset}
                    className="self-start px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
                  >
                    Intentar con otra imagen
                  </button>
                </div>
              )}

              {!image && !loading && <OcrDropZone onImageSelected={setImage} />}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader className="text-violet-500 animate-spin" size={32} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Analizando imagen con OCR...</p>
                    <p className="text-[11px] text-zinc-500">Ejecutando WebAssembly local en tu navegador</p>
                  </div>
                  <div className="w-64 bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-violet-600 h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-violet-400">{progress}%</span>
                </div>
              )}

              {blocks.length > 0 && !loading && (
                <OcrResultsPanel
                  blocks={blocks}
                  suggestions={suggestions}
                  sectionType={section.type}
                  mappings={mappings}
                  onMappingChange={handleMappingChange}
                  onBlockTextChange={handleBlockTextChange}
                  onApply={handleApply}
                  onReset={handleReset}
                />
              )}
            </>
          ) : (
            <ColorDetectorTab sectionId={section.id} onClose={onClose} />
          )}
        </main>
      </div>
    </div>
  )
}
