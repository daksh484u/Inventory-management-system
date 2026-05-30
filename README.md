# Inventory & Order Management System

Full-stack app for managing products, customers, and orders. Built with React, FastAPI, PostgreSQL, and Docker.

When you place an order, stock goes down automatically. Delete the order and it comes back. Dashboard shows live counts and low-stock alerts.

**Live:** [Frontend](https://inventory-management-system-lac-zeta.vercel.app) · [API docs](https://daksh-api.onrender.com/docs)

---

## Running locally

Easiest way is Docker — no need to install Node or Python separately.

```bash
git clone https://github.com/daksh484u/Inventory-management-system.git
cd Inventory-management-system
docker compose up --build
```

App opens at `http://localhost`, API at `http://localhost:8000`.

Without Docker — two terminals:

```bash
# Terminal 1 — backend (uses SQLite if no DATABASE_URL is set)
cd Backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd Frontend
npm install
npm run dev        # http://localhost:5173
```

---

## Stack

- **Frontend** — React + Vite, react-router-dom, Axios
- **Backend** — Python, FastAPI, SQLAlchemy 2, Pydantic v2
- **Database** — PostgreSQL (SQLite fallback for local dev)
- **Deploy** — Vercel (frontend), Render (backend + DB)
