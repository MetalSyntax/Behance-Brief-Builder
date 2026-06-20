import { useRef, useEffect } from 'react'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
  tagName?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  style?: React.CSSProperties
}

export function EditableText({
  value,
  onChange,
  isEditing,
  className = '',
  tagName = 'span',
  style
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null)

  // Sync internal ref text only when value changes externally (e.g. undo/redo/theme)
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value
    }
  }, [value])

  const handleBlur = () => {
    if (ref.current) {
      const newText = ref.current.innerText
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
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} ${
        isEditing 
          ? 'focus:outline-violet-500 focus:bg-white/5 transition-all p-1 -m-1 rounded cursor-text select-text' 
          : ''
      }`}
      style={style}
    />
  )
}
export default EditableText
