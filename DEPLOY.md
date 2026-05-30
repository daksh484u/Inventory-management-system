# Deployment guide

Deploy in this order: **Backend (Render)** → **Frontend (Vercel)** → **Docker Hub** (optional).

Your repo: https://github.com/daksh484u/Inventory-order-management

---

## Step 1 — Backend on Render (~10 min)

1. Go to https://dashboard.render.com and sign in with GitHub.
2. Click **New +** → **Blueprint**.
3. Connect repo `daksh484u/Inventory-order-management`.
4. Render reads `render.yaml` and creates:
   - PostgreSQL database `daksh-db`
   - Web service `daksh-api` (Docker)
5. When asked for **CORS_ORIGINS**, leave empty for now (you’ll add the Vercel URL in Step 2).
6. Click **Apply**. Wait until deploy status is **Live**.
7. Copy your API URL, e.g. `https://daksh-api.onrender.com`
8. Test: open `https://daksh-api.onrender.com/health` — should show `{"status":"ok"}`

---

## Step 2 — Frontend on Vercel (~5 min)

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New** → **Project** → import `Inventory-order-management`.
3. Settings:
   - **Root Directory:** `Frontend` (click Edit, select Frontend folder)
   - **Framework Preset:** Vite (auto-detected)
4. **Environment Variables** — add:
   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | `https://daksh-api.onrender.com` (your Render URL, no trailing slash) |
5. Click **Deploy**. Wait for build to finish.
6. Copy your live URL, e.g. `https://inventory-order-management.vercel.app`

---

## Step 3 — Connect frontend ↔ backend (CORS)

1. Back in **Render** → open service `daksh-api` → **Environment**.
2. Set **CORS_ORIGINS** to your Vercel URL, e.g.:
   ```
   https://inventory-order-management.vercel.app
   ```
   (Use your real Vercel URL; add `http://localhost` if you still test locally.)
3. Save — Render will redeploy automatically.

Open your Vercel URL and try adding a product.

---

## Step 4 — Docker Hub (for submission)

On your PC (Docker Desktop running):

```powershell
cd "c:\Users\Jatin\OneDrive\Desktop\Daksh"
docker build -t daksh484u/daksh-backend:latest ./Backend
docker login
docker push daksh484u/daksh-backend:latest
```

Link: https://hub.docker.com/r/daksh484u/daksh-backend

---

## Step 5 — Update SUBMISSION.md

Fill in your live URLs in `SUBMISSION.md`, commit, and push.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend can’t reach API | Check `VITE_API_URL` on Vercel; redeploy after changing it |
| CORS error in browser | Set `CORS_ORIGINS` on Render to exact Vercel URL (https, no trailing slash) |
| Render build fails | Check **Logs** tab; ensure `POSTGRES_PASSWORD` / DB linked via blueprint |
| API slow first request | Render free tier sleeps after inactivity — wait ~30s and retry |
