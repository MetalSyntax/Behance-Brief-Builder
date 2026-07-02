import type { Section, ResultsData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'

import { getTitleClass, getSubtitleClass, getAlignmentContainerClass, getTextAlignClass, getCardRadiusStyle } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: ResultsData }
  isEditing: boolean
  onClick?: () => void
}

export function ResultsSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof ResultsData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleMetricUpdate = (index: number, field: 'label' | 'value', val: string) => {
    const updatedMetrics = [...(data.metrics || [])]
    updatedMetrics[index] = { ...updatedMetrics[index], [field]: val }
    handleUpdate('metrics', updatedMetrics)
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className={`lg:col-span-6 ${getTextAlignClass(style.textAlign)}`}>
            <EditableText
              value={data.description}
              onChange={(val) => handleUpdate('description', val)}
              isEditing={isEditing}
              tagName="p"
              hidden={style.hideDescription}
              className={`${getSubtitleClass(style.subtitleSize, 'text-xl leading-relaxed font-light opacity-90')} ${getTextAlignClass(style.textAlign)} whitespace-pre-line`}
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
          
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.metrics?.map((metric: any, index: number) => (
              <div key={index} style={getCardRadiusStyle(style.radius)} className="flex flex-col bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden">
                <EditableText
                  value={metric.value}
                  onChange={(val) => handleMetricUpdate(index, 'value', val)}
                  isEditing={isEditing}
                  tagName="div"
                  className="font-mono text-[42px] leading-none font-bold text-accent mb-2 tracking-tight"
                />
                
                <EditableText
                  value={metric.label}
                  onChange={(val) => handleMetricUpdate(index, 'label', val)}
                  isEditing={isEditing}
                  tagName="div"
                  className="font-mono text-xs uppercase tracking-wider opacity-60 font-semibold"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
