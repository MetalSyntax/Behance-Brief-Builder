import { useState } from 'react'
import { useProjectStore } from '../../lib/store/projectStore'
import { Info, Trash2, Plus, Eye, EyeOff, ScanText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ImageUploader } from '../shared/ImageUploader'
import { OcrModal } from '../ocr/OcrModal'

type Tab = 'content' | 'style' | 'advanced'

export function SectionInspector() {
  const { activeSectionId, project, updateSection, updateSectionStyle, deleteSection, toggleSectionVisibility } = useProjectStore()
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [ocrOpen, setOcrOpen] = useState(false)
  const { t } = useTranslation()

  const section = project.sections.find((s) => s.id === activeSectionId)

  if (!section) {
    return (
      <aside className="w-80 bg-[#13131a] border-l border-white/5 flex flex-col items-center justify-center p-6 text-center text-zinc-500 shrink-0">
        <Info size={24} className="mb-2 text-zinc-600" />
        <p className="text-xs">{t('inspector.empty')}</p>
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
          <select
            value={data.titleSize || 'xl'}
            onChange={(e) => handleDataChange('titleSize', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          >
            <option value="xl">Estándar (xl)</option>
            <option value="xxl">Grande (2xl)</option>
            <option value="display">Gigante (Display)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.field.alignment')}</label>
          <select
            value={data.layout || 'left'}
            onChange={(e) => handleDataChange('layout', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          >
            <option value="left">{t('inspector.field.alignLeft')}</option>
            <option value="centered">{t('inspector.field.alignCenter')}</option>
          </select>
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
          <select
            value={data.layout || 'grid'}
            onChange={(e) => handleDataChange('layout', e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
          >
            <option value="grid">Grilla (Grid)</option>
            <option value="horizontal-strip">Franja Horizontal</option>
          </select>
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
            <select
              value={data.layout || 'grid-2'}
              onChange={(e) => handleDataChange('layout', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            >
              <option value="grid-2">2 Columnas</option>
              <option value="grid-3">3 Columnas</option>
              <option value="centered-large">Centrado Grande</option>
              <option value="scattered">Scattered (Disperso)</option>
            </select>
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
                  <select
                    value={mock.deviceFrame || 'none'}
                    onChange={(e) => handleMockupChange(index, 'deviceFrame', e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                  >
                    <option value="none">Sin Frame</option>
                    <option value="phone">Móvil (Phone)</option>
                    <option value="tablet">Tablet</option>
                    <option value="browser">Navegador</option>
                  </select>
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
            <select
              value={section.style.background ? 'default' : 'default'}
              onChange={() => {
                alert('La fuente display se configura a nivel de tema en esta versión de scaffolding.')
              }}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
              disabled
            >
              <option value="default">Heredar del Tema ({project.theme === 'dark-editorial' ? 'Montserrat' : project.theme === 'clean-light' ? 'Sora' : 'Inter'})</option>
              {fontFamilies.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {!isInheriting && (
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
            <span className="text-xs text-white font-semibold block">{t('inspector.style.customColors')}</span>

            {/* Gradient Preset Picker */}
            <div>
              <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 block mb-1 uppercase">{t('inspector.style.gradientPresets')}</label>
              <select
                value={gradientPresets.find(p => p.value === section.style.background) ? section.style.background : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    handleStyleChange('background', e.target.value)
                  }
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
              >
                <option value="custom">Gradiente o color personalizado</option>
                {gradientPresets.map(preset => (
                  <option key={preset.name} value={preset.value}>{preset.name}</option>
                ))}
              </select>
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
            <select
              value={section.style.width || '1600px'}
              onChange={(e) => handleStyleChange('width', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
            >
              <option value="1600px">1600px (Full bleed de Behance)</option>
              <option value="1200px">1200px (Contenido Estándar)</option>
              <option value="100%">100% (Fluido)</option>
            </select>
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
