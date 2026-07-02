import type { Section, CoverData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'
import { getTitleClass, getSubtitleClass } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: CoverData }
  isEditing: boolean
  onClick?: () => void
}

export function CoverSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const { project } = useProjectStore()
  const themeId = project.theme
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof CoverData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const renderDecorElements = () => {
    if (!data.decorElements) return null

    // Default decorations by theme if not explicitly chosen
    const type = data.decorType || (
      themeId === 'brutalist-light' || themeId === 'flat-design-light' ? 'brutalist-star' :
      themeId === 'cyberpunk' || themeId === 'neon-noir' ? 'grid' :
      themeId === 'minimal' || themeId === 'charcoal-mono' ? 'crosses' : 'glow'
    )

    switch (type) {
      case 'grid':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden select-none">
            <div 
              className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" 
              style={{
                perspective: '500px',
                transform: 'rotateX(60deg) scale(2) translateY(-20%)',
                transformOrigin: 'top center',
              }}
            />
          </div>
        )
      case 'dots':
        return (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(var(--section-accent)_15%,transparent_16%)] bg-[size:24px_24px] opacity-15 pointer-events-none hidden md:block select-none" />
        )
      case 'brutalist-star':
        return (
          <div className="absolute right-24 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none hidden md:block select-none filter drop-shadow-[6px_6px_0px_rgba(0,0,0,0.8)]">
            <svg viewBox="0 0 100 100" fill="var(--section-accent)" stroke="currentColor" strokeWidth="2.5" className="w-full h-full text-black">
              <path d="M50 0 L55 35 L90 35 L60 55 L70 90 L50 70 L30 90 L40 55 L10 35 L45 35 Z" />
            </svg>
          </div>
        )
      case 'retro-shape':
        return (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none hidden md:block select-none scale-75">
            <div className="absolute w-40 h-40 rounded-full border-4 border-black bg-yellow-400 rotate-12 shadow-[6px_6px_0px_#000000] -top-4 -left-4" />
            <div className="absolute w-40 h-40 border-4 border-black bg-blue-500 -rotate-12 shadow-[6px_6px_0px_#000000] top-12 left-16" />
            <div className="absolute w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px] border-b-rose-500 filter drop-shadow-[4px_4px_0px_#000000] top-4 left-10" />
          </div>
        )
      case 'abstract-wave':
        return (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none hidden md:block select-none overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-[var(--section-accent)] fill-none stroke-[1px]">
              <path d="M0,10 Q20,30 40,10 T80,10 T120,30" />
              <path d="M0,25 Q25,45 50,25 T100,25 T150,45" />
              <path d="M0,40 Q30,60 60,40 T120,40 T180,60" />
              <path d="M0,55 Q35,75 70,55 T140,55 T210,75" />
              <path d="M0,70 Q40,90 80,70 T160,70 T240,90" />
            </svg>
          </div>
        )
      case 'isometric-cube':
        return (
          <div className="absolute right-28 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none hidden md:block select-none opacity-40">
            <svg viewBox="0 0 120 120" fill="none" stroke="var(--section-accent)" strokeWidth="1.5" className="w-full h-full animate-[spin_12s_linear_infinite]">
              <polygon points="60,20 100,40 100,80 60,100 20,80 20,40" />
              <line x1="60" y1="20" x2="60" y2="100" />
              <line x1="20" y1="40" x2="60" y2="60" />
              <line x1="100" y1="40" x2="60" y2="60" />
            </svg>
          </div>
        )
      case 'crosses':
        return (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none hidden md:block select-none opacity-20">
            <div className="w-full h-full grid grid-cols-6 grid-rows-6 text-zinc-400 font-mono text-[10px] text-center content-center justify-items-center">
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={i}>+</span>
              ))}
            </div>
          </div>
        )
      case 'stripes':
        return (
          <div className="absolute right-0 top-0 bottom-0 w-48 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,var(--section-accent)_15px,var(--section-accent)_18px)] opacity-10 pointer-events-none hidden md:block select-none" />
        )
      case 'noise-overlay':
        return (
          <div className="absolute inset-0 bg-noise pointer-events-none opacity-[0.02] select-none" />
        )
      case 'glow':
      default:
        return (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--section-accent)]/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        )
    }
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
      {renderDecorElements()}
      
      <div className={`relative z-10 max-w-[1120px] mx-auto w-full px-6 flex flex-col ${
        data.layout === 'centered' ? 'items-center text-center' : 'items-start text-left'
      }`}>
        {data.pageCounter !== undefined && (
          <EditableText
            value={data.pageCounter}
            onChange={(val) => handleUpdate('pageCounter', val)}
            isEditing={isEditing}
            tagName="div"
            hidden={style.hidePageCounter}
            className="font-mono text-sm tracking-wider uppercase opacity-60 mb-6"
          />
        )}
        
        <EditableText
          value={data.eyebrow}
          onChange={(val) => handleUpdate('eyebrow', val)}
          isEditing={isEditing}
          tagName="span"
          hidden={style.hideEyebrow}
          className="font-mono text-xs tracking-[0.2em] font-semibold text-accent mb-4 inline-block uppercase"
        />
        
        <EditableText
          value={data.title}
          onChange={(val) => handleUpdate('title', val)}
          isEditing={isEditing}
          tagName="h1"
          hidden={style.hideTitle}
          className={`font-bold tracking-tight leading-none mb-6 whitespace-pre-line ${
            style.titleSize ? getTitleClass(style.titleSize) : (data.titleSize === 'display' ? 'text-6xl md:text-8xl' : 'text-4xl md:text-5xl')
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        />
        
        <EditableText
          value={data.subtitle}
          onChange={(val) => handleUpdate('subtitle', val)}
          isEditing={isEditing}
          tagName="p"
          hidden={style.hideSubtitle}
          className={`${getSubtitleClass(style.subtitleSize, 'text-lg md:text-xl opacity-80 max-w-2xl font-light')}`}
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>
    </div>
  )
}
