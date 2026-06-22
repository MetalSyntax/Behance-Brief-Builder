import React, { useState } from 'react'
import type { Section, ProcessData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'
import * as LucideIcons from 'lucide-react'
import { getTitleClass, getAlignmentContainerClass, getTextAlignClass, getCardRadiusStyle } from '../../lib/utils/styleMapper'

interface Props {
  section: Section & { data: ProcessData }
  isEditing: boolean
  onClick?: () => void
}

export function ProcessSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)
  const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null)

  const handleUpdate = (key: keyof ProcessData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleStepUpdate = (index: number, field: 'title' | 'description' | 'icon', val: string) => {
    const updatedSteps = [...(data.steps || [])]
    updatedSteps[index] = { ...updatedSteps[index], [field]: val }
    handleUpdate('steps', updatedSteps)
  }

  return (
    <section
      onClick={onClick}
      style={{
        background: style.background,
        color: style.textColor,
        padding: style.padding || '100px 80px',
        '--section-accent': style.accentColor || 'var(--accent)',
      } as React.CSSProperties}
      className={`relative border-b border-white/5 transition-all duration-300 ${
        isEditing ? 'ring-2 ring-accent/50' : ''
      }`}
    >
      <div 
        style={{ maxWidth: style.width || '1600px' }}
        className="mx-auto px-6 lg:px-16 py-12"
      >
        <div className={`mb-12 ${getAlignmentContainerClass(style.textAlign)}`}>
          {data.sectionNumber && (
            <EditableText
              value={data.sectionNumber}
              onChange={(val) => handleUpdate('sectionNumber', val)}
              isEditing={isEditing}
              tagName="span"
              className="text-xs font-bold font-mono tracking-widest text-accent uppercase"
            />
          )}
          
          <EditableText
            value={data.title}
            onChange={(val) => handleUpdate('title', val)}
            isEditing={isEditing}
            tagName="h2"
            className={`${getTitleClass(style.titleSize, 'text-4xl md:text-5xl font-bold tracking-tight')} ${getTextAlignClass(style.textAlign)}`}
            style={{ fontFamily: 'var(--font-display)' }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.steps?.map((step: any, index: number) => {
            const IconComponent = (LucideIcons as any)[step.icon] || LucideIcons.HelpCircle
            
            return (
              <div key={index} style={getCardRadiusStyle(style.radius)} className="flex flex-col bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden group hover:border-accent/20 transition-all duration-300">

                <div className="absolute top-4 right-4 font-mono text-4xl opacity-5 font-bold group-hover:opacity-10 transition-opacity">
                  0{index + 1}
                </div>
                
                <div 
                  className={`w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6 relative ${
                    isEditing ? 'cursor-pointer hover:bg-accent/20 hover:border-accent/30' : ''
                  }`}
                  onClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation()
                      setActiveIconPicker(activeIconPicker === index ? null : index)
                    }
                  }}
                >
                  <IconComponent size={22} />
                  
                  {isEditing && activeIconPicker === index && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => {
                        e.stopPropagation()
                        setActiveIconPicker(null)
                      }} />
                      <div className="absolute top-14 left-0 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl z-50 p-2 grid grid-cols-5 gap-1 w-52 max-h-48 overflow-y-auto">
                        {[
                          'Search', 'Target', 'Layers', 'Zap', 'Award',
                          'Heart', 'Code', 'Smile', 'Pencil', 'Users',
                          'Globe', 'Star', 'Clock', 'Check', 'ArrowRight',
                          'Layout', 'Monitor', 'Cpu', 'Database', 'Shield',
                          'Lock', 'Eye', 'Lightbulb', 'Palette', 'Image',
                          'Video', 'FileText', 'Folder', 'Box', 'GitBranch',
                          'Settings', 'Compass', 'Camera', 'Phone', 'Mail',
                          'Link', 'Share2', 'Download', 'Upload', 'Bookmark',
                          'Flag', 'HelpCircle'
                        ].map((name) => {
                          const PickerIcon = (LucideIcons as any)[name] || LucideIcons.HelpCircle
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStepUpdate(index, 'icon', name)
                                setActiveIconPicker(null)
                              }}
                              className={`p-1.5 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all ${
                                step.icon === name ? 'text-accent bg-accent/10' : 'text-zinc-400'
                              }`}
                              title={name}
                            >
                              <PickerIcon size={14} />
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                <EditableText
                  value={step.title}
                  onChange={(val) => handleStepUpdate(index, 'title', val)}
                  isEditing={isEditing}
                  tagName="h3"
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                />
                
                <EditableText
                  value={step.description}
                  onChange={(val) => handleStepUpdate(index, 'description', val)}
                  isEditing={isEditing}
                  tagName="p"
                  className="text-sm opacity-70 leading-relaxed font-light"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
