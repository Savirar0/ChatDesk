# Chat Desk: college computer deployment

This guide runs Chat Desk locally with Docker Compose. The computer needs
Docker, the project files, and an environment file. Python and Node.js do not
need to be installed separately.

## Before starting

Confirm that the computer has:

- Docker Desktop on Windows/macOS, or Docker Engine and the Compose plugin on
  Linux
- Permission to run Docker containers
- Internet access for the first image build
- Internet access to the configured LLM provider if AI responses are required

Check Docker from a terminal:

```bash
docker --version
docker compose version
```

## Get the project

With Git:

```bash
git clone <repository-url>
cd ChatDesk
```

Without Git, download the repository as a ZIP, extract it, and open a terminal
in the extracted `ChatDesk` folder.

## Configure secrets

Create the local environment file from the committed template:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace `JWT_SECRET_KEY` with a long, unique random value.
Optionally set `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` for external AI
responses. Never commit `.env` or put the provider key in a frontend
`VITE_*` variable.

If `LLM_API_KEY` is empty, the application still starts and uses its visible
retrieval-only fallback response.

## Start Chat Desk

Run these commands from the repository root:

```bash
docker compose config
docker compose up --build -d
docker compose ps
```

Open [http://localhost](http://localhost) in the browser. The first build
downloads the base images and project dependencies and may take several
minutes. Later starts can use:

```bash
docker compose up -d
```

## What is running

- `backend`: FastAPI, Python dependencies, and API routes
- `frontend`: production React build served by Nginx
- `chatdesk-data`: persistent Docker volume containing the SQLite database

Nginx serves the browser application and forwards `/api/*` requests to the
backend over Docker's private network. Only the frontend is published to the
host, at `http://localhost`.

## Demo data and verification

Create the demo account, if required:

```bash
docker compose exec backend python seed.py
```

Check containers and logs:

```bash
docker compose ps
docker compose logs -f
```

Test that data survives a restart:

```bash
docker compose down
docker compose up -d
```

Do not use `docker compose down -v` during normal operation. The `-v` option
deletes the persistent database volume.

## Backup and restore

Create a database backup:

```bash
docker compose exec backend \
  python -c "import shutil; shutil.copyfile('/app/data/echo_mind.db', '/app/data/echo_mind.backup.db')"
docker cp "$(docker compose ps -q backend):/app/data/echo_mind.backup.db" ./echo_mind.backup.db
```

Store the backup somewhere safe. It contains user and customer data.

## Troubleshooting

If port 80 is already in use, change the frontend mapping in
`docker-compose.yml`:

```yaml
ports:
  - "127.0.0.1:8080:80"
```

Then open [http://localhost:8080](http://localhost:8080).

If a build fails, check internet access and retry:

```bash
docker compose build --no-cache
docker compose up -d
```

If the backend is unhealthy:

```bash
docker compose logs backend
```

If AI responses fail, confirm the provider key, model name, network access,
provider quota, and the values in `.env`. The local application itself should
still be reachable without an LLM key.

## Stop or update

Stop containers while preserving data:

```bash
docker compose down
```

After pulling a new version:

```bash
git pull
docker compose up --build -d
```

The database volume is reused unless it is explicitly removed.
