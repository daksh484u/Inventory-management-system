# Daksh — Inventory & Order Management System

Production-ready full-stack system for **products**, **customers**, **orders**, and **inventory tracking**. Built with React, FastAPI, PostgreSQL, Docker, and Docker Compose.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + React Router |
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 16 |
| Containers | Docker (multi-stage, slim images) |
| Orchestration | Docker Compose |

## Features

- **Products** — CRUD, unique SKU, non-negative stock
- **Customers** — CRUD, unique email
- **Orders** — multi-line orders, stock validation, auto total, stock deduction on create, stock restored on cancel/delete
- **Dashboard** — totals + low-stock alerts
- **API** — validation, proper HTTP status codes, OpenAPI docs at `/docs`

## Project structure

```
Daksh/
├── Backend/           # FastAPI + SQLAlchemy
├── Frontend/          # React SPA (Vite)
├── docker-compose.yml
├── render.yaml        # Render deployment blueprint
├── .env.example
└── SUBMISSION.md      # Links template for assignment
```

## Run with Docker Compose (recommended)

```bash
git clone <your-repo-url>
cd Daksh
cp .env.example .env
# Set POSTGRES_PASSWORD in .env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

## Local development (without Docker)

**Backend**

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# .env: DATABASE_URL=postgresql://user:pass@localhost:5432/inventory
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd Frontend
npm install
# .env: VITE_API_URL=http://localhost:8000
npm run dev
```

## API endpoints

| Resource | Methods |
|---|---|
| `/products` | GET, POST |
| `/products/{id}` | GET, PUT, DELETE |
| `/customers` | GET, POST |
| `/customers/{id}` | GET, DELETE |
| `/orders` | GET, POST |
| `/orders/{id}` | GET, DELETE |
| `/health` | GET |

## Business rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders rejected when stock is insufficient (HTTP 422)
- Order total calculated by the backend
- Stock reduced when an order is created; restored when deleted

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `POSTGRES_*` | docker-compose `db` | Database credentials |
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `CORS_ORIGINS` | backend | Comma-separated allowed frontend origins |
| `VITE_API_URL` | frontend build | Public backend URL for browser requests |

## Deployment

See **[SUBMISSION.md](./SUBMISSION.md)** for step-by-step Render, Vercel/Netlify, and Docker Hub instructions.

**Backend:** Render / Railway / Fly.io (Dockerfile in `Backend/`)

**Frontend:** Vercel / Netlify (root directory `Frontend`, set `VITE_API_URL`)

After deploying, set `CORS_ORIGINS` on the backend to include your frontend URL.

## Docker Hub

```bash
docker build -t YOUR_USERNAME/daksh-backend:latest ./Backend
docker push YOUR_USERNAME/daksh-backend:latest
```

## License

MIT
