import { useRef, useState, useEffect } from 'react'
import type { Section, MockupsData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'
import { Upload, X } from 'lucide-react'

import { getTitleClass, getSubtitleClass, getAlignmentContainerClass, getTextAlignClass, getCardRadiusStyle } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: MockupsData }
  isEditing: boolean
  onClick?: () => void
}

function MockupFrame({ 
  image, 
  alt, 
  deviceFrame, 
  scrollOffset = 0, 
  onScrollOffsetChange 
}: { 
  image: string
  alt: string
  deviceFrame: 'phone' | 'tablet' | 'browser' | 'none'
  scrollOffset?: number
  onScrollOffsetChange: (offset: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startScrollTop, setStartScrollTop] = useState(0)

  const getScreenshotUrl = (rawUrl: string, frame: string) => {
    if (!rawUrl) return ''
    if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.includes('api.microlink.io') || rawUrl.includes('image.thum.io') || rawUrl.includes('s-shot.ru')) {
      return rawUrl
    }
    const cleanUrl = rawUrl.split('?')[0].toLowerCase()
    const isImage = /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/.test(cleanUrl)
    
    if (!isImage && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      let width = 1280
      let height = 800
      let isMobile = false

      if (frame === 'phone') {
        width = 375
        height = 812
        isMobile = true
      } else if (frame === 'tablet') {
        width = 768
        height = 1024
        isMobile = true
      }

      const mobileParams = isMobile ? '&viewport.isMobile=true&viewport.hasTouch=true' : ''
      return `https://api.microlink.io/?url=${encodeURIComponent(rawUrl)}&screenshot=true&embed=screenshot.url&screenshot.fullPage=true&viewport.width=${width}&viewport.height=${height}${mobileParams}`
    }
    return rawUrl
  }

  // Centralized fallback state for screenshot urls
  const [currentSrc, setCurrentSrc] = useState(() => getScreenshotUrl(image, deviceFrame))
  const [fallbackLevel, setFallbackLevel] = useState(0)

  useEffect(() => {
    setCurrentSrc(getScreenshotUrl(image, deviceFrame))
    setFallbackLevel(0)
  }, [image, deviceFrame])

  const handleImageError = () => {
    let originalUrl = image
    if (currentSrc.includes('api.microlink.io')) {
      try {
        const urlParams = new URLSearchParams(currentSrc.split('?')[1])
        const targetUrl = urlParams.get('url')
        if (targetUrl) originalUrl = targetUrl
      } catch (err) {
        // ignore
      }
    }

    let width = 1280
    let height = 800
    if (deviceFrame === 'phone') {
      width = 375
      height = 812
    } else if (deviceFrame === 'tablet') {
      width = 768
      height = 1024
    }

    // Fallback to Thum.io with full page capture and exact width
    if (fallbackLevel === 0) {
      setCurrentSrc(`https://image.thum.io/get/width/${width}/crop/0/maxAge/12/${originalUrl}`)
      setFallbackLevel(1)
      return
    }
    // Fallback to s-shot.ru with exact width/height viewport
    if (fallbackLevel === 1) {
      setCurrentSrc(`https://mini.s-shot.ru/${width}x${height}/PNG/${width}/?${originalUrl}`)
      setFallbackLevel(2)
      return
    }
    
    // Final fallback: Premium layout template placeholder image
    setCurrentSrc('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80')
    setFallbackLevel(3)
  }

  // Sync scrollOffset from props
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const maxScroll = container.scrollHeight - container.clientHeight
      if (maxScroll > 0) {
        const targetScrollTop = (scrollOffset / 100) * maxScroll
        if (Math.abs(container.scrollTop - targetScrollTop) > 2) {
          container.scrollTop = targetScrollTop
        }
      }
    }
  }, [scrollOffset, currentSrc])

  // Handle native scroll/wheel/trackpad
  const handleScroll = () => {
    const container = containerRef.current
    if (container && !isDragging) {
      const maxScroll = container.scrollHeight - container.clientHeight
      if (maxScroll > 0) {
        const pct = Math.round((container.scrollTop / maxScroll) * 100)
        if (pct !== scrollOffset) {
          onScrollOffsetChange(pct)
        }
      }
    }
  }

  // Handle drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    const maxScroll = container.scrollHeight - container.clientHeight
    if (maxScroll <= 0) return

    setIsDragging(true)
    setStartY(e.pageY - container.offsetTop)
    setStartScrollTop(container.scrollTop)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const container = containerRef.current
    if (!container) return

    const y = e.pageY - container.offsetTop
    const walk = (y - startY) * 1.5
    container.scrollTop = startScrollTop - walk

    const maxScroll = container.scrollHeight - container.clientHeight
    if (maxScroll > 0) {
      const pct = Math.round((container.scrollTop / maxScroll) * 100)
      if (pct !== scrollOffset) {
        onScrollOffsetChange(pct)
      }
    }
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  if (deviceFrame === 'phone') {
    return (
      <div className="relative mx-auto my-auto w-full max-w-[60%] aspect-[9/19] bg-zinc-900 rounded-[38px] p-2.5 shadow-2xl border-4 border-zinc-800 ring-1 ring-white/10 flex flex-col overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-end px-3">
          <div className="w-1.5 h-1.5 bg-zinc-850 rounded-full mr-1" />
          <div className="w-1 h-1 bg-blue-900/50 rounded-full" />
        </div>
        {/* Screen */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`w-full h-full bg-zinc-950 rounded-[28px] overflow-y-auto overflow-x-hidden relative select-none scrollbar-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <img 
            src={currentSrc} 
            alt={alt} 
            draggable={false}
            onError={handleImageError}
            className="w-full h-auto object-contain pointer-events-none"
            onLoad={() => {
              const container = containerRef.current
              if (container) {
                const maxScroll = container.scrollHeight - container.clientHeight
                if (maxScroll > 0) {
                  container.scrollTop = (scrollOffset / 100) * maxScroll
                }
              }
            }}
          />
        </div>
      </div>
    )
  }

  if (deviceFrame === 'tablet') {
    return (
      <div className="relative mx-auto my-auto w-full aspect-[3/4] max-w-[90%] bg-zinc-900 rounded-[24px] p-3 shadow-2xl border-4 border-zinc-800 ring-1 ring-white/10 flex flex-col overflow-hidden">
        {/* Camera */}
        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-800 rounded-full z-20" />
        
        {/* Screen */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`w-full h-full bg-zinc-950 rounded-[14px] overflow-y-auto overflow-x-hidden relative select-none scrollbar-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <img 
            src={currentSrc} 
            alt={alt} 
            draggable={false}
            onError={handleImageError}
            className="w-full h-auto object-contain pointer-events-none"
            onLoad={() => {
              const container = containerRef.current
              if (container) {
                const maxScroll = container.scrollHeight - container.clientHeight
                if (maxScroll > 0) {
                  container.scrollTop = (scrollOffset / 100) * maxScroll
                }
              }
            }}
          />
        </div>
      </div>
    )
  }

  if (deviceFrame === 'browser') {
    return (
      <div className="relative w-full h-full flex flex-col bg-zinc-900 border border-white/15 rounded-lg shadow-2xl overflow-hidden aspect-[4/3] max-h-full">
        {/* Browser Topbar */}
        <div className="flex items-center px-4 py-2 bg-zinc-950 border-b border-white/10 shrink-0 select-none">
          <div className="flex space-x-1.5 mr-4 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
          </div>
          <div className="bg-zinc-800 text-[10px] text-zinc-400 px-3 py-0.5 rounded-md flex-1 text-center truncate select-none border border-white/5 font-mono max-w-xs mx-auto">
            brief-preview.local
          </div>
        </div>
        {/* Screen/Page */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex-1 w-full bg-zinc-950 overflow-y-auto overflow-x-hidden relative select-none scrollbar-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <img 
            src={currentSrc} 
            alt={alt} 
            draggable={false}
            onError={handleImageError}
            className="w-full h-auto object-contain pointer-events-none"
            onLoad={() => {
              const container = containerRef.current
              if (container) {
                const maxScroll = container.scrollHeight - container.clientHeight
                if (maxScroll > 0) {
                  container.scrollTop = (scrollOffset / 100) * maxScroll
                }
              }
            }}
          />
        </div>
      </div>
    )
  }

  // Default: Sin Frame
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <img 
        src={currentSrc} 
        alt={alt} 
        onError={handleImageError}
        className="max-h-full max-w-full object-contain rounded" 
      />
    </div>
  )
}

export function MockupsSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof MockupsData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleMockupUpdate = (index: number, field: string, val: any) => {
    const updatedMockups = [...(data.mockups || [])]
    updatedMockups[index] = { ...updatedMockups[index], [field]: val }
    handleUpdate('mockups', updatedMockups)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleMockupUpdate(index, 'image', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    handleMockupUpdate(index, 'image', '')
  }

  const getLayoutClass = () => {
    switch (data.layout) {
      case 'grid-3':
        return 'grid grid-cols-1 md:grid-cols-3 gap-8'
      case 'grid-4':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'
      case 'centered-large':
        return 'flex flex-col items-center max-w-4xl mx-auto gap-8 w-full'
      case 'scattered':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'
      case 'grid-2':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-8'
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: style.background,
        color: style.textColor,
        padding: style.padding || '100px 80px',
        '--section-accent': style.accentColor || 'var(--accent)',
      } as React.CSSProperties}
      className={`w-full overflow-hidden transition-all duration-300 ${
        isEditing ? 'ring-2 ring-accent ring-offset-2' : ''
      } cursor-pointer`}
    >
      <div className="max-w-[1120px] mx-auto w-full px-6">
        <div className={`mb-12 ${getTextAlignClass(style.textAlign)}`}>
          <div className={`${getAlignmentContainerClass(style.textAlign)} mb-2`}>
            {data.sectionNumber && (
              <EditableText
                value={data.sectionNumber}
                onChange={(val) => handleUpdate('sectionNumber', val)}
                isEditing={isEditing}
                tagName="span"
                hidden={style.hideSectionNumber}
                className="font-mono text-sm opacity-60 bg-white/5 border border-white/10 px-2 py-0.5 rounded"
              />
            )}
            
            <EditableText
              value={data.title}
              onChange={(val) => handleUpdate('title', val)}
              isEditing={isEditing}
              tagName="h2"
              hidden={style.hideTitle}
              className={`${getTitleClass(style.titleSize)} ${getTextAlignClass(style.textAlign)}`}
              style={{ fontFamily: 'var(--font-display)' }}
            />
          </div>
          
          {data.description !== undefined && (
            <EditableText
              value={data.description}
              onChange={(val) => handleUpdate('description', val)}
              isEditing={isEditing}
              tagName="p"
              hidden={style.hideDescription}
              className={`${getSubtitleClass(style.subtitleSize, 'opacity-75 max-w-2xl text-sm')} ${getTextAlignClass(style.textAlign)} ${style.textAlign === 'center' ? 'mx-auto' : ''}`}
              style={{ fontFamily: 'var(--font-body)' }}
            />
          )}
        </div>

        <div className={getLayoutClass()}>
          {data.mockups?.length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-white/10 rounded-2xl p-12 text-center text-sm opacity-50">
              No hay mockups añadidos. Usa el panel derecho para agregar items.
            </div>
          ) : (
            data.mockups?.map((mock: any, index: number) => (
              <div 
                key={index} 
                style={getCardRadiusStyle(style.radius)}
                className={`group relative flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 overflow-hidden p-6 hover:border-accent/20 transition-all duration-300 w-full ${
                  mock.deviceFrame === 'browser' ? 'aspect-[16/10]' : 'aspect-[4/5]'
                }`}
              >
                {mock.image ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-between p-2 overflow-hidden">
                    <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
                      <MockupFrame
                        image={mock.image}
                        alt={mock.alt}
                        deviceFrame={mock.deviceFrame || 'none'}
                        scrollOffset={mock.scrollOffset || 0}
                        onScrollOffsetChange={(val) => handleMockupUpdate(index, 'scrollOffset', val)}
                      />
                      
                      {isEditing && (
                        <button
                          onClick={(e) => clearImage(e, index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                          title="Quitar Imagen"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 w-full text-center shrink-0">
                      <EditableText
                        value={mock.caption || ''}
                        onChange={(val) => handleMockupUpdate(index, 'caption', val)}
                        isEditing={isEditing}
                        placeholder="Nombre de vista / Descripción..."
                        tagName="p"
                        className="text-xs opacity-60 hover:opacity-100 transition-opacity font-medium max-w-full truncate py-1 border-t border-white/5"
                      />
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center text-center opacity-60 cursor-pointer hover:opacity-100 transition-opacity w-full h-full justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, index)}
                      className="hidden"
                      disabled={!isEditing}
                    />
                    
                    <div className="w-20 h-40 border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center mb-4 relative hover:border-accent/40 transition-colors">
                      <div className="w-12 h-1 bg-white/25 rounded-full absolute top-2" />
                      <Upload size={16} className="text-zinc-500 group-hover:text-accent mb-1" />
                      <span className="text-[8px] uppercase font-mono tracking-wider text-zinc-500">Subir</span>
                      <div className="w-6 h-6 border border-white/20 rounded-full absolute bottom-2" />
                    </div>

                    <EditableText
                      value={mock.alt}
                      onChange={(val) => handleMockupUpdate(index, 'alt', val)}
                      isEditing={isEditing}
                      tagName="span"
                      className="text-xs font-semibold px-2 py-0.5"
                    />
                    <span className="text-[10px] font-mono opacity-50 uppercase mt-1">
                      {mock.deviceFrame === 'none' ? 'Sin frame' : mock.deviceFrame}
                    </span>
                  </label>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
