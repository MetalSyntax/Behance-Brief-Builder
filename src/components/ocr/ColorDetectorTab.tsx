import { useState, useRef } from 'react'
import { Palette, Globe, Upload, Check, AlertTriangle, ArrowRight, Loader } from 'lucide-react'
import { useProjectStore } from '../../lib/store/projectStore'
import { useToast } from '../shared/ToastProvider'
import { detectColorsFromImage, getLuminance, contrastRatio } from '../../lib/utils/colorDetector'
import type { DetectedColor } from '../../lib/utils/colorDetector'

interface Props {
  sectionId: string
  onClose: () => void
}

export function ColorDetectorTab({ sectionId, onClose }: Props) {
  const { updateSectionStyle, updateCustomTheme } = useProjectStore()
  const toast = useToast()
  
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [colors, setColors] = useState<DetectedColor[]>([])
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProcessImage = async (source: File | string) => {
    setLoading(true)
    setError(null)
    try {
      if (source instanceof File) {
        setPreviewSrc(URL.createObjectURL(source))
      } else {
        setPreviewSrc(source)
      }

      const detected = await detectColorsFromImage(source)
      if (detected.length === 0) {
        setError('No se pudieron extraer los colores de la imagen. Intenta con otra.')
      } else {
        setColors(detected)
        toast.success('Paleta de colores detectada con éxito.')
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Error al analizar los colores de la imagen. Verifica CORS o formato.')
    } finally {
      setLoading(false)
    }
  }

  // Handle URL analyze (image or landing page)
  const handleAnalyzeUrl = async () => {
    if (!imageUrl.trim()) return
    const targetUrl = imageUrl.trim()

    // If it's a website landing page and not a direct image URL, get a screenshot first
    const isWebsite = targetUrl.startsWith('http') && !/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(targetUrl)

    if (isWebsite) {
      setLoading(true)
      setError(null)
      toast.info('Capturando landing page para análisis de color...')
      
      // Try Microlink first with fullPage rendering and 3s delay for lazy assets
      const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&screenshot.fullPage=true&screenshot.waitFor=3000&embed=screenshot.url`
      
      const checkImg = new Image()
      checkImg.crossOrigin = 'anonymous'
      checkImg.src = microlinkUrl
      
      checkImg.onload = () => {
        handleProcessImage(microlinkUrl)
      }

      checkImg.onerror = () => {
        // Fallback to Thum.io
        const thumioUrl = `https://image.thum.io/get/width/1280/crop/800/${targetUrl}`
        const checkFallback = new Image()
        checkFallback.crossOrigin = 'anonymous'
        checkFallback.src = thumioUrl
        
        checkFallback.onload = () => {
          handleProcessImage(thumioUrl)
        }
        checkFallback.onerror = () => {
          // Fallback to s-shot (height=0 triggers full page height render)
          const sshotUrl = `https://mini.s-shot.ru/1920x0/PNG/1920/?${targetUrl}`
          handleProcessImage(sshotUrl)
        }
      }
    } else {
      // Direct image URL
      handleProcessImage(targetUrl)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessImage(file)
    }
  }

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true)
    } else if (e.type === 'dragleave') {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessImage(file)
    }
  }

  // Applying palette options
  const applyColorsToSection = () => {
    const primary = colors.find(c => c.role === 'primary')?.hex
    const secondary = colors.find(c => c.role === 'secondary')?.hex
    const text = colors.find(c => c.role === 'text')?.hex

    if (!primary || !text) {
      toast.error('Falta detectar colores válidos para aplicar.')
      return
    }

    updateSectionStyle(sectionId, {
      background: primary,
      textColor: text,
      accentColor: secondary || text
    })

    toast.success('Paleta aplicada con éxito a la sección.')
    onClose()
  }

  const applyColorsToGlobalTheme = () => {
    const primary = colors.find(c => c.role === 'primary')?.hex
    const secondary = colors.find(c => c.role === 'secondary')?.hex
    const text = colors.find(c => c.role === 'text')?.hex

    if (!primary || !text) return

    updateCustomTheme({
      '--bg': primary,
      '--bg-section': primary,
      '--bg-card': secondary || primary,
      '--text': text,
      '--text-muted': text + 'cc',
      '--accent': secondary || text,
      '--border': text + '22'
    })

    toast.success('Paleta aplicada con éxito al Tema Global.')
    onClose()
  }

  // Compute contrast warnings
  const getContrastReport = () => {
    const primary = colors.find(c => c.role === 'primary')
    const text = colors.find(c => c.role === 'text')
    if (!primary || !text) return null

    const pLum = getLuminance(primary.rgb.r, primary.rgb.g, primary.rgb.b)
    const tLum = getLuminance(text.rgb.r, text.rgb.g, text.rgb.b)
    const ratio = Math.round(contrastRatio(pLum, tLum) * 10) / 10

    const isWcagAA = ratio >= 4.5

    return {
      ratio,
      isWcagAA,
      suggestion: !isWcagAA
        ? `La relación de contraste es de ${ratio}:1, inferior al mínimo WCAG AA de 4.5:1. Te sugerimos oscurecer o aclarar el color de texto para asegurar una correcta legibilidad.`
        : `¡Relación de contraste excelente de ${ratio}:1! Cumple con las pautas de accesibilidad WCAG AA.`
    }
  }

  const contrastReport = getContrastReport()

  return (
    <div className="space-y-6">
      {!previewSrc && !loading && (
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? 'border-violet-500 bg-violet-500/5'
                : 'border-white/10 hover:border-violet-500/30 bg-white/[0.01]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mx-auto mb-4">
              <Upload size={22} />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Sube una captura o imagen de tu landing
            </p>
            <p className="text-xs text-zinc-500">
              Arrastra y suelta aquí, o haz clic para explorar tus archivos
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <span className="relative px-3 bg-[#13131a] text-[10px] text-zinc-500 font-mono uppercase">
              O usa una URL
            </span>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Pega URL de imagen o sitio web (ej. https://landing.com)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={handleAnalyzeUrl}
              disabled={!imageUrl.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Analizar</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader className="text-violet-500 animate-spin" size={28} />
          <p className="text-sm font-semibold text-white">Analizando paleta de colores...</p>
          <p className="text-[10px] text-zinc-500">Escaneando contrastes y proporciones de píxeles</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex flex-col gap-2">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => {
              setPreviewSrc(null)
              setColors([])
              setError(null)
            }}
            className="self-start px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
          >
            Volver a intentar
          </button>
        </div>
      )}

      {colors.length > 0 && !loading && (
        <div className="space-y-6">
          {/* Main layout: preview + colors */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Preview */}
            <div className="md:col-span-5 border border-white/5 rounded-xl overflow-hidden bg-zinc-950/60 aspect-[4/3] flex items-center justify-center p-2">
              <img src={previewSrc!} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
            </div>

            {/* Right Color List */}
            <div className="md:col-span-7 space-y-4">
              <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                Colores Detectados (Top 4)
              </div>

              <div className="grid grid-cols-1 gap-2">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border border-white/10 shadow-inner shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-white uppercase">{c.hex}</span>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">
                            {c.role === 'primary' ? 'Primario' : c.role === 'secondary' ? 'Secundario' : c.role === 'tertiary' ? 'Terciario' : 'Texto'}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          RGB: {c.rgb.r}, {c.rgb.g}, {c.rgb.b}
                        </span>
                      </div>
                    </div>
                    
                    <span className="font-mono font-bold text-xs text-violet-400">
                      {c.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions & WCAG Checker */}
          {contrastReport && (
            <div className={`p-4 rounded-xl border flex gap-3 items-start text-xs ${
              contrastReport.isWcagAA
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <div className="shrink-0 mt-0.5">
                {contrastReport.isWcagAA ? <Check size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div>
                <p className="font-semibold mb-1">
                  Relación de Contraste: {contrastReport.ratio}:1 ({contrastReport.isWcagAA ? 'WCAG AA Aprobado' : 'WCAG AA Fallido'})
                </p>
                <p className="opacity-80 leading-relaxed">
                  {contrastReport.suggestion}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <button
              onClick={() => {
                setPreviewSrc(null)
                setColors([])
                setImageUrl('')
              }}
              className="px-3 py-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Analizar otro
            </button>

            <div className="flex gap-2">
              <button
                onClick={applyColorsToSection}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Palette size={13} />
                <span>Aplicar a esta Sección</span>
              </button>
              
              <button
                onClick={applyColorsToGlobalTheme}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Check size={13} />
                <span>Aplicar a Tema Global</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
