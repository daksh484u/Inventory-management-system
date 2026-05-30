# Inventory & Order Management System

A small full-stack app to manage products, customers, and orders. You can add stock, register customers, place orders, and see everything on a dashboard. Stock updates automatically when you create or delete an order.

**Stack:** React (frontend) · FastAPI (backend) · PostgreSQL · Docker

**Repo:** https://github.com/daksh484u/Inventory-order-management

---

## What you need

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running  
- Git (to clone the repo)

That’s enough to run the whole project. You don’t need to install Node or Python separately if you use Docker.

---

## How to run (Docker — easiest way)

**1.** Clone the project and go into the folder:

```bash
git clone https://github.com/daksh484u/Inventory-order-management.git
cd Inventory-order-management
```

**2.** Create your env file:

```bash
cp .env.example .env
```

Open `.env` and set a password for Postgres, for example:

```
POSTGRES_PASSWORD=mysecretpassword123
```

**3.** Start everything:

```bash
docker compose up --build
```

Wait until you see the backend and frontend are up (first time can take a few minutes).

**4.** Open in the browser:

| What | URL |
|------|-----|
| App (UI) | http://localhost |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

To stop: press `Ctrl + C` in the terminal, or run `docker compose down`.

---

## Run without Docker (optional)

Use this only if you prefer running backend and frontend on your machine.

**Database** — you still need PostgreSQL running locally (or use the `db` service from Docker Compose alone).

**Backend**

```bash
cd Backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Create `Backend/.env`:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/inventory
```

```bash
uvicorn app.main:app --reload --port 8000
```

**Frontend** (new terminal)

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open http://localhost:5173

---

## Project folders

```
Backend/     → API (Python + FastAPI)
Frontend/    → UI (React + Vite)
docker-compose.yml
.env.example
```

---

## Main features

- Add / edit / delete products (name, SKU, price, quantity)
- Add / delete customers (name, email, phone)
- Create orders with one or more products — total is calculated on the server
- Stock goes down when you place an order; it comes back if you delete the order
- Dashboard shows product count, customer count, order count, and low-stock items

---

## API (quick reference)

- `GET/POST /products` · `GET/PUT/DELETE /products/{id}`
- `GET/POST /customers` · `GET/DELETE /customers/{id}`
- `GET/POST /orders` · `GET/DELETE /orders/{id}`
- `GET /health` — check if API is running

Full interactive docs: http://localhost:8000/docs (when backend is running)

---

## Deploying online

See [SUBMISSION.md](./SUBMISSION.md) for links and deployment steps (Render + Vercel/Netlify + Docker Hub).

---

## Author

**Daksh** — [daksh484u](https://github.com/daksh484u)
