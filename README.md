# ChaiBookLM

A NotebookLM-inspired RAG application that allows users to upload PDFs, index them using vector embeddings, and ask questions based on the uploaded documents.

---

## Features

- Create multiple notebooks
- Upload PDF documents
- Extract text from PDFs
- Automatic text chunking
- Generate embeddings using OpenRouter
- Store vectors in Pinecone
- Semantic search over uploaded documents
- Ask questions related to uploaded PDFs
- View retrieved source chunks with citations

---

## Tech Stack

### Frontend
- React
- Vite
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer

### AI & Vector Database
- OpenRouter API
- Pinecone
- pdfjs-dist

---

## Project Structure

```
chaiBooklm
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── services
│   ├── middleware
│   ├── config
│   ├── utils
│   └── package.json
│
└── README.md
```

---

## How It Works

### 1. Create Notebook

Users create notebooks to organize related documents.

↓

### 2. Upload PDF

The uploaded PDF is processed by the backend.

↓

### 3. Extract Text

Text is extracted from the PDF using **pdfjs-dist**.

↓

### 4. Chunking

Large documents are split into smaller chunks.

↓

### 5. Generate Embeddings

Each chunk is converted into a vector embedding using the OpenRouter Embedding API.

↓

### 6. Store in Pinecone

Embeddings along with metadata are stored inside Pinecone.

↓

### 7. Ask Question

The user's question is converted into an embedding.

↓

### 8. Semantic Search

Pinecone retrieves the most relevant chunks.

↓

### 9. Generate Response

The retrieved context is used to answer the user's question.

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Prachi-3101/Chaibooklm.git
cd chaiBooklm
```

---

### Backend

```bash
cd server
npm install
npm run dev
```

---

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index

OPENROUTER_API_KEY=your_openrouter_api_key

EMBEDDING_MODEL=nvidia/nemotron-3-embed-1b:free
CHAT_MODEL=openai/gpt-oss-20b:free
```

---

## API Endpoints

### Notebook

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/notebooks` | Create Notebook |
| GET | `/api/notebooks` | Get All Notebooks |
| DELETE | `/api/notebooks/:id` | Delete Notebook |

---

### Source

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/source/upload/pdf` | Upload PDF |

---

### Chat

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chat` | Ask Question |

---



