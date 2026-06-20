import { useRef, useState, useEffect } from 'react'
import { useProjectStore } from '../../lib/store/projectStore'
import { SectionRenderer } from '../sections'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  previewMode: boolean
}

export function EditorCanvas({ previewMode }: Props) {
  const { project, activeSectionId, setActiveSectionId } = useProjectStore()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [zoomMode, setZoomMode] = useState<'auto' | 'custom'>('auto')
  const [zoomScale, setZoomScale] = useState(1)

  // Auto-scale handler
  useEffect(() => {
    if (zoomMode !== 'auto') return

    const handleResize = () => {
      if (!containerRef.current) return
      const parentWidth = containerRef.current.clientWidth - 48
      const targetWidth = 1600
      
      if (parentWidth < targetWidth) {
        setZoomScale(parentWidth / targetWidth)
      } else {
        setZoomScale(1)
      }
    }

    handleResize()
    
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [zoomMode, project.sections.length, previewMode])

  const [touchStartDist, setTouchStartDist] = useState<number | null>(null)
  const [initialScale, setInitialScale] = useState<number>(1)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setTouchStartDist(dist)
      setInitialScale(zoomScale)
      setZoomMode('custom')
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / touchStartDist
      const newScale = Math.min(1.5, Math.max(0.2, initialScale * factor))
      setZoomScale(newScale)
    }
  }

  const handleTouchEnd = () => {
    setTouchStartDist(null)
  }

  const sortedSections = [...project.sections].sort((a, b) => a.order - b.order)

  return (
    <div className="flex-1 bg-[#1e1e24] overflow-hidden flex flex-col relative h-full">
      {!previewMode && (
        <div className="absolute bottom-4 right-4 bg-zinc-950/80 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-3 z-30 backdrop-blur-md shadow-2xl">
          <button 
            onClick={() => {
              setZoomMode('custom')
              setZoomScale(prev => Math.max(0.2, prev - 0.1))
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Alejar Zoom"
          >
            <ZoomOut size={14} />
          </button>
          
          <span className="font-mono text-xs text-white min-w-10 text-center select-none font-semibold">
            {Math.round(zoomScale * 100)}%
          </span>
          
          <button 
            onClick={() => {
              setZoomMode('custom')
              setZoomScale(prev => Math.min(1.5, prev + 0.1))
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Acercar Zoom"
          >
            <ZoomIn size={14} />
          </button>

          <div className="w-px h-3 bg-white/10" />

          <button
            onClick={() => setZoomMode('auto')}
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all ${
              zoomMode === 'auto'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('canvas.zoomFit')}
          </button>
        </div>
      )}

      {/* Outer Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex justify-center items-start custom-scrollbar"
        onClick={() => !previewMode && setActiveSectionId(null)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Scaled Inner Wrapper */}
        <div 
          style={{
            width: '1600px',
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 150ms ease-out',
            marginBottom: `${(1600 * (1 - zoomScale)) * -1}px`
          }}
          className="shadow-2xl border border-white/5 rounded-2xl overflow-hidden shrink-0 flex flex-col"
        >
          {sortedSections.length === 0 ? (
            <div className="bg-[#13131a] p-24 text-center border border-white/5 rounded-2xl text-zinc-400">
              <p className="text-lg font-semibold mb-2">{t('canvas.emptyTitle')}</p>
              <p className="text-sm opacity-60">{t('canvas.emptyDesc')}</p>
            </div>
          ) : (
            sortedSections.map((sec) => (
              <SectionRenderer
                key={sec.id}
                section={sec}
                isEditing={!previewMode && activeSectionId === sec.id}
                onClick={() => !previewMode && setActiveSectionId(sec.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
