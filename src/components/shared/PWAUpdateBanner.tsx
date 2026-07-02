import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useToast } from './ToastProvider'
import { useTranslation } from 'react-i18next'
import { RefreshCw, X } from 'lucide-react'

export function PWAUpdateBanner() {
  const toast = useToast()
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh:  [needRefresh,  setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  // One-shot toast when the app is cached for offline use
  useEffect(() => {
    if (!offlineReady) return
    toast.success(t('pwa.offlineReady'))
    setOfflineReady(false)
  }, [offlineReady, toast, setOfflineReady, t])

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3',
        'bg-[#1a1a2e] border border-violet-500/40',
        'text-white px-4 py-3 rounded-2xl shadow-2xl shadow-violet-900/40',
        'text-sm font-medium',
        'animate-in fade-in slide-in-from-bottom-4 duration-300',
      ].join(' ')}
    >
      <RefreshCw size={15} className="text-violet-400 shrink-0" />

      <span className="text-zinc-200">
        {t('pwa.updateAvailable')}
      </span>

      <button
        onClick={() => updateServiceWorker(true)}
        className={[
          'ml-1 px-3 py-1 rounded-lg text-xs font-bold',
          'bg-violet-600 hover:bg-violet-500 text-white',
          'transition-colors shrink-0',
        ].join(' ')}
      >
        {t('pwa.update')}
      </button>

      <button
        onClick={() => setNeedRefresh(false)}
        aria-label={t('pwa.dismiss')}
        className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}
