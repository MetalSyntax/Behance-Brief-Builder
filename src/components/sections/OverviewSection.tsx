import type { Section, OverviewData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'

interface Props {
  section: Section & { data: OverviewData }
  isEditing: boolean
  onClick?: () => void
}

export function OverviewSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof OverviewData, val: any) => {
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
      <div className="max-w-[1120px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-6">
            {data.sectionNumber && (
              <EditableText
                value={data.sectionNumber}
                onChange={(val) => handleUpdate('sectionNumber', val)}
                isEditing={isEditing}
                tagName="span"
                className="font-mono text-sm opacity-60 bg-white/5 border border-white/10 px-2 py-0.5 rounded"
              />
            )}
            
            <EditableText
              value={data.title}
              onChange={(val) => handleUpdate('title', val)}
              isEditing={isEditing}
              tagName="h2"
              className="text-2xl font-bold tracking-tight uppercase"
              style={{ fontFamily: 'var(--font-display)' }}
            />
          </div>
          
          <EditableText
            value={data.contextText}
            onChange={(val) => handleUpdate('contextText', val)}
            isEditing={isEditing}
            tagName="p"
            className="text-xl leading-relaxed font-light opacity-90 whitespace-pre-line"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        </div>
        
        <div className="lg:col-span-4 grid grid-cols-2 gap-6 pt-2 lg:pt-14">
          {data.metrics?.map((metric: any, index: number) => (
            <div key={index} className="border-l-2 border-accent/30 pl-4 py-2 bg-white/[0.01] p-3 rounded-r-lg">
              <EditableText
                value={metric.label}
                onChange={(val) => handleMetricUpdate(index, 'label', val)}
                isEditing={isEditing}
                tagName="div"
                className="font-mono text-xs uppercase text-accent font-semibold mb-1"
              />
              
              <EditableText
                value={metric.value}
                onChange={(val) => handleMetricUpdate(index, 'value', val)}
                isEditing={isEditing}
                tagName="div"
                className="text-xl font-bold font-mono tracking-tight text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
