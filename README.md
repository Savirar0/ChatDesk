# Chat Desk

Chat Desk is a multi-tenant customer-support SaaS prototype. A company can
create an account, configure a support bot with company knowledge and
guardrails, and publish a public support page at
`/support/<company-slug>`. Visitors can ask questions, create a conversation,
and request a human handoff. Company users can review conversations, issues,
handoffs, and bot settings from the dashboard.

## Current architecture

### Backend

[`Backend/`](./Backend) contains a FastAPI application in
[`main.py`](./Backend/main.py). It currently provides:

- Authentication with bcrypt password hashes and seven-day JWTs.
- Tenant-scoped companies, users, knowledge sources, bot settings,
  conversations, messages, issues, and handoff requests.
- SQLite persistence through SQLAlchemy. The local database is stored in
  `Backend/echo_mind.db`.
- Text and Markdown knowledge paste/upload, plus PDF text extraction.
- Retrieval-only context matching from each company's stored knowledge.
- An optional **Answer basic general questions** setting, disabled by default.
  When enabled, the bot can answer simple general questions while its
  escalation and safety guardrails remain active.
- An OpenAI-compatible chat-completions adapter for AI responses.
- Public support endpoints, a per-process in-memory rate limit, and dashboard
  endpoints for authenticated company users.

The backend is the only place that should call an LLM provider. If no
`LLM_API_KEY` is configured, it deliberately uses a visible retrieval-only
mock response instead of pretending that an AI response was generated.

### Frontend

[`Frontend/`](./Frontend) is a Vite + React application. The active
route implementation is currently concentrated in
[`src/App.jsx`](./Frontend/src/App.jsx), with styling from Tailwind CSS.
It includes landing, signup/login, authenticated dashboard/settings, and public
support-page flows.

There are also older or partially migrated components under
[`src/pages/`](./Frontend/src/pages/) and
[`src/api/chatbot.js`](./Frontend/src/api/chatbot.js). Some of those
modules still refer to legacy endpoints such as `/tickets`, `/customer`, or
`/chat`, while the current backend uses `/api/...` routes. Treat those modules
as migration work rather than assuming they are all part of the current
end-to-end path.

## Run locally

### 1. Configure the backend

From the repository root:

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy the root environment template and edit the copy:

```bash
cp ../.env.example ../.env
```

At minimum, replace `JWT_SECRET_KEY` with a long random value. SQLite needs no
separate service; the default database is `Backend/echo_mind.db`.

### 2. Start the API

```bash
cd Backend
source .venv/bin/activate
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`. The health check is
`GET /api/health`.

### 3. Start the frontend

In another terminal:

```bash
cd Frontend
npm install
cp .env.frontend.example .env
npm run dev
```

Set `VITE_API_BASE=http://localhost:8000` in the frontend environment when
running locally. Vite exposes variables prefixed with `VITE_` to browser code;
never put an AI provider key in this file.

### Demo data

From `Backend`, run:

```bash
python3 seed.py
```

This creates the repository's demo data, including
`demo@acme.test` / `demo-password` and the public support path
`/support/acme-outdoors` (when the seed script is compatible with the current
database).

## LLM configuration and OpenRouter

The backend reads these variables from the root `.env` file:

```dotenv
LLM_API_KEY=sk-or-v1-your-own-key
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=dots-studio/dots-3-note-preview:free
```

## API and data notes

The current backend routes are grouped under:

- `/api/auth/*` for signup and login.
- `/api/public/support/{slug}` for public bot metadata, chat, and handoffs.
- `/api/dashboard/*` for tenant-scoped dashboard data.
- `/api/settings`, `/api/onboarding`, and `/api/knowledge/upload` for bot
  configuration and knowledge.

[`Backend/database.py`](./Backend/database.py) is the persistence boundary.
Tables are created on startup, which is convenient for the prototype but
should be replaced with versioned migrations before production deployment.
Public chat currently has a 30-message-per-minute, in-memory IP limit; a
shared limiter is needed for multi-process or multi-instance deployments.

## Important security reminders

- Use a different strong `JWT_SECRET_KEY` in every environment.
- Keep `LLM_API_KEY`, database credentials, and OAuth secrets on the backend.
- Never commit `.env`, the local SQLite database, or uploaded customer data.
- Do not treat the free preview model as a production availability guarantee.
