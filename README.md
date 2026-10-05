# Chat Desk

Multi-tenant customer-support SaaS built with FastAPI, React, and SQLite. Companies create an AI support bot, publish a unique `/support/<company-slug>` URL, and manage conversations, issues, and human handoffs in a private dashboard.

## Run locally

1. Install the backend:

   ```bash
   cd Backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Copy the repository `.env.example` to `.env` and set `JWT_SECRET_KEY`. SQLite needs no service or credentials; `Backend/echo_mind.db` is created automatically.

3. Start the API:

   ```bash
   uvicorn main:app --reload
   ```

4. In another terminal, start React:

   ```bash
   cd frontend-only
   npm install
   npm run dev
   ```

The frontend defaults to `http://localhost:8000`; set `VITE_API_BASE` if the API is elsewhere.

## Demo data

From `Backend`, run `python3 seed.py`. It creates `demo@acme.test` with password `demo-password` and a public chat at `/support/acme-outdoors`.

## LLM configuration

With no `LLM_API_KEY`, Chat Desk visibly runs in **Mock responder — retrieval-only** mode: it returns matching text from the tenant's stored knowledge and does not invent an answer. For a company-supplied or Groq-compatible OpenAI API, set `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` in `.env`.

## Data and tenant boundaries

`Backend/database.py` is the persistence boundary. It uses SQLAlchemy with SQLite by default; a Postgres SQLAlchemy URL in `DATABASE_URL` is the future swap path. Tables are created on startup: companies, users, knowledge_sources, bot_settings (guardrails/settings), conversations, messages, issues, and handoff_requests. Dashboard queries are always filtered by the authenticated user's `company_id`; public chat validates the company slug on every request.

The public endpoint includes an in-memory 30-message-per-minute IP limit. Use a shared limiter for multi-process production deployments.
