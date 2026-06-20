import React, { useState } from 'react'
import { useProjectStore } from '../../lib/store/projectStore'
import type { ThemeId } from '../../lib/types/project.types'
import { Undo2, Redo2, Eye, Download, Sparkles, Copy, Printer, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  previewMode: boolean
  setPreviewMode: (mode: boolean) => void
  onExportHTML: () => void
  onCopyHTML: () => void
  onExportImage: (format: 'png' | 'webp') => void
}

export function Toolbar({ previewMode, setPreviewMode, onExportHTML, onCopyHTML, onExportImage }: Props) {
  const { project, past, future, setTheme, undo, redo, setView, updateProjectTitle } = useProjectStore()
  const { t, i18n } = useTranslation()
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeId)
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'es'

  return (
    <header className="h-16 border-b border-white/5 bg-[#13131a] px-6 flex items-center justify-between z-30 relative shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('dashboard')}
          className="p-2 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all mr-1 shrink-0"
          title={t('toolbar.backToDashboard')}
          aria-label={t('toolbar.backToDashboard')}
        >
          <Home size={14} />
        </button>
        
        <img
          src="/favicon.png"
          alt="Logo"
          className="w-8 h-8 rounded-lg shadow-lg shadow-violet-500/20 object-cover shrink-0"
        />
        
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase block">{t('toolbar.appName')}</span>
          <input
            type="text"
            value={project.title}
            onChange={(e) => updateProjectTitle(e.target.value)}
            className="text-sm font-semibold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-violet-500 focus:outline-none py-0.5 px-0 min-w-[200px]"
            title="Editar nombre del brief"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold">
          <span className="text-xs">🌐</span>
          <select
            value={currentLang}
            onChange={handleLanguageChange}
            className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="pt">PT</option>
          </select>
        </div>

        {/* Themes selector */}
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">{t('toolbar.theme')}:</span>
          <select
            value={project.theme}
            onChange={handleThemeChange}
            className="bg-zinc-900 border border-white/10 rounded-lg text-xs px-3 py-1.5 font-medium text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <optgroup label={t('themes.groupDark', { defaultValue: 'Temas Oscuros' })}>
              <option value="dark-editorial">Dark Editorial</option>
              <option value="minimal">Minimal</option>
              <option value="neon-noir">Neon Noir</option>
              <option value="ocean-tech">Ocean Tech</option>
              <option value="rose-editorial">Rose Editorial</option>
              <option value="forest-sage">Forest Sage</option>
            </optgroup>
            <optgroup label={t('themes.groupLight', { defaultValue: 'Temas Claros' })}>
              <option value="clean-light">Clean Light</option>
              <option value="warm-parchment">Warm Parchment</option>
            </optgroup>
          </select>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            title="Deshacer (Cmd+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            title="Rehacer (Cmd+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Mode switcher & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              previewMode
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-zinc-900 text-zinc-300 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>{previewMode ? t('toolbar.edit') : t('toolbar.preview')}</span>
          </button>

          {previewMode && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
            >
              <Printer size={14} />
              <span>{t('toolbar.printPdf')}</span>
            </button>
          )}

          <button
            onClick={onCopyHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-200 border border-white/10 hover:text-white transition-all shrink-0"
          >
            <Copy size={14} />
            <span className="hidden sm:inline">{t('toolbar.copyHtml')}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all shrink-0"
            >
              <Download size={14} />
              <span>Exportar...</span>
            </button>

            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      onExportHTML()
                      setShowExportMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-zinc-200 hover:text-white transition-colors"
                  >
                    📥 Descargar HTML
                  </button>
                  <button
                    onClick={() => {
                      onExportImage('png')
                      setShowExportMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-zinc-200 hover:text-white transition-colors"
                  >
                    🖼️ Exportar PNG (Imagen)
                  </button>
                  <button
                    onClick={() => {
                      onExportImage('webp')
                      setShowExportMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-zinc-200 hover:text-white transition-colors"
                  >
                    ⚡ Exportar WEBP (Imagen)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
export default Toolbar
