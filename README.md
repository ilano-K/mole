# Mole

A simple desktop app that lets you search through your documents using plain language. Pick a folder, index your files, and find what you need by asking questions instead of guessing keywords.

## Features

- **Natural language search** — ask questions about your documents and get relevant excerpts with match scores
- **Multiple file formats** — supports PDF, DOCX, TXT, and more
- **Flexible embedding engines** — use the built-in offline model, connect to Ollama, or cloud providers like OpenAI, Cohere, Voyage, and Jina
- **Auto-indexing** — file watcher detects new and modified files automatically
- **One-click file opening** — click any result to open the source file directly
- **Local-first** — your documents never leave your machine (unless you choose a cloud embedding provider)

## Embedding Providers

| Provider | Type | Models |
|----------|------|--------|
| **Built-in** (default) | Local, offline | `all-MiniLM-L6-v2` |
| **Ollama** | Local server | `nomic-embed-text`, `bge-m3`, `snowflake-arctic-embed2`, and more |
| **OpenAI** | Cloud | `text-embedding-3-small`, `text-embedding-3-large` |
| **Cohere** | Cloud | `embed-v4.0`, `embed-english-v3.0`, `embed-multilingual-v3.0` |
| **Voyage AI** | Cloud | `voyage-3-large`, `voyage-3`, `voyage-lite-02-instruct` |
| **Jina AI** | Cloud | `jina-embeddings-v3` |

## Getting Started

### Prerequisites

- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) (for building the desktop app)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Backend (standalone)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python -m app.main
```

The API starts at `http://127.0.0.1:8000`.

### Frontend (standalone)

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:1420`.

### Full Desktop App

```bash
cd frontend
npm run tauri dev       # development with hot reload
npm run tauri build     # build for distribution
```

## Usage

1. **Setup** — on first launch, pick a folder to index, choose which file types to include, and select an embedding provider/model.
2. **Sync** — index your documents. Mole scans the folder and builds a vector index in the background.
3. **Search** — type a question or description and Mole returns the most relevant excerpts from your documents with a match score.
4. **Settings** — change your target directory, file types, or swap embedding providers at any time.

## Roadmap

- [ ] AI Agent mode — chat with your documents
- [ ] Audio file support
- [ ] Video file support
- [ ] Image support
- [ ] Search history

## Tech Stack

- **Desktop:** [Tauri 2](https://v2.tauri.app/) + React + TypeScript
- **Backend:** Python, FastAPI, ChromaDB, Docling
- **Embeddings:** sentence-transformers, Ollama, and cloud provider APIs
- **Database:** SQLite (app config and document metadata)

## License

MIT
