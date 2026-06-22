import { useState } from 'react'
import { useProjectStore } from '../../lib/store/projectStore'
import { THEME_OPTIONS } from '../../lib/themes'
import { Info, Trash2, Plus, Eye, EyeOff, ScanText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ImageUploader } from '../shared/ImageUploader'
import { OcrModal } from '../ocr/OcrModal'
import { CustomSelect } from '../ui/CustomSelect'

type Tab = 'content' | 'style' | 'advanced'

export function SectionInspector() {
  const { 
    activeSectionId, 
    project, 
    updateSection, 
    updateSectionStyle, 
    deleteSection, 
    toggleSectionVisibility,
    setTheme,
    updateCustomTheme
  } = useProjectStore()
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [ocrOpen, setOcrOpen] = useState(false)
  const { t } = useTranslation()

  const section = project.sections.find((s) => s.id === activeSectionId)

  const customTheme = project.customTheme || {
    '--bg': '#0f0f12',
    '--bg-section': '#16161f',
    '--bg-card': '#20202e',
    '--text': '#ffffff',
    '--text-muted': '#a1a1aa',
    '--accent': '#8b5cf6',
    '--border': 'rgba(255,255,255,0.08)',
    '--font-display': "'Inter', sans-serif",
    '--font-body': "'Inter', sans-serif",
    '--radius': '12px',
    '--section-w': '1600px',
  }

  const handleCustomThemeUpdate = (key: string, val: string) => {
    updateCustomTheme({ [key]: val })
  }

  if (!section) {
    return (
      <aside className="w-80 bg-[#13131a] border-l border-white/5 flex flex-col h-full overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-white/10">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">
            {t('inspector.global.title')}
          </span>
        </div>

        <div className="p-4 space-y-6">
          {/* Active Theme selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block uppercase">
              {t('inspector.global.activeTheme')}
            </label>
            <CustomSelect
              value={project.theme}
              onChange={(val) => setTheme(val as any)}
              groups={(() => {
                const groupLabels: Record<string, string> = {
                  dark:     t('themes.groupDark',     { defaultValue: 'Temas Oscuros' }),
                  light:    t('themes.groupLight',    { defaultValue: 'Temas Claros' }),
                  advanced: t('themes.groupAdvanced', { defaultValue: 'Avanzado' }),
                }
                return Object.entries(
                  THEME_OPTIONS.reduce<Record<string, { value: string; label: string }[]>>((acc, opt) => {
                    if (!acc[opt.group]) acc[opt.group] = []
                    acc[opt.group].push({ value: opt.value, label: opt.label })
                    return acc
                  }, {})
                ).map(([group, options]) => ({ label: groupLabels[group] ?? group, options }))
              })()}
              className="w-full"
              triggerClassName="w-full py-2 justify-between bg-zinc-900 border border-white/10 text-xs"
              dropdownClassName="w-full"
            />
          </div>

          {project.theme === 'custom' ? (
            <div className="space-y-4 pt-2 border-t border-white/5">
              <span className="text-xs text-white font-semibold block">Diseñador de Tema</span>

              {/* Colors section */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-wider uppercase block">{t('inspector.global.canvasColors')}</span>
                
                {/* Background color */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Fondo del Lienzo (--bg)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customTheme['--bg']?.startsWith('#') ? customTheme['--bg'] : '#0f0f12'}
                      onChange={(e) => handleCustomThemeUpdate('--bg', e.target.value)}
                      className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme['--bg'] || ''}
                      onChange={(e) => handleCustomThemeUpdate('--bg', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section Background color */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Fondo de Secciones (--bg-section)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customTheme['--bg-section']?.startsWith('#') ? customTheme['--bg-section'] : '#16161f'}
                      onChange={(e) => handleCustomThemeUpdate('--bg-section', e.target.value)}
                      className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme['--bg-section'] || ''}
                      onChange={(e) => handleCustomThemeUpdate('--bg-section', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Card Background color */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Fondo de Tarjetas/Gaps (--bg-card)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customTheme['--bg-card']?.startsWith('#') ? customTheme['--bg-card'] : '#20202e'}
                      onChange={(e) => handleCustomThemeUpdate('--bg-card', e.target.value)}
                      className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme['--bg-card'] || ''}
                      onChange={(e) => handleCustomThemeUpdate('--bg-card', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary Text color */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Texto Principal (--text)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customTheme['--text']?.startsWith('#') ? customTheme['--text'] : '#ffffff'}
                      onChange={(e) => handleCustomThemeUpdate('--text', e.target.value)}
                      className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme['--text'] || ''}
                      onChange={(e) => handleCustomThemeUpdate('--text', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accent color */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Color de Acento (--accent)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customTheme['--accent']?.startsWith('#') ? customTheme['--accent'] : '#8b5cf6'}
                      onChange={(e) => handleCustomThemeUpdate('--accent', e.target.value)}
                      className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme['--accent'] || ''}
                      onChange={(e) => handleCustomThemeUpdate('--accent', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Typography & Layout */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-wider uppercase block">Tipografía y Diseño</span>

                {/* Display Font */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Fuente Títulos (--font-display)</label>
                  <CustomSelect
                    value={customTheme['--font-display']}
                    onChange={(val) => handleCustomThemeUpdate('--font-display', val)}
                    options={[
                      { value: "'Montserrat', sans-serif", label: 'Montserrat' },
                      { value: "'Sora', sans-serif", label: 'Sora' },
                      { value: "'Inter', sans-serif", label: 'Inter' },
                      { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
                      { value: "'Playfair Display', serif", label: 'Playfair Display' },
                      { value: "'Manrope', sans-serif", label: 'Manrope' },
                      { value: "'DM Sans', sans-serif", label: 'DM Sans' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full py-1.5 justify-between bg-zinc-900 text-xs"
                    dropdownClassName="w-full"
                  />
                </div>

                {/* Body Font */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Fuente Párrafos (--font-body)</label>
                  <CustomSelect
                    value={customTheme['--font-body']}
                    onChange={(val) => handleCustomThemeUpdate('--font-body', val)}
                    options={[
                      { value: "'Montserrat', sans-serif", label: 'Montserrat' },
                      { value: "'Sora', sans-serif", label: 'Sora' },
                      { value: "'Inter', sans-serif", label: 'Inter' },
                      { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
                      { value: "'Playfair Display', serif", label: 'Playfair Display' },
                      { value: "'Manrope', sans-serif", label: 'Manrope' },
                      { value: "'DM Sans', sans-serif", label: 'DM Sans' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full py-1.5 justify-between bg-zinc-900 text-xs"
                    dropdownClassName="w-full"
                  />
                </div>

                {/* Border radius */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 block">Redondeado (--radius)</label>
                  <CustomSelect
                    value={customTheme['--radius']}
                    onChange={(val) => handleCustomThemeUpdate('--radius', val)}
                    options={[
                      { value: '0px', label: '0px (Recto)' },
                      { value: '4px', label: '4px (Suave)' },
                      { value: '8px', label: '8px (Regular)' },
                      { value: '12px', label: '12px (Redondeado)' },
                      { value: '16px', label: '16px (Grande)' },
                      { value: '24px', label: '24px (Píldora)' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full py-1.5 justify-between bg-zinc-900 text-xs"
                    dropdownClassName="w-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center text-zinc-500 space-y-2">
              <Info size={20} className="mx-auto text-zinc-600" />
              <p className="text-xs">
                Selecciona una sección en el lienzo para ver y editar sus propiedades.
              </p>
              <p className="text-[10px] opacity-70">
                O selecciona "Tema Personalizado" arriba para abrir el diseñador de temas interactivo.
              </p>
            </div>
          )}
        </div>
      </aside>
    )
  }

  const handleDataChange = (key: string, value: any) => {
    updateSection(section.id, { [key]: value })
  }

  const handleStyleChange = (key: string, value: any) => {
    updateSectionStyle(section.id, { [key]: value })
  }

  // Cover properties editing
  const renderCoverEditor = (data: any) => (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.eyebrow')}</label>
        <input
          type="text"
          value={data.eyebrow || ''}
          onChange={(e) => handleDataChange('eyebrow', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.mainTitle')}</label>
        <textarea
          rows={3}
          value={data.title || ''}
          onChange={(e) => handleDataChange('title', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-violet-500 resize-none font-sans"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.subtitle')}</label>
        <textarea
          rows={3}
          value={data.subtitle || ''}
          onChange={(e) => handleDataChange('subtitle', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-violet-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.titleSize')}</label>
          <CustomSelect
            value={data.titleSize || 'xl'}
            onChange={(val) => handleDataChange('titleSize', val)}
            options={[
              { value: 'xl', label: 'Estándar (xl)' },
              { value: 'xxl', label: 'Grande (2xl)' },
              { value: 'display', label: 'Gigante (Display)' }
            ]}
            className="w-full"
            triggerClassName="w-full py-2 justify-between"
            dropdownClassName="w-full"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.alignment')}</label>
          <CustomSelect
            value={data.layout || 'left'}
            onChange={(val) => handleDataChange('layout', val)}
            options={[
              { value: 'left', label: t('inspector.field.alignLeft') },
              { value: 'centered', label: t('inspector.field.alignCenter') }
            ]}
            className="w-full"
            triggerClassName="w-full py-2 justify-between"
            dropdownClassName="w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg">
        <span className="text-xs text-zinc-400 font-medium">{t('inspector.field.decorElements')}</span>
        <input
          type="checkbox"
          checked={!!data.decorElements}
          onChange={(e) => handleDataChange('decorElements', e.target.checked)}
          className="accent-violet-600 cursor-pointer"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.pageCounter')}</label>
        <input
          type="text"
          value={data.pageCounter || ''}
          placeholder="Ej: 01 / 08"
          onChange={(e) => handleDataChange('pageCounter', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
        />
      </div>
    </div>
  )

  // Overview properties editing
  const renderOverviewEditor = (data: any) => {
    const handleMetricChange = (index: number, field: string, value: string) => {
      const updatedMetrics = [...(data.metrics || [])]
      updatedMetrics[index] = { ...updatedMetrics[index], [field]: value }
      handleDataChange('metrics', updatedMetrics)
    }

    const addMetric = () => {
      const updatedMetrics = [...(data.metrics || []), { label: 'Nueva Métrica', value: '00' }]
      handleDataChange('metrics', updatedMetrics)
    }

    const removeMetric = (index: number) => {
      const updatedMetrics = (data.metrics || []).filter((_: any, i: number) => i !== index)
      handleDataChange('metrics', updatedMetrics)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
            <input
              type="text"
              value={data.sectionNumber || ''}
              onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleDataChange('title', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.contextParagraph')}</label>
          <textarea
            rows={5}
            value={data.contextText || ''}
            onChange={(e) => handleDataChange('contextText', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">{t('inspector.field.metricsKpis')}</label>
            <button
              onClick={addMetric}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.metrics?.map((metric: any, index: number) => (
              <div key={index} className="flex gap-2 items-center bg-white/[0.01] p-2 border border-white/5 rounded-lg">
                <input
                  type="text"
                  placeholder="Etiqueta"
                  value={metric.label || ''}
                  onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                  className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Valor"
                  value={metric.value || ''}
                  onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                  className="w-20 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <button
                  onClick={() => removeMetric(index)}
                  className="p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Palette properties editing
  const renderPaletteEditor = (data: any) => {
    const handleColorChange = (index: number, field: string, value: string) => {
      const updatedColors = [...(data.colors || [])]
      updatedColors[index] = { ...updatedColors[index], [field]: value }
      handleDataChange('colors', updatedColors)
    }

    const addColor = () => {
      const updatedColors = [...(data.colors || []), { name: 'Acento', hex: '#aa3bff', role: 'Secundario' }]
      handleDataChange('colors', updatedColors)
    }

    const removeColor = (index: number) => {
      const updatedColors = (data.colors || []).filter((_: any, i: number) => i !== index)
      handleDataChange('colors', updatedColors)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
            <input
              type="text"
              value={data.sectionNumber || ''}
              onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleDataChange('title', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.layout')}</label>
          <CustomSelect
            value={data.layout || 'grid'}
            onChange={(val) => handleDataChange('layout', val)}
            options={[
              { value: 'grid', label: 'Grilla (Grid)' },
              { value: 'horizontal-strip', label: 'Franja Horizontal' }
            ]}
            className="w-full"
            triggerClassName="w-full py-2 justify-between"
            dropdownClassName="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">{t('inspector.field.colors')}</label>
            <button
              onClick={addColor}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir Color
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {data.colors?.map((color: any, index: number) => (
              <div key={index} className="bg-white/[0.01] border border-white/5 p-2 rounded-lg space-y-2 relative">
                <button
                  onClick={() => removeColor(index)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 size={12} />
                </button>

                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={color.hex || '#000000'}
                    onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                    className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="HEX Code"
                      value={color.hex || ''}
                      onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={color.name || ''}
                    onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                  />
                  <input
                    type="text"
                    placeholder="Rol / Uso"
                    value={color.role || ''}
                    onChange={(e) => handleColorChange(index, 'role', e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Mockups properties editing
  const renderMockupsEditor = (data: any) => {
    const handleMockupChange = (index: number, field: string, value: string) => {
      const updatedMockups = [...(data.mockups || [])]
      updatedMockups[index] = { ...updatedMockups[index], [field]: value }
      handleDataChange('mockups', updatedMockups)
    }

    const addMockup = () => {
      const updatedMockups = [...(data.mockups || []), { image: '', alt: 'Pantalla', deviceFrame: 'phone' }]
      handleDataChange('mockups', updatedMockups)
    }

    const removeMockup = (index: number) => {
      const updatedMockups = (data.mockups || []).filter((_: any, i: number) => i !== index)
      handleDataChange('mockups', updatedMockups)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
            <input
              type="text"
              value={data.sectionNumber || ''}
              onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleDataChange('title', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.subtitle')}</label>
          <input
            type="text"
            value={data.description || ''}
            onChange={(e) => handleDataChange('description', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.layout')}</label>
            <CustomSelect
              value={data.layout || 'grid-2'}
              onChange={(val) => handleDataChange('layout', val)}
              options={[
                { value: 'grid-2', label: '2 Columnas' },
                { value: 'grid-3', label: '3 Columnas' },
                { value: 'centered-large', label: 'Centrado Grande' },
                { value: 'scattered', label: 'Scattered (Disperso)' }
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">{t('inspector.field.mockupsList')}</label>
            <button
              onClick={addMockup}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir Item
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {data.mockups?.map((mock: any, index: number) => (
              <div key={index} className="bg-white/[0.01] border border-white/5 p-2 rounded-lg space-y-2 relative">
                <button
                  onClick={() => removeMockup(index)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 size={12} />
                </button>

                <div>
                  <ImageUploader
                    value={mock.image || ''}
                    onChange={(val) => handleMockupChange(index, 'image', val)}
                    withOcr={true}
                    onOcrClick={() => setOcrOpen(true)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Alt Text"
                    value={mock.alt || ''}
                    onChange={(e) => handleMockupChange(index, 'alt', e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                  />
                  <CustomSelect
                    value={mock.deviceFrame || 'none'}
                    onChange={(val) => handleMockupChange(index, 'deviceFrame', val)}
                    options={[
                      { value: 'none', label: 'Sin Frame' },
                      { value: 'phone', label: 'Móvil (Phone)' },
                      { value: 'tablet', label: 'Tablet' },
                      { value: 'browser', label: 'Navegador' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full py-1 justify-between bg-zinc-900 text-[11px]"
                    dropdownClassName="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Footer properties editing
  const renderFooterEditor = (data: any) => {
    const handleLinkChange = (index: number, field: string, value: string) => {
      const updatedLinks = [...(data.socialLinks || [])]
      updatedLinks[index] = { ...updatedLinks[index], [field]: value }
      handleDataChange('socialLinks', updatedLinks)
    }

    const addLink = () => {
      const updatedLinks = [...(data.socialLinks || []), { platform: 'LinkedIn', url: '#' }]
      handleDataChange('socialLinks', updatedLinks)
    }

    const removeLink = (index: number) => {
      const updatedLinks = (data.socialLinks || []).filter((_: any, i: number) => i !== index)
      handleDataChange('socialLinks', updatedLinks)
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.authorName')}</label>
          <input
            type="text"
            value={data.authorName || ''}
            onChange={(e) => handleDataChange('authorName', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.authorRole')}</label>
          <input
            type="text"
            value={data.authorRole || ''}
            onChange={(e) => handleDataChange('authorRole', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.year')}</label>
          <input
            type="text"
            value={data.year || ''}
            onChange={(e) => handleDataChange('year', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">{t('inspector.field.socialLinks')}</label>
            <button
              onClick={addLink}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir Red
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.socialLinks?.map((link: any, index: number) => (
              <div key={index} className="flex gap-2 items-center bg-white/[0.01] p-2 border border-white/5 rounded-lg">
                <input
                  type="text"
                  placeholder="Platform"
                  value={link.platform || ''}
                  onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                  className="w-20 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url || ''}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <button
                  onClick={() => removeLink(index)}
                  className="p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Problem section editor
  const renderProblemEditor = (data: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
          <input
            type="text"
            value={data.sectionNumber || ''}
            onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => handleDataChange('title', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.layout')}</label>
        <CustomSelect
          value={data.layout || 'right-image'}
          onChange={(val) => handleDataChange('layout', val)}
          options={[
            { value: 'right-image', label: 'Imagen a la Derecha' },
            { value: 'left-image', label: 'Imagen a la Izquierda' },
          ]}
          className="w-full"
          triggerClassName="w-full py-2 justify-between"
          dropdownClassName="w-full"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.description')}</label>
        <textarea
          rows={5}
          value={data.description || ''}
          onChange={(e) => handleDataChange('description', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none resize-none"
        />
      </div>

      <ImageUploader
        label={t('inspector.field.imageUrl')}
        value={data.image || ''}
        onChange={(val) => handleDataChange('image', val)}
        withOcr={true}
        onOcrClick={() => setOcrOpen(true)}
      />
    </div>
  )

  // Process section editor
  const renderProcessEditor = (data: any) => {
    const PROCESS_ICONS = [
      'Search', 'Target', 'Layers', 'Zap', 'Award', 'Heart', 'Code', 'Smile',
      'Pencil', 'Users', 'Globe', 'Star', 'Clock', 'Check', 'ArrowRight',
      'Layout', 'Monitor', 'Cpu', 'Database', 'Shield', 'Lock', 'Eye',
      'Lightbulb', 'Palette', 'Image', 'Video', 'FileText', 'Folder', 'Box',
      'GitBranch', 'Settings', 'Compass', 'Camera', 'Phone', 'Mail', 'Link',
      'Share2', 'Download', 'Upload', 'Bookmark', 'Flag', 'HelpCircle'
    ]

    const handleStepChange = (index: number, field: string, value: string) => {
      const updatedSteps = [...(data.steps || [])]
      updatedSteps[index] = { ...updatedSteps[index], [field]: value }
      handleDataChange('steps', updatedSteps)
    }

    const addStep = () => {
      const updatedSteps = [...(data.steps || []), { title: 'Nuevo Paso', description: 'Descripción del paso', icon: 'Zap' }]
      handleDataChange('steps', updatedSteps)
    }

    const removeStep = (index: number) => {
      const updatedSteps = (data.steps || []).filter((_: any, i: number) => i !== index)
      handleDataChange('steps', updatedSteps)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
            <input
              type="text"
              value={data.sectionNumber || ''}
              onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleDataChange('title', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">Pasos del Proceso</label>
            <button
              onClick={addStep}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir Paso
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(data.steps || []).map((step: any, index: number) => (
              <div key={index} className="bg-white/[0.01] border border-white/5 p-3 rounded-lg space-y-2 relative">
                <button
                  onClick={() => removeStep(index)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 size={12} />
                </button>

                <div className="flex items-center gap-1.5 pr-6">
                  <span className="text-[10px] font-mono text-zinc-600 font-bold">0{index + 1}</span>
                  <CustomSelect
                    value={step.icon || 'Zap'}
                    onChange={(val) => handleStepChange(index, 'icon', val)}
                    options={PROCESS_ICONS.map(name => ({ value: name, label: name }))}
                    className="flex-1"
                    triggerClassName="w-full py-1 justify-between bg-zinc-900 text-[11px]"
                    dropdownClassName="w-full"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Título del paso"
                  value={step.title || ''}
                  onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <textarea
                  rows={2}
                  placeholder="Descripción del paso"
                  value={step.description || ''}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Typography section editor
  const renderTypographyEditor = (data: any) => {
    const PERMITTED_FONTS = [
      'Montserrat', 'Sora', 'Manrope', 'Space Grotesk', 'DM Sans', 'Inter', 'Bebas Neue', 'Playfair Display'
    ]

    const handleFontChange = (index: number, field: string, value: string) => {
      const updatedFonts = [...(data.fonts || [])]
      updatedFonts[index] = { ...updatedFonts[index], [field]: value }
      handleDataChange('fonts', updatedFonts)
    }

    const addFont = () => {
      const updatedFonts = [...(data.fonts || []), { name: 'Inter', role: 'Body', sample: 'The quick brown fox' }]
      handleDataChange('fonts', updatedFonts)
    }

    const removeFont = (index: number) => {
      const updatedFonts = (data.fonts || []).filter((_: any, i: number) => i !== index)
      handleDataChange('fonts', updatedFonts)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
            <input
              type="text"
              value={data.sectionNumber || ''}
              onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleDataChange('title', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">Tipografías</label>
            <button
              onClick={addFont}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir Fuente
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(data.fonts || []).map((font: any, index: number) => (
              <div key={index} className="bg-white/[0.01] border border-white/5 p-3 rounded-lg space-y-2 relative">
                <button
                  onClick={() => removeFont(index)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 size={12} />
                </button>

                <div className="pr-6">
                  <label className="text-[10px] text-zinc-500 block mb-1">Familia tipográfica</label>
                  <CustomSelect
                    value={font.name || 'Inter'}
                    onChange={(val) => handleFontChange(index, 'name', val)}
                    options={PERMITTED_FONTS.map(f => ({ value: f, label: f }))}
                    className="w-full"
                    triggerClassName="w-full py-1.5 justify-between bg-zinc-900 text-xs"
                    dropdownClassName="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Rol / Uso</label>
                    <input
                      type="text"
                      placeholder="Display, Body, Mono..."
                      value={font.role || ''}
                      onChange={(e) => handleFontChange(index, 'role', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Texto de muestra</label>
                    <input
                      type="text"
                      placeholder="Aa Bb Cc 123"
                      value={font.sample || ''}
                      onChange={(e) => handleFontChange(index, 'sample', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Results section editor
  const renderResultsEditor = (data: any) => {
    const handleMetricChange = (index: number, field: string, value: string) => {
      const updatedMetrics = [...(data.metrics || [])]
      updatedMetrics[index] = { ...updatedMetrics[index], [field]: value }
      handleDataChange('metrics', updatedMetrics)
    }

    const addMetric = () => {
      const updatedMetrics = [...(data.metrics || []), { value: '0%', label: 'Nueva Métrica' }]
      handleDataChange('metrics', updatedMetrics)
    }

    const removeMetric = (index: number) => {
      const updatedMetrics = (data.metrics || []).filter((_: any, i: number) => i !== index)
      handleDataChange('metrics', updatedMetrics)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
            <input
              type="text"
              value={data.sectionNumber || ''}
              onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleDataChange('title', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.description')}</label>
          <textarea
            rows={4}
            value={data.description || ''}
            onChange={(e) => handleDataChange('description', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">Métricas / KPIs</label>
            <button
              onClick={addMetric}
              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-white transition-colors"
            >
              <Plus size={10} /> Añadir Métrica
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {(data.metrics || []).map((metric: any, index: number) => (
              <div key={index} className="flex gap-2 items-center bg-white/[0.01] p-2 border border-white/5 rounded-lg">
                <input
                  type="text"
                  placeholder="Valor (ej: +47%)"
                  value={metric.value || ''}
                  onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                  className="w-24 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Etiqueta"
                  value={metric.label || ''}
                  onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                  className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                />
                <button
                  onClick={() => removeMetric(index)}
                  className="p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // UX Flow section editor
  const renderUXFlowEditor = (data: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
          <input
            type="text"
            value={data.sectionNumber || ''}
            onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => handleDataChange('title', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.description')}</label>
        <textarea
          rows={3}
          value={data.description || ''}
          onChange={(e) => handleDataChange('description', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none resize-none"
          placeholder="Descripción opcional del flujo UX"
        />
      </div>

      <ImageUploader
        label="Imagen del Flujo UX"
        value={data.image || ''}
        onChange={(val) => handleDataChange('image', val)}
        withOcr={true}
        onOcrClick={() => setOcrOpen(true)}
      />
    </div>
  )

  // Generic fallback editor
  const renderFallbackEditor = (data: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionNumber')}</label>
          <input
            type="text"
            value={data.sectionNumber || ''}
            onChange={(e) => handleDataChange('sectionNumber', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionTitle')}</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => handleDataChange('title', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.description')}</label>
        <textarea
          rows={5}
          value={data.description || data.contextText || ''}
          onChange={(e) => handleDataChange(data.description !== undefined ? 'description' : 'contextText', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none resize-none"
        />
      </div>

      {data.image !== undefined && (
        <ImageUploader
          label={t('inspector.field.imageUrl')}
          value={data.image || ''}
          onChange={(val) => handleDataChange('image', val)}
          withOcr={true}
          onOcrClick={() => setOcrOpen(true)}
        />
      )}
    </div>
  )

  const renderContentTab = () => {
    switch (section.type) {
      case 'cover':
        return renderCoverEditor(section.data)
      case 'overview':
        return renderOverviewEditor(section.data)
      case 'color-palette':
        return renderPaletteEditor(section.data)
      case 'mockups':
        return renderMockupsEditor(section.data)
      case 'footer':
        return renderFooterEditor(section.data)
      case 'problem':
        return renderProblemEditor(section.data)
      case 'process':
        return renderProcessEditor(section.data)
      case 'typography':
        return renderTypographyEditor(section.data)
      case 'results':
        return renderResultsEditor(section.data)
      case 'ux-flow':
        return renderUXFlowEditor(section.data)
      default:
        return renderFallbackEditor(section.data)
    }
  }

  const renderStyleTab = () => {
    const isInheriting = section.style.background.startsWith('var(')
    
    const fontFamilies = [
      'Montserrat', 'Sora', 'Manrope', 'Space Grotesk', 'DM Sans', 'Inter', 'Bebas Neue', 'Playfair Display'
    ]

    const gradientPresets = [
      { name: 'Color Sólido / Tema', value: 'var(--bg-section)' },
      { name: 'Charcoal Editorial', value: 'linear-gradient(180deg, #1a1410 0%, #0E0B09 100%)' },
      { name: 'Sunset Glow', value: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
      { name: 'Midnight Purple', value: 'linear-gradient(135deg, #2e0854 0%, #0E0B09 100%)' },
      { name: 'Deep Forest', value: 'linear-gradient(135deg, #0b2416 0%, #050f09 100%)' },
      { name: 'Ocean Depth', value: 'linear-gradient(180deg, #0a192f 0%, #020c1b 100%)' },
      { name: 'Vibrant Orange', value: 'linear-gradient(135deg, #f97316 0%, #b45309 100%)' }
    ]

    const handleInheritToggle = () => {
      if (isInheriting) {
        handleStyleChange('background', '#18181b')
        handleStyleChange('textColor', '#ffffff')
        handleStyleChange('accentColor', '#a78bfa')
      } else {
        handleStyleChange('background', 'var(--bg-section)')
        handleStyleChange('textColor', 'var(--text)')
        handleStyleChange('accentColor', 'var(--accent)')
      }
    }

    return (
      <div className="space-y-4">
        {/* Inherit Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <div>
            <span className="text-xs text-white font-semibold block">{t('inspector.style.inheritTheme')}</span>
            <span className="text-[10px] text-zinc-500 block">{t('inspector.style.inheritDesc')}</span>
          </div>
          <input
            type="checkbox"
            checked={isInheriting}
            onChange={handleInheritToggle}
            className="accent-violet-600 cursor-pointer"
          />
        </div>

        {/* Font Override selectors */}
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
          <span className="text-xs text-white font-semibold block">{t('inspector.style.fonts')}</span>
          
          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.style.displayFont')}</label>
            <CustomSelect
              value={section.style.displayFont || 'default'}
              onChange={(val) => handleStyleChange('displayFont', val === 'default' ? undefined : val)}
              options={[
                { value: 'default', label: 'Heredar del Tema' },
                ...fontFamilies.map(f => ({ value: f, label: f }))
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>
        </div>

        {!isInheriting && (
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
            <span className="text-xs text-white font-semibold block">{t('inspector.style.customColors')}</span>

            {/* Gradient Preset Picker */}
            <div>
              <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.style.gradientPresets')}</label>
              <CustomSelect
                value={gradientPresets.find(p => p.value === section.style.background) ? section.style.background : 'custom'}
                onChange={(val) => {
                  if (val !== 'custom') {
                    handleStyleChange('background', val)
                  }
                }}
                options={[
                  { value: 'custom', label: 'Gradiente o color personalizado' },
                  ...gradientPresets.map(preset => ({ value: preset.value, label: preset.name }))
                ]}
                className="w-full"
                triggerClassName="w-full py-2 justify-between"
                dropdownClassName="w-full"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.style.bgCssCode')}</label>
              <input
                type="text"
                value={section.style.background || ''}
                onChange={(e) => handleStyleChange('background', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.style.textColor')}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={section.style.textColor.startsWith('#') ? section.style.textColor : '#ffffff'}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={section.style.textColor || ''}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.style.accentColor')}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={section.style.accentColor.startsWith('#') ? section.style.accentColor : '#aa3bff'}
                  onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                  className="w-8 h-8 rounded border border-white/15 bg-transparent p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={section.style.accentColor || ''}
                  onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Layout Panel */}
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
          <span className="text-xs text-white font-semibold block">{t('inspector.style.layoutConfig')}</span>

          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.paddings')}</label>
            <input
              type="text"
              value={section.style.padding || ''}
              placeholder="Ej: 100px 80px"
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.sectionWidth')}</label>
            <CustomSelect
              value={section.style.width || '1600px'}
              onChange={(val) => handleStyleChange('width', val)}
              options={[
                { value: '1600px', label: '1600px (Full bleed de Behance)' },
                { value: '1200px', label: '1200px (Contenido Estándar)' },
                { value: '100%', label: '100% (Fluido)' }
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>
        </div>

        {/* Text Sizes Panel */}
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
          <span className="text-xs text-white font-semibold block">Personalización de Textos</span>
          
          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">Tamaño del Título</label>
            <CustomSelect
              value={section.style.titleSize || 'xl'}
              onChange={(val) => handleStyleChange('titleSize', val)}
              options={[
                { value: 'sm', label: 'Pequeño (xl)' },
                { value: 'md', label: 'Mediano (2xl)' },
                { value: 'lg', label: 'Grande (3xl)' },
                { value: 'xl', label: 'Muy Grande (4xl/5xl)' },
                { value: '2xl', label: 'Gigante (6xl)' },
                { value: 'display', label: 'Display (Gigante)' }
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">Tamaño de Descripción/Subtítulo</label>
            <CustomSelect
              value={section.style.subtitleSize || 'lg'}
              onChange={(val) => handleStyleChange('subtitleSize', val)}
              options={[
                { value: 'sm', label: 'Pequeño (sm)' },
                { value: 'md', label: 'Mediano (base)' },
                { value: 'lg', label: 'Grande (lg)' },
                { value: 'xl', label: 'Muy Grande (xl)' },
                { value: '2xl', label: 'Destacado (2xl)' }
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">Alineación de Encabezados</label>
            <CustomSelect
              value={section.style.textAlign || 'left'}
              onChange={(val) => handleStyleChange('textAlign', val)}
              options={[
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centrado' }
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>
        </div>

        {/* Elements Panel */}
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
          <span className="text-xs text-white font-semibold block">Redondeado de Tarjetas/Grillas</span>

          <div>
            <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">Redondeado de Bordes (Radius)</label>
            <CustomSelect
              value={section.style.radius || '12px'}
              onChange={(val) => handleStyleChange('radius', val)}
              options={[
                { value: '0px', label: '0px (Recto)' },
                { value: '4px', label: '4px (Suave)' },
                { value: '8px', label: '8px (Regular)' },
                { value: '12px', label: '12px (Redondeado)' },
                { value: '16px', label: '16px (Grande)' },
                { value: '24px', label: '24px (Píldora)' }
              ]}
              className="w-full"
              triggerClassName="w-full py-2 justify-between"
              dropdownClassName="w-full"
            />
          </div>
        </div>

      </div>
    )
  }

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
        <h4 className="text-xs font-semibold text-white">{t('inspector.advanced.sectionState')}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => toggleSectionVisibility(section.id)}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300 hover:text-white transition-all"
          >
            {section.visible ? (
              <>
                <EyeOff size={12} />
                <span>{t('inspector.advanced.hide')}</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span>{t('inspector.advanced.show')}</span>
              </>
            )}
          </button>
          <button
            onClick={() => deleteSection(section.id)}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 transition-all"
          >
            <Trash2 size={12} />
            <span>{t('inspector.advanced.delete')}</span>
          </button>
        </div>
      </div>

      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1 text-xs text-zinc-500 font-mono">
        <div>ID: <span className="text-zinc-400 select-all">{section.id}</span></div>
        <div>Tipo: <span className="text-zinc-400">{section.type}</span></div>
        <div>Posición: <span className="text-zinc-400">{section.order}</span></div>
      </div>
    </div>
  )

  return (
    <aside className="w-full lg:w-80 bg-[#13131a] border-l border-white/5 flex flex-col h-full z-20 shrink-0">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-white/5 shrink-0 bg-[#0e0e11]">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-all ${
            activeTab === 'content'
              ? 'border-violet-500 text-white bg-white/[0.02]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t('inspector.tabs.content')}
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-all ${
            activeTab === 'style'
              ? 'border-violet-500 text-white bg-white/[0.02]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t('inspector.tabs.style')}
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-all ${
            activeTab === 'advanced'
              ? 'border-violet-500 text-white bg-white/[0.02]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t('inspector.tabs.advanced')}
        </button>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
        {activeTab === 'content' && (
          <div className="space-y-4">
            {['cover', 'overview', 'problem', 'process', 'color-palette', 'results', 'ux-flow', 'mockups'].includes(section.type) && (
              <div className="flex justify-end shrink-0 mb-2">
                <button
                  onClick={() => setOcrOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-600/20 border border-violet-500/20 text-[10px] font-bold text-violet-400 hover:text-white hover:bg-violet-600 hover:border-violet-500 rounded-lg transition-all"
                  title="Extraer texto de una captura"
                >
                  <ScanText size={11} />
                  <span>OCR (Extraer de Imagen)</span>
                </button>
              </div>
            )}
            {renderContentTab()}
          </div>
        )}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}

        {ocrOpen && (
          <OcrModal
            section={section}
            onClose={() => setOcrOpen(false)}
          />
        )}
      </div>
    </aside>
  )
}
export default SectionInspector
