# ai-services (hearMeout)

This repository contains only the ai-services component for the hearMeout project:
a Flask-based chat backend that provides a therapy-style chatbot powered by
a retrieval-augmented generation (RAG) pipeline (Pinecone + HuggingFace embeddings +
Google Gemini via langchain)

## Repo layout (relevant)
- ai-services/
  - app.py                # Flask application (API endpoints: / and /chat)
  - requirements.txt
  - templates/chat.html   # frontend (simple chat UI)
  - static/style.css      # styling for chat UI
  - src/
    - helper.py           # PDF loader, chunking, embedding helpers
    - prompt.py           # system prompt used by the LLM
  - Data/                 # PDF knowledge base (used to build/retrieve content)
  - store_index.py        # (optional) scripts to create Pinecone index

## Requirements
- Python 3.13 (or same version used in development)
- Conda recommended (Anaconda/Miniconda)
- Internet access for embeddings / Pinecone / Gemini API

## Setup (Windows / Anaconda)
1. Open Anaconda Prompt and change to this folder:
```powershell
cd "C:\Users\Shounak Dutta\Documents\Sih'25 hearMeout\hearMeout\ai-services"
```

2. Create and activate environment (example):
```powershell
conda create -n hearMeoutAPP python=3.13 -y
conda activate hearMeoutAPP
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

## Environment variables
Create a file named `.env` in the `ai-services` folder (do NOT commit it). Required variables:
```
PINECONE_API_KEY=<your-pinecone-key>
PINECONE_INDEX_NAME=therapybot
GOOGLE_API_KEY=<your-gemini-or-google-api-key>
FLASK_SECRET_KEY=<strong-random-secret>
```
Generate a secret in Python:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## Running (development)
From the `ai-services` directory with the conda env active:

- Direct run (uses app.run in app.py):
```powershell
python app.py
```

- OR Flask CLI (auto-reload):
```powershell
$env:FLASK_APP="app.py"
$env:FLASK_ENV="development"
flask run --host=0.0.0.0 --port=8080
```

Open http://localhost:8080/ to use the chat UI.

## Notes & Troubleshooting
- Static files: ensure you run the server from the `ai-services` folder so Flask finds `templates/` and `static/`.
- If the chat returns no personalized memory:
  - Confirm session cookie is sent (frontend uses `fetch` with `credentials: 'include'` if cross-origin).
  - Check server logs to see user_id and the extra_context being passed to the chain.
- If Pinecone index isn't found, run `store_index.py` or create the index in your Pinecone console and set `PINECONE_INDEX_NAME`.
- Never expose PINECONE_API_KEY or GOOGLE_API_KEY in frontend code or public repos.

## Deployment
- Option A (recommended): Deploy Flask backend to a server (Render, Railway, Fly) and host frontend (static) on Vercel or same host. Configure environment variables in the provider.
- Option B: Convert backend to serverless functions — requires packaging dependencies and adjusting session & memory storage (use DB/Redis for persistent user memory).

## Development tips
- Use an external persistent store (Redis / DB) for per-user memory if you need persistence across restarts or multiple instances.
- Add logging in `app.py` (logging.info/debug) to trace requests and RAG responses.

# hearMeout

# how to run?

clone the repository

step 01 : create a conda environment after opening this repository

bash: conda create -n hearMeoutAPP python=3.13 -y

conda activate hearMeoutAPP


step 02 :

pip install -r requirements.txt

