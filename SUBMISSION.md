# Project submission

**Name:** Daksh Lamba
**Project:** Inventory & Order Management System

---

## Links

| Item | URL |
|------|-----|
| GitHub repo | https://github.com/daksh484u/Inventory-order-management |
| Live frontend | _Add after Vercel/Netlify deploy_ |
| Live backend API | _Add after Render deploy_ |
| API docs | _Same as backend + `/docs`_ |
| Docker Hub (backend image) | _Add after you push the image_ |

Example Docker Hub link format: `https://hub.docker.com/r/daksh484u/daksh-backend`

---

## How to run locally (for reviewer)

1. Install **Docker Desktop** and make sure it is running.
2. Clone the repo:
   ```bash
   git clone https://github.com/daksh484u/Inventory-order-management.git
   cd Inventory-order-management
   ```
3. Copy env file and set a database password:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` → set `POSTGRES_PASSWORD` to any strong password.
4. Run:
   ```bash
   docker compose up --build
   ```
5. Open **http://localhost** for the app and **http://localhost:8000/docs** for the API.

That’s it — no extra setup needed.

---

## Quick test (optional)

1. **Products** → add a product (e.g. name: Laptop, SKU: LAP-01, price: 500, qty: 10).
2. **Customers** → add a customer with name, email, phone.
3. **Orders** → create an order for that customer, pick the product, qty 2.
4. Check product stock went down by 2 and order total is correct.
5. **Dashboard** → should show updated counts.

---

## Deployment notes

### Backend on Render

1. Push code to GitHub (already done).
2. On [render.com](https://render.com) → New → Web Service → connect this repo.
3. Set **Root Directory** to `Backend` (or use Docker with `Backend/Dockerfile`).
4. Create a **PostgreSQL** database on Render and copy the **Internal Database URL**.
5. Add env var: `DATABASE_URL` = that URL.
6. Add env var: `CORS_ORIGINS` = your frontend URL (e.g. `https://your-app.vercel.app`).
7. Deploy and copy the public URL (e.g. `https://daksh-api.onrender.com`).

You can also use the `render.yaml` file in the repo for a blueprint deploy.

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Import GitHub repo.
2. Set **Root Directory** to `Frontend`.
3. Add environment variable: `VITE_API_URL` = your Render backend URL (no `/` at the end).
4. Deploy and copy the live URL.

### Docker Hub (backend image)

From the project root:

```bash
docker build -t daksh484u/daksh-backend:latest ./Backend
docker login
docker push daksh484u/daksh-backend:latest
```

Then put your Docker Hub link in the table above.

---

## Tech used

- Frontend: React, Vite
- Backend: Python, FastAPI
- Database: PostgreSQL
- Docker + Docker Compose
