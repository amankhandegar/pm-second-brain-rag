# PM Second Brain — AI Knowledge Assistant
### RAG-powered document intelligence built for Product Managers

![PM Second Brain Chat UI](screenshot.png)

## What this does
An AI assistant that answers questions about your PM work — 
PRDs, meeting notes, decisions, roadmaps — by searching 
your actual documents using semantic vector search.

Ask: *"What did we decide about auto-remediation scope?"*
Get: A precise answer with exact source documents cited.

It correctly says "I don't have that information" for 
anything outside your documents — no hallucination.

## Architecture
Same pattern used by Microsoft Copilot and Google NotebookLM.

\`\`\`
Google Drive docs
      ↓
Gemini Embedding API (gemini-embedding-001)
      ↓
Supabase Vector Database (pgvector)
      ↓
Semantic Search (cosine similarity)
      ↓
Gemini 2.5 Flash (answer generation)
      ↓
React Chat UI
\`\`\`

## Tech Stack
| Component | Technology |
|---|---|
| Workflow automation | n8n |
| Vector database | Supabase + pgvector |
| Embedding model | Google Gemini embedding-001 |
| Answer generation | Google Gemini 2.5 Flash |
| Document source | Google Drive |
| Frontend | React |

## How it works

### Phase 1 — Indexing (run once)
1. n8n reads all documents from Google Drive folder
2. Each document is split into 500-word chunks with 50-word overlap
3. Each chunk is converted to a 3072-dimension vector using Gemini embeddings
4. Vectors + text stored in Supabase with metadata

### Phase 2 — Querying (every question)
1. User types question in React chat UI
2. Question converted to embedding vector
3. Supabase finds top 5 most semantically similar chunks
4. Gemini reads those chunks and generates a grounded answer
5. Answer returned with source document references

## Key concepts demonstrated
- **RAG (Retrieval Augmented Generation)** — industry standard 
  architecture for enterprise AI assistants
- **Vector embeddings** — converting text meaning to mathematics
- **Semantic search** — finding relevant content by meaning, 
  not keywords
- **Grounded AI responses** — answers only from indexed documents,
  never hallucinated
- **n8n workflow automation** — no-code AI pipeline orchestration

## Setup
Detailed setup requires:
- n8n Cloud account (free tier)
- Google AI Studio API key (free)
- Supabase account (free tier)
- Google Drive folder with your documents

## About this project
Personal learning project demonstrating practical AI 
engineering skills applied to Product Management workflows.

Built by: Aman — Product Manager

Note: This is a personal learning project. Document content 
used for indexing is mock/anonymised data.
