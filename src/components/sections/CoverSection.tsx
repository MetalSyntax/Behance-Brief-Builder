import type { Section, CoverData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'

interface Props {
  section: Section & { data: CoverData }
  isEditing: boolean
  onClick?: () => void
}

export function CoverSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof CoverData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: style.background,
        color: style.textColor,
        padding: style.padding || '120px 40px',
        '--section-accent': style.accentColor || 'var(--accent)',
      } as React.CSSProperties}
      className={`relative w-full overflow-hidden transition-all duration-300 ${
        isEditing ? 'ring-2 ring-accent ring-offset-2' : ''
      } cursor-pointer min-h-[500px] flex flex-col justify-center`}
    >
      {data.decorElements && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-accent/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      )}
      
      <div className={`relative z-10 max-w-[1120px] mx-auto w-full px-6 flex flex-col ${
        data.layout === 'centered' ? 'items-center text-center' : 'items-start text-left'
      }`}>
        {data.pageCounter !== undefined && (
          <EditableText
            value={data.pageCounter}
            onChange={(val) => handleUpdate('pageCounter', val)}
            isEditing={isEditing}
            tagName="div"
            className="font-mono text-sm tracking-wider uppercase opacity-60 mb-6"
          />
        )}
        
        <EditableText
          value={data.eyebrow}
          onChange={(val) => handleUpdate('eyebrow', val)}
          isEditing={isEditing}
          tagName="span"
          className="font-mono text-xs tracking-[0.2em] font-semibold text-accent mb-4 inline-block uppercase"
        />
        
        <EditableText
          value={data.title}
          onChange={(val) => handleUpdate('title', val)}
          isEditing={isEditing}
          tagName="h1"
          className={`font-bold tracking-tight leading-none mb-6 whitespace-pre-line ${
            data.titleSize === 'display' ? 'text-6xl md:text-8xl' : data.titleSize === 'xxl' ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        />
        
        <EditableText
          value={data.subtitle}
          onChange={(val) => handleUpdate('subtitle', val)}
          isEditing={isEditing}
          tagName="p"
          className="text-lg md:text-xl opacity-80 max-w-2xl font-light"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>
    </div>
  )
}
