import { useState } from 'react'
import { Toolbar } from './components/editor/Toolbar'
import { SectionList } from './components/editor/SectionList'
import { EditorCanvas } from './components/editor/EditorCanvas'
import { SectionInspector } from './components/editor/SectionInspector'
import { TextFormatToolbar } from './components/editor/TextFormatToolbar'
import { useProjectStore } from './lib/store/projectStore'
import { exportProjectToHTML } from './lib/export/htmlExporter'
import { Dashboard } from './components/dashboard/Dashboard'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useToast } from './components/shared/ToastProvider'
import { useTranslation } from 'react-i18next'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'

function App() {
  const { project, view, previewMode } = useProjectStore()
  const toast = useToast()
  const { t, i18n } = useTranslation()
  useKeyboardShortcuts()

  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'sections' | 'inspector'>('canvas')

  if (view === 'dashboard') {
    return <Dashboard />
  }

  const handleExportHTML = async () => {
    try {
      const lang = (i18n as any).language?.split('-')[0] || 'es'
      const htmlContent = exportProjectToHTML(project, lang)
      const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined

      if (isTauri) {
        const safeTitle = project.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || 'case-study'

        const filePath = await save({
          filters: [{
            name: 'HTML Document',
            extensions: ['html']
          }],
          defaultPath: `${safeTitle}-behance-brief.html`
        })

        if (filePath) {
          await writeTextFile(filePath, htmlContent)
          toast.success('¡Archivo HTML guardado con éxito!')
        }
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        // Normalize project title to safe filename
        const safeTitle = project.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || 'case-study'
        
        link.setAttribute('download', `${safeTitle}-behance-brief.html`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error saving file:', error)
      toast.error('Error al guardar el archivo de exportación.')
    }
  }

  const handleCopyHTML = () => {
    try {
      const lang = (i18n as any).language?.split('-')[0] || 'es'
      const htmlContent = exportProjectToHTML(project, lang)
      navigator.clipboard.writeText(htmlContent)
      toast.success('¡Código HTML copiado al portapapeles!')
    } catch (e) {
      console.error('Copy to clipboard failed', e)
      toast.error('No se pudo copiar el HTML. Intenta exportar el archivo.')
    }
  }

  const handleExportImage = async (format: 'png' | 'webp') => {
    try {
      const canvasEl = document.getElementById('brief-canvas-export')
      if (!canvasEl) return

      const htmlToImage = await import('html-to-image') as any

      const filter = (node: HTMLElement) => {
        const exclusionClasses = ['action-btn', 'add-section-btn']
        return !exclusionClasses.some(cls => node.classList?.contains(cls))
      }

      let dataUrl = ''
      if (format === 'webp') {
        dataUrl = await htmlToImage.toWebp(canvasEl, { quality: 0.95, filter })
      } else {
        dataUrl = await htmlToImage.toPng(canvasEl, { quality: 0.95, filter })
      }

      const safeTitle = project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'case-study'

      const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined

      if (isTauri) {
        const filePath = await save({
          filters: [{
            name: `${format.toUpperCase()} Image`,
            extensions: [format]
          }],
          defaultPath: `${safeTitle}-behance-brief.${format}`
        })

        if (filePath) {
          const base64Data = dataUrl.split(',')[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          await writeFile(filePath, bytes)
          toast.success('¡Imagen guardada con éxito!')
        }
      } else {
        const link = document.createElement('a')
        link.download = `${safeTitle}-behance-brief.${format}`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error exporting image:', error)
      toast.error('Error al exportar la imagen. Verifica que todas las imágenes del lienzo estén cargadas.')
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0e0e11] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Upper header */}
      <Toolbar 
        onExportHTML={handleExportHTML} 
        onCopyHTML={handleCopyHTML}
        onExportImage={handleExportImage}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left Sidebar: Sections listing (only in edit mode) */}
        {!previewMode && (
          <div className={`shrink-0 h-full w-full lg:w-80 ${activeMobileTab === 'sections' ? 'block' : 'hidden lg:block'}`}>
            <SectionList />
          </div>
        )}

        {/* Center: Interactive editor canvas */}
        <div className={`flex-1 min-w-0 h-full ${previewMode || activeMobileTab === 'canvas' ? 'block' : 'hidden lg:block'}`}>
          <EditorCanvas />
        </div>

        {/* Right Sidebar: Active properties panel (only in edit mode) */}
        {!previewMode && (
          <div className={`shrink-0 h-full w-full lg:w-80 ${activeMobileTab === 'inspector' ? 'block' : 'hidden lg:block'}`}>
            <SectionInspector />
          </div>
        )}
      </div>

      {/* Mobile Bottom Tab Bar */}
      {!previewMode && (
        <div className="lg:hidden h-14 bg-[#13131a] border-t border-white/5 flex items-center justify-around shrink-0 z-30">
          <button
            type="button"
            onClick={() => setActiveMobileTab('sections')}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-semibold transition-all ${
              activeMobileTab === 'sections' ? 'text-violet-400 bg-white/[0.02]' : 'text-zinc-500'
            }`}
          >
            <span className="text-base mb-0.5">🗂️</span>
            <span>{t('mobile.tabs.sections')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('canvas')}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-semibold transition-all ${
              activeMobileTab === 'canvas' ? 'text-violet-400 bg-white/[0.02]' : 'text-zinc-500'
            }`}
          >
            <span className="text-base mb-0.5">🎨</span>
            <span>{t('mobile.tabs.canvas')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('inspector')}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-semibold transition-all ${
              activeMobileTab === 'inspector' ? 'text-violet-400 bg-white/[0.02]' : 'text-zinc-500'
            }`}
          >
            <span className="text-base mb-0.5">⚙️</span>
            <span>{t('mobile.tabs.inspector')}</span>
          </button>
        </div>
      )}

      {/* Floating formatting toolbar */}
      {!previewMode && <TextFormatToolbar />}
    </div>
  )
}

export default App

