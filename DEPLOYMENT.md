# Maai Organisation Deployment

## GitHub Push

1. Confirm real environment files are ignored:
   - `backend/.env`
   - `frontend/.env`
   - `frontend/.env.production`
2. Commit only source files, examples, docs, and lockfiles.
3. Push to GitHub after checking:
   ```bash
   git status
   git diff --cached
   ```

## Aiven Setup

1. Create a MySQL service in Aiven.
2. Copy the public connection values into Railway backend variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
3. Enable required network access for Railway.
4. Run the backend once so the existing database initializer can create or update tables.

## Railway Setup

1. Create a Railway service from the backend folder.
2. Set the backend start command:
   ```bash
   npm start
   ```
3. Set `NODE_ENV=production`.
4. Add all required backend environment variables.
5. Set `CORS_ORIGIN` to the deployed frontend origin.
6. Deploy and verify `/api/health`.

## Health Monitoring

Railway health endpoint:

```text
GET /health
```

Expected response includes:

```json
{
  "status": "ok",
  "database": "connected"
}
```

Use this endpoint to monitor both backend uptime and Aiven MySQL connectivity.

## GitHub Pages Setup

1. Set `VITE_API_URL` in the frontend build environment to the Railway backend URL.
2. Build the frontend:
   ```bash
   npm run build
   ```
3. Publish `frontend/dist`.
4. Confirm the deployed app can call the Railway API.

## Required Env Vars

Backend:

```bash
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.example

DB_HOST=maaidb-maaiorg.i.aivencloud.com
DB_PORT=24451
DB_USER=avnadmin
DB_PASSWORD=
DB_NAME=defaultdb

JWT_SECRET=
JWT_EXPIRES_IN=7d

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Maai organisation
SMTP_FROM_EMAIL=
```

Frontend:

```bash
VITE_API_URL=https://your-railway-backend.example
```

## Final Checklist

- Real `.env` files are not tracked by Git.
- `JWT_SECRET` is set in Railway with a strong random value.
- Aiven MySQL credentials are set only in Railway.
- `VITE_API_URL` points to the Railway backend.
- `CORS_ORIGIN` points to the deployed frontend.
- Frontend build passes.
- Backend starts with production environment variables.
