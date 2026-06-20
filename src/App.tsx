import { useState } from 'react'
import { Toolbar } from './components/editor/Toolbar'
import { SectionList } from './components/editor/SectionList'
import { EditorCanvas } from './components/editor/EditorCanvas'
import { SectionInspector } from './components/editor/SectionInspector'
import { useProjectStore } from './lib/store/projectStore'
import { exportProjectToHTML } from './lib/export/htmlExporter'
import { Dashboard } from './components/dashboard/Dashboard'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'

function App() {
  const [previewMode, setPreviewMode] = useState(false)
  const { project, view } = useProjectStore()

  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'sections' | 'inspector'>('canvas')

  if (view === 'dashboard') {
    return <Dashboard />
  }

  const handleExportHTML = async () => {
    try {
      const htmlContent = exportProjectToHTML(project)
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
          alert('¡Archivo guardado con éxito!')
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
      console.error('Error exporting HTML:', error)
      alert('Hubo un error al exportar el archivo HTML.')
    }
  }
  const handleCopyHTML = () => {
    try {
      const htmlContent = exportProjectToHTML(project)
      navigator.clipboard.writeText(htmlContent)
      alert('¡Código HTML standalone copiado al portapapeles! Listo para subir a Behance o guardar.')
    } catch (error) {
      console.error('Error copying HTML:', error)
      alert('Hubo un error al copiar el HTML.')
    }
  }
  const handleExportImage = async (format: 'png' | 'webp') => {
    const el = document.getElementById('brief-canvas-export')
    if (!el) return

    try {
      const options = {
        style: {
          width: '1600px',
          transform: 'none',
          transformOrigin: 'top center',
          margin: '0',
          padding: '0'
        },
        width: 1600,
      }

      let dataUrl = ''
      const htmlToImage = await import('html-to-image') as any

      if (format === 'webp') {
        dataUrl = await htmlToImage.toWebp(el, options)
      } else {
        dataUrl = await htmlToImage.toPng(el, options)
      }

      const link = document.createElement('a')
      link.href = dataUrl
      const safeTitle = project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'case-study'
      
      link.setAttribute('download', `${safeTitle}-brief.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting image:', error)
      alert('Hubo un error al exportar la imagen. Verifica que todas las imágenes del lienzo se hayan cargado correctamente.')
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0e0e11] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Upper header */}
      <Toolbar 
        previewMode={previewMode} 
        setPreviewMode={setPreviewMode} 
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
          <EditorCanvas previewMode={previewMode} />
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
            <span>Secciones</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('canvas')}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-semibold transition-all ${
              activeMobileTab === 'canvas' ? 'text-violet-400 bg-white/[0.02]' : 'text-zinc-500'
            }`}
          >
            <span className="text-base mb-0.5">🎨</span>
            <span>Lienzo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('inspector')}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-semibold transition-all ${
              activeMobileTab === 'inspector' ? 'text-violet-400 bg-white/[0.02]' : 'text-zinc-500'
            }`}
          >
            <span className="text-base mb-0.5">⚙️</span>
            <span>Propiedades</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default App
