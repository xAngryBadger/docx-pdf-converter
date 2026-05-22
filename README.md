# Capivara

DocX → PDF converter with drag-drop upload, side-by-side preview and auto-download.

## Features

- ✅ DOCX → PDF
- ✅ XLSX → PDF
- ✅ Compressão de PDF
- ✅ Conversão em lote (batch)
- ✅ Interface drag-and-drop
- ✅ Processamento rápido

## Instalação

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/convert/docx-pdf` - Converte DOCX para PDF
- `POST /api/convert/xlsx-pdf` - Converte XLSX para PDF
- `POST /api/convert/pdf-compress` - Comprime PDF
- `POST /api/convert/batch` - Conversão em lote

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Python FastAPI
- **Libs:** python-docx, openpyxl, pypdf, reportlab

## License

MIT
