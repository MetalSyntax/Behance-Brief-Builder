import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2 } from 'lucide-react'
import { useProjectStore } from '../../lib/store/projectStore'

export function TextFormatToolbar() {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const { previewMode } = useProjectStore()
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      if (previewMode) {
        setPosition(null)
        return
      }

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        setPosition(null)
        return
      }

      // Check if selection is inside an editable area
      let node = selection.anchorNode
      let isInsideEditable = false
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).getAttribute('contenteditable') === 'true') {
          isInsideEditable = true
          break
        }
        node = node.parentNode
      }

      if (!isInsideEditable) {
        setPosition(null)
        return
      }

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
