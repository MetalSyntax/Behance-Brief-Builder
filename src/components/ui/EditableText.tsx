import { useRef, useEffect } from 'react'
import { useProjectStore } from '../../lib/store/projectStore'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  isEditing?: boolean
  className?: string
  tagName?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  style?: React.CSSProperties
  placeholder?: string
}

export function EditableText(props: EditableTextProps) {
  const { value, onChange, className = '', tagName = 'span', style, placeholder } = props
  const ref = useRef<HTMLElement>(null)
  const { previewMode } = useProjectStore()

  if (previewMode && (!value || value.trim() === '' || value.trim() === '<br>')) {
    return null
  }

  const isEditable = !previewMode

  // Sync internal ref HTML only when value changes externally (e.g. undo/redo/theme)
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      const currentHTML = ref.current.innerHTML
      if (currentHTML !== value) {
        ref.current.innerHTML = value || ''
      }
    }
  }, [value])

  const handleBlur = () => {
    if (ref.current) {
      const newText = ref.current.innerHTML
      if (newText !== value) {
        onChange(newText)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagName !== 'p' && tagName !== 'div' && !e.shiftKey) {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  const Tag = tagName as any

  return (
    <Tag
      ref={ref}
      contentEditable={isEditable}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={`${className} ${
        isEditable 
          ? 'focus:outline-violet-500 focus:bg-white/5 transition-all p-1 -m-1 rounded cursor-text select-text' 
          : ''
      }`}
      style={style}
    />
  )
}
export default EditableText

