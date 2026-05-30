# Submission — Daksh Inventory & Order Management System

Fill in your live URLs after deployment.

| Deliverable | Link |
|---|---|
| **GitHub Repository** | `https://github.com/YOUR_USERNAME/daksh-inventory` |
| **Docker Hub (backend image)** | `https://hub.docker.com/r/YOUR_USERNAME/daksh-backend` |
| **Live Frontend** | `https://YOUR-APP.vercel.app` |
| **Live Backend API** | `https://YOUR-API.onrender.com` |
| **API Docs (Swagger)** | `https://YOUR-API.onrender.com/docs` |

---

## Quick verification checklist

- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Create product → appears in list
- [ ] Create customer → unique email enforced
- [ ] Create order → stock decreases, total calculated server-side
- [ ] Dashboard shows counts and low-stock items
- [ ] `docker compose up --build` runs all three services locally

---

## Deploy backend (Render)

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect repo (uses `render.yaml`).
3. Or **New Web Service** → Docker → root `Backend`, Dockerfile `Backend/Dockerfile`.
4. Add **PostgreSQL** database; set `DATABASE_URL` from the database **Internal** URL.
5. Set `CORS_ORIGINS` to your frontend URL (e.g. `https://your-app.vercel.app`).
6. Deploy; note the public URL (e.g. `https://daksh-api.onrender.com`).

## Push backend image to Docker Hub

```bash
docker build -t YOUR_USERNAME/daksh-backend:latest ./Backend
docker login
docker push YOUR_USERNAME/daksh-backend:latest
```

## Deploy frontend (Vercel)

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. **Root Directory**: `Frontend`
3. **Environment variable**: `VITE_API_URL` = your Render backend URL (no trailing slash).
4. Deploy; open the generated `.vercel.app` URL.

## Deploy frontend (Netlify)

1. **Add new site** → import repo.
2. Base directory: `Frontend`, build: `npm run build`, publish: `dist`.
3. Set `VITE_API_URL` in site environment variables.
4. Deploy.

---

## Local Docker

```bash
cp .env.example .env
# Edit POSTGRES_PASSWORD in .env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
