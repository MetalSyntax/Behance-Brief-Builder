import type { Section, FooterData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'

interface Props {
  section: Section & { data: FooterData }
  isEditing: boolean
  onClick?: () => void
}

export function FooterSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof FooterData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleSocialLinkUpdate = (index: number, field: 'platform' | 'url', val: string) => {
    const updatedLinks = [...(data.socialLinks || [])]
    updatedLinks[index] = { ...updatedLinks[index], [field]: val }
    handleUpdate('socialLinks', updatedLinks)
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: style.background,
        color: style.textColor,
        padding: style.padding || '80px 40px',
        '--section-accent': style.accentColor || 'var(--accent)',
      } as React.CSSProperties}
      className={`w-full overflow-hidden transition-all duration-300 ${
        isEditing ? 'ring-2 ring-accent ring-offset-2' : ''
      } cursor-pointer`}
    >
      <div className="max-w-[1120px] mx-auto w-full px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-t border-white/10 pt-12">
        <div>
          <EditableText
            value={data.authorName}
            onChange={(val) => handleUpdate('authorName', val)}
            isEditing={isEditing}
            tagName="h3"
            className="text-xl font-bold tracking-tight text-white mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          />
          
          <div className="flex items-center gap-1.5 text-sm opacity-60">
            <EditableText
              value={data.authorRole}
              onChange={(val) => handleUpdate('authorRole', val)}
              isEditing={isEditing}
              tagName="span"
              className="inline-block"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <span>·</span>
            <EditableText
              value={data.year}
              onChange={(val) => handleUpdate('year', val)}
              isEditing={isEditing}
              tagName="span"
              className="inline-block"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
        </div>
        
        {data.socialLinks && data.socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-6 items-center">
            {data.socialLinks.map((link: any, index: number) => (
              <EditableText
                key={index}
                value={link.platform}
                onChange={(val) => handleSocialLinkUpdate(index, 'platform', val)}
                isEditing={isEditing}
                tagName="span"
                className="text-sm font-mono tracking-wider font-semibold text-accent hover:text-accent transition-colors uppercase"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
