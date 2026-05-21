import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Preloader } from './components/Preloader'
import { useLenis } from './hooks/useLenis'
import { revealVariants, staggerContainer } from './hooks/useScrollReveal'
import { apiUrl, apiHeaders } from './lib/api'
import { ApiConfig } from './components/ApiConfig'
import { BetaBanner } from './components/BetaBanner'

const COLAB_URL = 'https://colab.research.google.com/github/xAngryBadger/docx-pdf-converter/blob/main/colab-backend.ipynb'

type ConvertMode = 'docx-pdf' | 'xlsx-pdf' | 'pdf-compress' | 'batch'

interface ConvertResult {
  original: string
  converted?: string
  status: 'success' | 'error'
  error?: string
}

function App() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(() => !localStorage.getItem('badger-beta-banner-dismissed'))
  const [mode, setMode] = useState<ConvertMode>('docx-pdf')
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)
  const [results, setResults] = useState<ConvertResult[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useLenis()

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...selectedFiles])
    }
  }, [])

  const handleConvert = async () => {
    if (files.length === 0) return
    setConverting(true)
    setResults([])

  const formData = new FormData()

  try {
    if (files.length === 1 && mode !== 'batch') {
      formData.append('file', files[0])

        const endpoint =
          mode === 'docx-pdf' ? apiUrl('/api/convert/docx-pdf') :
          mode === 'xlsx-pdf' ? apiUrl('/api/convert/xlsx-pdf') :
          apiUrl('/api/convert/pdf-compress')

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: apiHeaders(),
        })

        if (!response.ok) throw new Error('Conversion failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const originalName = files[0].name
        const newName = originalName.replace(/\.(docx|xlsx|pdf)$/, '.pdf')

        setResults([{ original: originalName, converted: newName, status: 'success' }])

        const link = document.createElement('a')
        link.href = url
        link.download = newName
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 10000)
    } else {
      files.forEach(file => formData.append('files', file))
      const response = await fetch(apiUrl('/api/convert/batch'), {
          method: 'POST',
          body: formData,
          headers: apiHeaders(),
        })

        if (!response.ok) throw new Error('Batch conversion failed')

        const data = await response.json()
        setResults(data.results)
      }
  } catch (error) {
    if (error instanceof Error && error.message === 'NO_API_URL') {
      alert('Configure a URL da API primeiro. Clique em "Sem API" no header e cole a URL do Cloudflare.')
    } else {
      console.error('Error:', error)
      setResults([{ original: files[0].name, status: 'error', error: 'Erro na conversão. Verifique se o backend está online.' }])
    }
    } finally {
      setConverting(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setFiles([])
    setResults([])
  }

  const modeOptions: { key: ConvertMode; label: string; desc: string }[] = [
    { key: 'docx-pdf', label: 'DOCX → PDF', desc: 'Word para PDF' },
    { key: 'xlsx-pdf', label: 'XLSX → PDF', desc: 'Excel para PDF' },
    { key: 'pdf-compress', label: 'Comprimir', desc: 'Reduzir PDF' },
    { key: 'batch', label: 'Lote', desc: 'Múltiplos arquivos' },
  ]

  return (
    <>
      {showPreloader && <Preloader title="DocX Converter" onComplete={() => setShowPreloader(false)} />}

      <div className="noise-overlay noise-overlay--animated" aria-hidden="true" />

      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0 0)' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
      >
      <BetaBanner colabUrl={COLAB_URL} onDismiss={() => setBannerVisible(false)} />
      <header className={`fixed left-0 right-0 z-40 fade-border-bottom h-16 flex items-center transition-top duration-300 ${bannerVisible ? 'top-[44px]' : 'top-0'}`} style={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(11,15,25,0.8)' }}>
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-8 h-8 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-lg font-serif font-normal tracking-tight text-[var(--color-cream)]">DocX Converter</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
        <ApiConfig colabUrl={COLAB_URL} />
        <span className="label-mono text-[var(--color-text-muted)]">DOCX · XLSX · PDF</span>
      </div>
          </div>
        </header>

        <main className={`max-w-5xl mx-auto px-6 pb-16 lg:px-8 transition-[padding] duration-300 ${bannerVisible ? 'pt-[7rem]' : 'pt-20'}`}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={revealVariants} custom={0} className="mb-12 text-center">
              <p className="eyebrow text-[var(--color-primary)] mb-3">Conversão de Documentos</p>
              <h2 className="text-3xl md:text-4xl font-serif font-normal text-[var(--color-cream)] leading-tight">
                Converta em lote.<br />
                <span className="text-[var(--color-amber-light)]">Sem limites.</span>
              </h2>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-md mx-auto">
          DOCX, XLSX para PDF — ou comprima PDFs existentes.
          Backend gratuito via Google Colab, sem cadastro.
        </p>
            </motion.div>

            <motion.div variants={revealVariants} custom={0.1} className="editorial-divider pb-8 mb-8">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="section-number">01</span>
                <h3 className="text-xl font-serif font-normal text-[var(--color-cream)]">Modo de Conversão</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {modeOptions.map((opt) => (
                  <button
                    key={opt.key}
          onClick={() => setMode(opt.key)}
          aria-pressed={mode === opt.key}
          className={`group relative py-4 px-4 text-left transition-all duration-200 ${
                      mode === opt.key
                        ? 'bg-[var(--color-primary)] text-[var(--color-cream)]'
                        : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-b border-[var(--color-border)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    <span className="block text-sm font-medium">{opt.label}</span>
                    <span className={`block label-mono mt-1 ${mode === opt.key ? 'text-[var(--color-cream)]/70' : 'text-[var(--color-text-muted)]'}`}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={revealVariants} custom={0.2} className="editorial-divider pb-8 mb-8">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="section-number">02</span>
                <h3 className="text-xl font-serif font-normal text-[var(--color-cream)]">Arquivos</h3>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`relative border border-dashed transition-all duration-300 cursor-pointer geometric-bg ${
                  isDragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
                style={{ minHeight: '200px' }}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  id="file-input"
                  accept=".docx,.xlsx,.pdf"
                />
                <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center justify-center py-16 px-8 relative z-10">
  <motion.svg
          className="w-10 h-10 text-[var(--color-primary)] mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          animate={{ y: isDragging ? -4 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </motion.svg>
                  <p className="font-serif text-lg text-[var(--color-cream)]">Arraste arquivos aqui</p>
                  <p className="label-mono text-[var(--color-text-muted)] mt-2">ou clique para selecionar · DOCX, XLSX, PDF</p>
                </label>
              </div>

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <p className="eyebrow text-[var(--color-text-muted)]">
                        {files.length} arquivo{files.length !== 1 ? 's' : ''}
                      </p>
                      <button
                        onClick={clearAll}
                        className="label-mono text-[var(--color-text-muted)] hover:text-[var(--color-amber-light)] transition-colors"
                      >
                        Limpar tudo
                      </button>
                    </div>

                <div className="space-y-0 max-h-64 overflow-y-auto pr-2">
                      {files.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between py-3 editorial-divider"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--color-text)] truncate">{file.name}</p>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="label-mono text-[var(--color-text-muted)]">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-[var(--color-text-muted)] hover:text-[var(--color-amber-light)] transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleConvert}
                        disabled={converting || files.length === 0}
                        className="btn-clipped w-full"
                      >
                        <span className="btn-text-back flex items-center justify-center gap-2 font-semibold text-sm tracking-wide">
                          {converting ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Convertendo...
                            </>
                          ) : (
                            `Converter ${files.length} arquivo${files.length !== 1 ? 's' : ''}`
                          )}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                >
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="section-number">03</span>
                    <h3 className="text-xl font-serif font-normal text-[var(--color-cream)]">Resultados</h3>
                  </div>

                  <div className="space-y-0">
                    {results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between py-3 editorial-divider"
                      >
                        <div className="flex items-center gap-3">
                          <span className={result.status === 'success' ? 'text-[var(--color-primary)]' : 'text-[var(--color-amber-light)]'}>
                            {result.status === 'success' ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </span>
                          <div>
                            <p className="text-sm text-[var(--color-text)]">{result.original}</p>
                            {result.converted && (
                              <p className="label-mono text-[var(--color-primary)] mt-0.5">→ {result.converted}</p>
                            )}
                          </div>
                        </div>
                        {result.error && (
                          <span className="label-mono text-[var(--color-amber-light)] text-xs">{result.error}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        <footer className="fade-border-top px-6 py-6 mt-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="font-serif text-sm text-[var(--color-text-muted)]">
              Desenvolvido por Isaac Nathan
            </p>
            <a
              href="https://github.com/xAngryBadger"
              className="link-underline label-mono text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
            >
              GitHub
            </a>
          </div>
        </footer>
      </motion.div>
    </>
  )
}

export default App
