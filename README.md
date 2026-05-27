# Capivara

Suite completa de ferramentas PDF com 15 ferramentas -- converter, comprimir, mesclar, dividir, rotacionar, marca d'agua, numerar paginas, proteger, desbloquear, OCR e mais. Tudo gratuito e privado via backend no Google Colab.

Ferramenta ao vivo: [xangrybadger.github.io/capivara](https://xangrybadger.github.io/capivara/)

## O que faz?

O Capivara e um canivete suico para PDFs no navegador. O frontend React oferece uma grade de 15 ferramentas organizadas por categoria; o backend FastAPI processa cada requisicao com bibliotecas especializadas (pypdf, reportlab, PyMuPDF, pikepdf, pytesseract). O backend roda no Google Colab via tunnel Cloudflare -- sem servidor proprio, sem custo, sem dados enviados a terceiros.

## Funcionalidades

### Converter
- DOCX para PDF (python-docx)
- XLSX para PDF (openpyxl + reportlab)
- PDF para DOCX (PyMuPDF extracao de texto)
- Conversao em lote (multiplos DOCX/XLSX de uma vez)

### Otimizar
- Comprimir PDF (pypdf content stream compression)
- OCR em PDF (pytesseract + pdf2image + reportlab overlay, suporta pt/en)

### Organizar
- Mesclar PDFs (multiplos arquivos em um so)
- Dividir PDF (intervalos de paginas como "1-3,5,7-10")
- Rotacionar PDF (90/180/270 graus)

### Anotar
- Marca d'agua (texto diagonal, opacidade e tamanho configuraveis)
- Numeracao de paginas (4 posicoes, numero inicial configuravel)
- Cabecalho/Rodape (texto overlay)

### Seguranca
- Proteger PDF com senha (criptografia pikepdf)
- Desbloquear/remover senha
- Conversao para PDF/A (pikepdf + metadados XMP)

### Exportar
- PDF para imagens (PNG/JPEG em ZIP, DPI configuravel via PyMuPDF)

## Tecnologias

**Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, Lenis

**Backend:** Python 3.12, FastAPI, uvicorn, pypdf, reportlab, python-docx, openpyxl, PyMuPDF, pikepdf, pytesseract, pdf2image, Pillow

**Deploy:** Render (free plan), Google Colab + cloudflared tunnel

## Pre-requisitos

**Frontend:**
- Node.js 22+
- npm

**Backend (local):**
- Python 3.12+
- Tesseract OCR + Poppler utils (para OCR e PDF-to-imagens)

**Backend (Colab -- recomendado):**
- Conta Google
- Navegador moderno

## Instalacao

**Frontend:**

```bash
cd frontend
npm install
```

**Backend (Colab -- metodo recomendado):**

1. Abra `colab-backend.ipynb` no Google Colab
2. Execute as tres celulas em sequencia
3. Copie a URL `trycloudflare.com` exibida na saida

**Backend (local):**

```bash
pip install -r requirements.txt
# Para OCR: sudo apt install tesseract-ocr tesseract-ocr-por poppler-utils
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## Uso

1. Inicie o backend (Colab ou local)
2. Inicie o frontend: `cd frontend && npm run dev`
3. No header do Capivara, clique em "Sem API" e cole a URL do backend
4. Selecione uma ferramenta na grade
5. Faca upload do(s) arquivo(s) e ajuste os parametros
6. Clique em processar e baixe o resultado

## Comandos

| Comando | Diretorio | Descricao |
|---------|-----------|-----------|
| `npm run dev` | `frontend/` | Servidor de desenvolvimento Vite |
| `npm run build` | `frontend/` | Build de producao |
| `npm run preview` | `frontend/` | Preview do build |
| `npm run lint` | `frontend/` | Lint com ESLint |

## Estrutura

```
capivara/
├── main.py                Backend FastAPI (15 endpoints)
├── colab-backend.ipynb    Notebook Colab com backend + tunnel
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/    ApiConfig, BetaBanner, FileUploader, Preloader, ResultDisplay, ToolGrid, ToolWorkspace
│   │   ├── workspaces/    15 componentes de workspace (um por ferramenta)
│   │   ├── hooks/         useLenis, useHashRouter, useScrollReveal
│   │   └── lib/           api.ts, tools.ts
│   └── package.json
├── requirements.txt
├── render.yaml
└── .github/workflows/     Deploy do frontend no GitHub Pages
```

## Arquitetura

O Capivara segue a arquitetura desacoplada frontend/backend:

- **Frontend (React + Vite):** Grade de ferramentas com hash routing (`useHashRouter`). Cada ferramenta e um workspace isolado com upload, parametros e exibicao de resultados.
- **Backend (FastAPI):** 16 endpoints REST (15 ferramentas + health check). Imports lazy para dependencias pesadas (PyMuPDF, pytesseract, pikepdf) -- carregadas apenas quando necessarias.
- **Tunnel Cloudflare:** O notebook Colab inicia o Uvicorn na porta 8001 e expoe via `cloudflared tunnel`.

Fluxo: `Upload -> POST /api/{tool} -> Processamento (pypdf/reportlab/PyMuPDF/pikepdf/tesseract) -> Download automatico`.

## API Endpoints

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/api/convert/docx-pdf` | POST | DOCX para PDF |
| `/api/convert/xlsx-pdf` | POST | XLSX para PDF |
| `/api/convert/pdf-compress` | POST | Comprimir PDF |
| `/api/convert/pdf-docx` | POST | PDF para DOCX |
| `/api/convert/batch` | POST | Conversao em lote |
| `/api/merge` | POST | Mesclar PDFs |
| `/api/split` | POST | Dividir PDF |
| `/api/rotate` | POST | Rotacionar PDF |
| `/api/watermark` | POST | Marca d'agua |
| `/api/page-numbers` | POST | Numeracao de paginas |
| `/api/header-footer` | POST | Cabecalho/Rodape |
| `/api/protect` | POST | Proteger com senha |
| `/api/unlock` | POST | Remover senha |
| `/api/ocr` | POST | OCR em PDF |
| `/api/pdf-to-images` | POST | PDF para imagens (ZIP) |
| `/api/pdfa` | POST | Conversao para PDF/A |
| `/` | GET | Health check |

## Configuracao

| Variavel | Onde | Descricao |
|----------|------|-----------|
| `badger-api-url` | localStorage (frontend) | URL base do backend (ex: `https://xxxx.trycloudflare.com`) |
| `badger-beta-banner-dismissed` | localStorage (frontend) | Controla visibilidade do banner informativo |

Nao ha arquivo `.env`. A URL da API e configurada pela interface no header.

## Testes

O projeto nao possui suite de testes automatizados no momento.

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| "Configure a URL da API primeiro" | Clique em "Sem API" no header e cole a URL do tunnel |
| OCR nao funciona | Instale `tesseract-ocr` e `tesseract-ocr-por` + `poppler-utils` no backend |
| PDF-to-imagens falha | Verifique se `poppler-utils` esta instalado |
| Conversao DOCX perde formatacao | python-docx converte o conteudo; layouts complexos podem simplificar |
| Tunnel Cloudflare nao gera URL | Aguarde ate 30 segundos; reexecute a celula |
| Porta 8001 ocupada | Altere a porta no comando `uvicorn` e na celula do tunnel |

## Contribuindo

1. Fork o repositorio em [github.com/xAngryBadger/capivara](https://github.com/xAngryBadger/capivara)
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit: `git commit -m "Adiciona minha-feature"`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

## Licenca

MIT
