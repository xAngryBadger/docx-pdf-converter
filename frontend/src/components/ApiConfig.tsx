import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getApiUrl, setApiUrl, hasApiUrl } from '../lib/api'

interface ApiConfigProps {
  colabUrl: string
}

export function ApiConfig({ colabUrl }: ApiConfigProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(getApiUrl)
  const [saved, setSaved] = useState(false)
  const [connected, setConnected] = useState(hasApiUrl)

  const handleSave = () => {
    if (!url.trim()) return
    setApiUrl(url)
    setConnected(true)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setOpen(false)
    }, 1200)
  }

  const handleClear = () => {
    setUrl('')
    setApiUrl('')
    setConnected(false)
    setOpen(false)
  }

  const isConnected = connected

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 border ${
          isConnected
            ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
            : 'border-[var(--color-amber-light)] text-[var(--color-amber-light)]'
        }`}
        aria-label="Configure API URL"
      >
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-amber-light)]'}`} />
        <span className="label-mono text-xs">
          {isConnected ? 'API Online' : 'Sem API'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[22rem] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] z-50"
          >
            <div className="px-5 pt-5 pb-4 fade-border-bottom">
              <p className="eyebrow text-[var(--color-text-muted)] mb-3">Conectar Backend</p>
              <ol className="space-y-3 text-sm text-[var(--color-text-muted)]">
                <li className="flex gap-3">
                  <span className="font-serif text-[var(--color-accent)] text-lg leading-none opacity-70 select-none">1</span>
                  <span>
                    <a
                      href={colabUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
                    >
                      Abra o notebook no Colab
                    </a>
                    {' '}e rode as 4 células
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif text-[var(--color-accent)] text-lg leading-none opacity-70 select-none">2</span>
                  <span>Copie a URL <span className="label-mono text-[var(--color-amber-light)]">ngrok-free.app</span> que aparece na saída</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif text-[var(--color-accent)] text-lg leading-none opacity-70 select-none">3</span>
                  <span>Cole abaixo e salve</span>
                </li>
              </ol>
            </div>

            <div className="px-5 pt-4 pb-5">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxx.ngrok-free.app"
                className="w-full bg-[var(--color-bg)] border-b border-[var(--color-border)] px-0 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-muted)] font-mono text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleSave}
                  className="btn-clipped flex-1"
                >
                  <span className="btn-text-back text-xs font-semibold">
                    {saved ? 'Salvo!' : 'Salvar'}
                  </span>
                </button>
                {isConnected && (
                  <button
                    onClick={handleClear}
                    className="px-3 py-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-amber-light)] transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
