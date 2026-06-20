import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useProjectStore } from '../../lib/store/projectStore'
import type { Section, SectionType } from '../../lib/types/project.types'
import { Eye, EyeOff, Trash2, GripVertical, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Sortable Item Component
interface SortableItemProps {
  section: Section
  isActive: boolean
  onSelect: () => void
  onToggleVisible: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

function SortableSectionItem({
  section,
  isActive,
  onSelect,
  onToggleVisible,
  onDelete
}: SortableItemProps) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const getSectionTitle = (s: Section) => {
    switch (s.type) {
      case 'cover':
        return s.data.title || t('sections.cover')
      case 'overview':
        return s.data.title || t('sections.overview')
      case 'color-palette':
        return s.data.title || t('sections.color-palette')
      case 'mockups':
        return s.data.title || t('sections.mockups')
      case 'footer':
        return s.data.authorName || t('sections.footer')
      default:
        return t(`sections.${s.type}` as any, s.type.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()))
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center justify-between p-3 mb-2 rounded-xl border text-sm transition-all cursor-pointer group ${
        isActive
          ? 'bg-violet-600/10 border-violet-500/50 text-white font-medium'
          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/5 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Arrastrar sección"
        >
          <GripVertical size={14} />
        </button>
        <span className="truncate pr-2 select-none">{getSectionTitle(section)}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onToggleVisible}
          className={`p-1.5 rounded-lg transition-colors ${
            section.visible ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'text-zinc-600 hover:bg-white/5 hover:text-zinc-400'
          }`}
          title={section.visible ? t('inspector.advanced.hide') : t('inspector.advanced.show')}
          aria-label={section.visible ? t('inspector.advanced.hide') : t('inspector.advanced.show')}
        >
          {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
          title={t('inspector.advanced.delete')}
          aria-label={t('inspector.advanced.delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// Main Sidebar Component
export function SectionList() {
  const { t } = useTranslation()
  const {
    project,
    activeSectionId,
    setActiveSectionId,
    reorderSections,
    addSection,
    deleteSection,
    toggleSectionVisibility
  } = useProjectStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = project.sections.findIndex((s) => s.id === active.id)
      const newIndex = project.sections.findIndex((s) => s.id === over.id)
      const newSections = arrayMove(project.sections, oldIndex, newIndex)
      reorderSections(newSections)
    }
  }

  const sectionTypes: Array<{ type: SectionType; label: string }> = [
    { type: 'cover', label: t('sections.cover') },
    { type: 'overview', label: t('sections.overview') },
    { type: 'problem', label: t('sections.problem') },
    { type: 'process', label: t('sections.process') },
    { type: 'color-palette', label: t('sections.color-palette') },
    { type: 'typography', label: t('sections.typography') },
    { type: 'mockups', label: t('sections.mockups') },
    { type: 'ux-flow', label: t('sections.ux-flow') },
    { type: 'results', label: t('sections.results') },
    { type: 'footer', label: t('sections.footer') },
  ]

  return (
    <aside className="w-full lg:w-80 bg-[#13131a] border-r border-white/5 flex flex-col h-full z-20 shrink-0">
      <div className="p-4 border-b border-white/5 shrink-0">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-500">
          {t('sidebar.sections')}
        </h2>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={project.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {project.sections.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                {t('sidebar.noSections')}
              </div>
            ) : (
              project.sections.map((sec) => (
                <SortableSectionItem
                  key={sec.id}
                  section={sec}
                  isActive={activeSectionId === sec.id}
                  onSelect={() => setActiveSectionId(sec.id)}
                  onToggleVisible={(e) => {
                    e.stopPropagation()
                    toggleSectionVisibility(sec.id)
                  }}
                  onDelete={(e) => {
                    e.stopPropagation()
                    deleteSection(sec.id)
                  }}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add Sections Menu */}
      <div className="p-4 border-t border-white/5 bg-[#0e0e11] shrink-0">
        <h3 className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-3">
          {t('sidebar.addSection')}
        </h3>
        <div className="grid grid-cols-2 gap-2 h-44 overflow-y-auto pr-1">
          {sectionTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => addSection(item.type)}
              className="flex items-center gap-1.5 p-2 bg-[#13131a] border border-white/5 hover:border-violet-500/30 rounded-lg text-left text-xs text-zinc-400 hover:text-white transition-all group"
            >
              <Plus size={12} className="text-violet-500 group-hover:scale-125 transition-transform" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
export default SectionList
