import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Palette, Highlighter } from 'lucide-react'
import { useProjectStore } from '../../lib/store/projectStore'

export function TextFormatToolbar() {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const { previewMode, project, activeSectionId, updateSectionStyle } = useProjectStore()
  const toolbarRef = useRef<HTMLDivElement>(null)

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [activeEditable, setActiveEditable] = useState<HTMLElement | null>(null)

  const colors = [
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Gris', value: '#a1a1aa' },
    { name: 'Violeta', value: '#8b5cf6' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Rojo', value: '#ef4444' }
  ]

  const highlights = [
    { name: 'Ninguno', value: 'transparent' },
    { name: 'Amarillo', value: '#fef08a' },
    { name: 'Violeta', value: '#ddd6fe' },
    { name: 'Verde', value: '#bbf7d0' }
  ]

  const handleScaleText = (direction: 'increase' | 'decrease') => {
    if (!activeSectionId) return

    let editableElement = activeEditable

    // Fallback: search selection anchorNode if state is not set
    if (!editableElement) {
      const selection = window.getSelection()
      if (!selection) return
      let node: Node | null = selection.anchorNode
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).getAttribute('contenteditable') === 'true') {
          editableElement = node as HTMLElement
          break
        }
        node = node.parentNode
      }
    }

    if (!editableElement) return

    const activeSection = project.sections.find(s => s.id === activeSectionId)
    if (!activeSection || activeSection.type === 'footer') return

    const tagName = editableElement.tagName.toLowerCase()
    
    const isTitle = 
      tagName === 'h1' || 
      tagName === 'h2' || 
      (tagName === 'h3' && editableElement.className.includes('title')) ||
      editableElement.className.includes('section-title') || 
      editableElement.style.fontFamily.includes('var(--font-display)')

    const isDescription = 
      tagName === 'p' && (
        editableElement.className.includes('description') ||
        editableElement.className.includes('subtitle') ||
        editableElement.className.includes('opacity-80') ||
        editableElement.className.includes('opacity-85') ||
        editableElement.className.includes('opacity-90') ||
        editableElement.className.includes('opacity-95') ||
        editableElement.className.includes('opacity-75') ||
        editableElement.className.includes('font-light') ||
        editableElement.style.fontFamily.includes('var(--font-body)')
      )

    // Standard scales
    const titleSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'display']
    const subtitleSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'display']

    if (isTitle) {
      const currentSize = activeSection.style.titleSize || 'xl'
      let newIdx = titleSizes.indexOf(currentSize)
      if (newIdx === -1) newIdx = 4 // default to 'xl'
      
      if (direction === 'increase' && newIdx < titleSizes.length - 1) newIdx++
      if (direction === 'decrease' && newIdx > 0) newIdx--
      updateSectionStyle(activeSectionId, { titleSize: titleSizes[newIdx] })
    } else if (isDescription) {
      // It is a subtitle or description
      const currentSize = activeSection.style.subtitleSize || 'lg'
      let newIdx = subtitleSizes.indexOf(currentSize)
      if (newIdx === -1) newIdx = 3 // default to 'lg'

      if (direction === 'increase' && newIdx < subtitleSizes.length - 1) newIdx++
      if (direction === 'decrease' && newIdx > 0) newIdx--
      updateSectionStyle(activeSectionId, { subtitleSize: subtitleSizes[newIdx] })
    }
  }

  useEffect(() => {
    const handleSelectionChange = () => {
      if (previewMode) {
        setPosition(null)
        return
      }

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        setPosition(null)
        // Close popovers on deselect
        setShowColorPicker(false)
        setShowHighlightPicker(false)
        return
      }

      // Check if selection is inside an editable area
      let node = selection.anchorNode
      let isInsideEditable = false
      let editableEl: HTMLElement | null = null
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).getAttribute('contenteditable') === 'true') {
          isInsideEditable = true
          editableEl = node as HTMLElement
          break
        }
        node = node.parentNode
      }

      if (!isInsideEditable || !editableEl) {
        setPosition(null)
        return
      }

      setActiveEditable(editableEl)

      try {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        // Calculate absolute position on page
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft

        setPosition({
          top: rect.top + scrollTop - 48, // 48px above selection
          left: rect.left + scrollLeft + rect.width / 2
        })
      } catch (e) {
        setPosition(null)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [previewMode])

  if (!position || previewMode) return null

  const format = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
  }

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="backdrop-blur-md bg-[#13131a]/95 border border-white/10 rounded-xl p-1.5 shadow-2xl flex items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-100 select-none pointer-events-auto"
      onMouseDown={(e) => e.preventDefault()} // Keep text selection active on click
    >
      <button
        type="button"
        onClick={() => format('bold')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Negrita"
      >
        <Bold size={13} />
      </button>
      <button
        type="button"
        onClick={() => format('italic')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Itálica"
      >
        <Italic size={13} />
      </button>
      <button
        type="button"
        onClick={() => format('underline')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Subrayado"
      >
        <Underline size={13} />
      </button>

      <div className="h-4 w-px bg-white/10 mx-1" />

      {/* Font Size controls */}
      <button
        type="button"
        onClick={() => handleScaleText('decrease')}
        className="px-1.5 py-1 rounded hover:bg-white/5 text-zinc-400 hover:text-white text-[9px] font-extrabold transition-all cursor-pointer leading-none"
        title="Reducir tamaño del bloque"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => handleScaleText('increase')}
        className="px-1.5 py-1 rounded hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-extrabold transition-all cursor-pointer leading-none"
        title="Aumentar tamaño del bloque"
      >
        A+
      </button>

      <div className="h-4 w-px bg-white/10 mx-1" />

      {/* Color picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker)
            setShowHighlightPicker(false)
          }}
          className={`p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${showColorPicker ? 'text-violet-400 bg-white/5' : 'text-zinc-400 hover:text-white'}`}
          title="Color de Texto"
        >
          <Palette size={13} />
        </button>
        {showColorPicker && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 rounded-lg p-1 flex gap-1 z-50 shadow-xl">
            {colors.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  format('foreColor', c.value)
                  setShowColorPicker(false)
                }}
                style={{ backgroundColor: c.value }}
                className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Highlight picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker)
            setShowColorPicker(false)
          }}
          className={`p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${showHighlightPicker ? 'text-violet-400 bg-white/5' : 'text-zinc-400 hover:text-white'}`}
          title="Resaltado"
        >
          <Highlighter size={13} />
        </button>
        {showHighlightPicker && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 rounded-lg p-1 flex gap-1 z-50 shadow-xl">
            {highlights.map(h => (
              <button
                key={h.value}
                type="button"
                onClick={() => {
                  format('backColor', h.value)
                  setShowHighlightPicker(false)
                }}
                style={{ backgroundColor: h.value === 'transparent' ? '#27272a' : h.value }}
                className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-[8px] text-zinc-400"
                title={h.name}
              >
                {h.value === 'transparent' && 'x'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => format('justifyLeft')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Alinear Izquierda"
      >
        <AlignLeft size={13} />
      </button>
      <button
        type="button"
        onClick={() => format('justifyCenter')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Centrar"
      >
        <AlignCenter size={13} />
      </button>
      <button
        type="button"
        onClick={() => format('justifyRight')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Alinear Derecha"
      >
        <AlignRight size={13} />
      </button>
      <button
        type="button"
        onClick={() => format('justifyFull')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Justificar"
      >
        <AlignJustify size={13} />
      </button>

      <div className="h-4 w-px bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => format('removeFormat')}
        className="p-1.5 rounded-lg hover:bg-white/5 text-red-400/80 hover:text-red-400 transition-all cursor-pointer"
        title="Limpiar Formato"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
export default TextFormatToolbar
