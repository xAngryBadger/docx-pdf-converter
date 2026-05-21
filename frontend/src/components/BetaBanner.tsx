import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BANNER_KEY = 'badger-beta-banner-dismissed'

interface BetaBannerProps {
  colabUrl: string
  onDismiss?: () => void
}

export function BetaBanner({ colabUrl, onDismiss }: BetaBannerProps) {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(BANNER_KEY))

  const handleDismiss = useCallback(() => {
    localStorage.setItem(BANNER_KEY, '1')
    setDismissed(true)
    onDismiss?.()
  }, [onDismiss])

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 overflow-hidden bg-[var(--color-bg-elevated)] fade-border-bottom"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              <span className="section-number text-[var(--color-accent)] opacity-100 text-2xl select-none" aria-hidden="true">β</span>
              <p className="text-sm text-[var(--color-text)] leading-relaxed min-w-0">
                <span className="label-mono text-[var(--color-amber-light)] mr-2">BETA</span>
                Esta ferramenta precisa de um backend gratuito no Google Colab.
                <a
                  href={colabUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline label-mono text-[var(--color-primary)] hover:text-[var(--color-primary-light)] ml-1"
                >
                  Abrir no Colab →
                </a>
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-cream)] transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
