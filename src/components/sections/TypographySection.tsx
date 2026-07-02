import type { Section, TypographyData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'

import { getTitleClass, getAlignmentContainerClass, getTextAlignClass } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: TypographyData }
  isEditing: boolean
  onClick?: () => void
}

export function TypographySection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof TypographyData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleFontUpdate = (index: number, field: 'name' | 'sample' | 'role', val: string) => {
    const updatedFonts = [...(data.fonts || [])]
    updatedFonts[index] = { ...updatedFonts[index], [field]: val }
    handleUpdate('fonts', updatedFonts)
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
        
        <div className="flex flex-col gap-12">
          {data.fonts?.map((font: any, index: number) => (
            <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8 last:border-b-0 last:pb-0">
              <div className="lg:col-span-4">
                <EditableText
                  value={font.role}
                  onChange={(val) => handleFontUpdate(index, 'role', val)}
                  isEditing={isEditing}
                  tagName="span"
                  className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2 block"
                />
                
                <EditableText
                  value={font.name}
                  onChange={(val) => handleFontUpdate(index, 'name', val)}
                  isEditing={isEditing}
                  tagName="h3"
                  className="text-3xl font-bold text-white"
                />
              </div>
              
              <div className="lg:col-span-8">
                <EditableText
                  value={font.sample}
                  onChange={(val) => handleFontUpdate(index, 'sample', val)}
                  isEditing={isEditing}
                  tagName="div"
                  className="text-4xl md:text-5xl tracking-wide font-light whitespace-nowrap overflow-hidden text-ellipsis mb-2"
                  style={{ fontFamily: font.name }}
                />
                
                <div className="text-xs opacity-50 font-mono">
                  abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
