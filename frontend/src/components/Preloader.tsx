import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PreloaderProps {
  title?: string
  onComplete?: () => void
}

export function Preloader({ title = 'Badger Tools', onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const rafIdRef = useRef(0)

  const animateSmooth = useCallback(() => {
    let visual = 0
    let target = 0
    let loaded = 0
    const assets = [...document.images, ...document.querySelectorAll('link[rel="stylesheet"]')]
    const total = assets.length || 1

    function step() {
      visual += (target - visual) * 0.08
      setProgress(Math.round(visual))

      if (visual < 99.5) {
        rafIdRef.current = requestAnimationFrame(step)
      } else {
        setProgress(100)
        setTimeout(() => {
          setIsComplete(true)
          onComplete?.()
        }, 300)
      }
    }

    function done() {
      loaded++
      if (loaded > total) loaded = total
      target = (loaded / total) * 100
    }

    assets.forEach((el) => {
      if ((el as HTMLImageElement).complete || (el as HTMLLinkElement).sheet) {
        done()
      } else {
        el.addEventListener('load', done, { once: true })
        el.addEventListener('error', done, { once: true })
      }
    })

    setTimeout(() => {
      loaded = total
      target = 100
    }, 3000)

    window.addEventListener('load', () => {
      loaded = total
      target = 100
    })

    rafIdRef.current = requestAnimationFrame(step)
  }, [onComplete])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    animateSmooth()
    return () => {
      cancelAnimationFrame(rafIdRef.current)
      document.body.style.overflow = ''
    }
  }, [animateSmooth])

  const paddedProgress = String(progress).padStart(3, '0')

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ clipPath: 'inset(0 0 0 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg)]"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
            className="text-center mb-12"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="eyebrow text-[var(--color-primary)] mb-4"
            >
              Badger Tools
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
              className="text-4xl md:text-5xl font-serif font-normal tracking-wide text-[var(--color-cream)]"
            >
              {title}
            </motion.h1>
          </motion.div>

          <div className="w-full max-w-xs px-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
              <span className="counter-animate text-2xl font-serif text-[var(--color-cream)] tabular-nums">
                {paddedProgress}
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="label-mono text-[var(--color-text-muted)] mt-4 text-center"
            >
              {progress < 100 ? 'Carregando' : 'Pronto'}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
