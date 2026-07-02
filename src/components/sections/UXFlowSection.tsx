import type { Section, UXFlowData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'
import { Upload, X } from 'lucide-react'

import { getTitleClass, getSubtitleClass, getAlignmentContainerClass, getTextAlignClass } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: UXFlowData }
  isEditing: boolean
  onClick?: () => void
}

export function UXFlowSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof UXFlowData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleUpdate('image', reader.result as string)
      }
      reader.readAsDataURL(file)
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
        <div className={`mb-12 ${getAlignmentContainerClass(style.textAlign)}`}>
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
            className={`${getSubtitleClass(style.subtitleSize)} ${getTextAlignClass(style.textAlign)} mb-8 max-w-3xl ${style.textAlign === 'center' ? 'mx-auto' : ''}`}
            style={{ fontFamily: 'var(--font-body)' }}
          />
        )}
        
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex items-center justify-center min-h-[400px] relative overflow-hidden group">
          {data.image ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={data.image} alt={data.title} className="max-w-full max-h-[600px] object-contain rounded-lg" />
              {isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdate('image', '')
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Quitar Imagen"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center opacity-60 cursor-pointer hover:opacity-100 transition-opacity text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={!isEditing}
              />
              <Upload size={24} className="text-zinc-500 mb-2" />
              <span className="font-mono text-xs uppercase tracking-wider mb-1">Diagrama de Flujo / UX Map</span>
              <span className="text-[10px] opacity-60 font-mono">Haz clic para subir imagen o SVG</span>
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
