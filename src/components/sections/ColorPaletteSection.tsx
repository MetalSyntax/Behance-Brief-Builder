import type { Section, ColorPaletteData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'

import { getTitleClass, getAlignmentContainerClass, getTextAlignClass, getCardRadiusStyle } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: ColorPaletteData }
  isEditing: boolean
  onClick?: () => void
}

export function ColorPaletteSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof ColorPaletteData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleColorUpdate = (index: number, field: 'name' | 'hex' | 'role', val: string) => {
    const updatedColors = [...(data.colors || [])]
    updatedColors[index] = { ...updatedColors[index], [field]: val }
    handleUpdate('colors', updatedColors)
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
        
        <div className={data.layout === 'horizontal-strip' 
          ? 'flex flex-wrap gap-4' 
          : 'grid grid-cols-2 sm:grid-cols-4 gap-6'
        }>
          {data.colors?.map((color: any, index: number) => (
            <div key={index} style={getCardRadiusStyle(style.radius)} className="flex flex-col bg-white/[0.02] border border-white/5 overflow-hidden p-3 animate-fade-in">
              <div 
                className="w-full h-24 shadow-inner mb-3 transition-transform duration-300 hover:scale-[1.02]" 
                style={{ 
                  backgroundColor: color.hex, 
                  borderRadius: style.radius ? `calc(${style.radius} - 4px)` : '8px' 
                }}
              />
              
              <EditableText
                value={color.name}
                onChange={(val) => handleColorUpdate(index, 'name', val)}
                isEditing={isEditing}
                tagName="div"
                className="font-semibold text-sm mb-0.5 text-white truncate"
              />
              
              <EditableText
                value={color.hex}
                onChange={(val) => handleColorUpdate(index, 'hex', val)}
                isEditing={isEditing}
                tagName="div"
                className="font-mono text-xs text-accent font-bold mb-1 uppercase"
              />
              
              <EditableText
                value={color.role}
                onChange={(val) => handleColorUpdate(index, 'role', val)}
                isEditing={isEditing}
                tagName="div"
                className="text-xs opacity-60 line-clamp-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
