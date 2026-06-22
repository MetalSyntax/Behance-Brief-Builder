import type { Section, MockupsData } from '../../lib/types/project.types'
import { useProjectStore } from '../../lib/store/projectStore'
import { EditableText } from '../ui/EditableText'
import { Upload, X } from 'lucide-react'

interface Props {
  section: Section & { data: MockupsData }
  isEditing: boolean
  onClick?: () => void
}

export function MockupsSection({ section, isEditing, onClick }: Props) {
  const { data, style } = section
  const updateSection = useProjectStore((state) => state.updateSection)

  const handleUpdate = (key: keyof MockupsData, val: any) => {
    updateSection(section.id, { [key]: val })
  }

  const handleMockupUpdate = (index: number, field: 'image' | 'alt' | 'deviceFrame', val: string) => {
    const updatedMockups = [...(data.mockups || [])]
    updatedMockups[index] = { ...updatedMockups[index], [field]: val }
    handleUpdate('mockups', updatedMockups)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleMockupUpdate(index, 'image', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    handleMockupUpdate(index, 'image', '')
  }

  const getLayoutClass = () => {
    switch (data.layout) {
      case 'grid-3':
        return 'grid grid-cols-1 md:grid-cols-3 gap-8'
      case 'centered-large':
        return 'flex flex-col items-center max-w-4xl mx-auto gap-8 w-full'
      case 'scattered':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'
      case 'grid-2':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-8'
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
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
            
            {data.description !== undefined && (
              <EditableText
                value={data.description}
                onChange={(val) => handleUpdate('description', val)}
                isEditing={isEditing}
                tagName="p"
                className="opacity-75 max-w-2xl text-sm"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            )}
          </div>
        </div>

        <div className={getLayoutClass()}>
          {data.mockups?.length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-white/10 rounded-2xl p-12 text-center text-sm opacity-50">
              No hay mockups añadidos. Usa el panel derecho para agregar items.
            </div>
          ) : (
            data.mockups?.map((mock: any, index: number) => (
              <div 
                key={index} 
                className="group relative flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden p-6 aspect-[4/5] hover:border-accent/20 transition-all duration-300 w-full"
              >
                {mock.image ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={mock.image} alt={mock.alt} className="max-h-full max-w-full object-contain rounded" />
                    
                    {isEditing && (
                      <button
                        onClick={(e) => clearImage(e, index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Quitar Imagen"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center text-center opacity-60 cursor-pointer hover:opacity-100 transition-opacity w-full h-full justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, index)}
                      className="hidden"
                      disabled={!isEditing}
                    />
                    
                    <div className="w-20 h-40 border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center mb-4 relative hover:border-accent/40 transition-colors">
                      <div className="w-12 h-1 bg-white/25 rounded-full absolute top-2" />
                      <Upload size={16} className="text-zinc-500 group-hover:text-accent mb-1" />
                      <span className="text-[8px] uppercase font-mono tracking-wider text-zinc-500">Subir</span>
                      <div className="w-6 h-6 border border-white/20 rounded-full absolute bottom-2" />
                    </div>

                    <EditableText
                      value={mock.alt}
                      onChange={(val) => handleMockupUpdate(index, 'alt', val)}
                      isEditing={isEditing}
                      tagName="span"
                      className="text-xs font-semibold px-2 py-0.5"
                    />
                    <span className="text-[10px] font-mono opacity-50 uppercase mt-1">
                      {mock.deviceFrame === 'none' ? 'Sin frame' : mock.deviceFrame}
                    </span>
                  </label>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
