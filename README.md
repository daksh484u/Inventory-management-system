# Inventory & Order Management System

React + FastAPI app to manage products, customers and orders. Stock adjusts automatically when orders are placed or deleted.

**Live:** [App](https://inventory-management-system-lac-zeta.vercel.app) · [API](https://daksh-api.onrender.com/docs)

## Features

- Add/edit/delete products with SKU and stock tracking
- Customer management with Indian phone validation
- Place orders — stock deducts on create, restores on delete
- Dashboard with low stock alerts and clickable stat cards
- **Preview mode** — toggle in the top bar to see the app fully loaded with sample data, charts, and time range filters. Useful for demoing before real data exists.

## Run locally

```bash
docker compose up --build
# App → http://localhost  |  API → http://localhost:8000
```

Without Docker:

```bash
# backend
cd Backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend (new terminal)
cd Frontend && npm install && npm run dev
```

Backend falls back to SQLite if no `DATABASE_URL` is set, so no Postgres needed for local dev.

## Stack

React · Vite · FastAPI · SQLAlchemy · PostgreSQL · Docker
