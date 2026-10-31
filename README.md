# Subscription Management System

A Vite frontend and Express API for subscription plans, customers,
subscriptions, invoices, payments, and quotations.

## Project structure

- `frontend/` - Vite single-page application deployed to Vercel.
- `backend/` - Express API deployed to Render with Docker.
- `backend/supabase/schema.sql` - database schema and the custom `users` table.

Supabase is used only as the database. Authentication is implemented by this
application with Argon2 password hashes and JWT access tokens. Supabase Auth is
not used.

## Supabase setup

1. Open Supabase Dashboard > **SQL Editor**.
2. Paste and run [`backend/supabase/schema.sql`](backend/supabase/schema.sql).
3. Open Supabase Dashboard > **Project Settings > API** and copy:
   - Project URL
   - anon/public key
   - service_role key
4. Keep the service_role key only in the backend environment. Never put it in
   frontend variables or commit it.

## Run locally

### Backend

Create `backend/.env` from [`backend/.env.example`](backend/.env.example):

```env
PORT=10000
CLIENT_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=use-a-long-random-secret
```

Then run:

```powershell
cd backend
npm install
npm start
```

The backend runs at `http://localhost:10000`.

### Frontend

Create `frontend/.env` from [`frontend/.env.example`](frontend/.env.example):

```env
VITE_API_URL=http://localhost:10000
VITE_API_BASE_URL=/api
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The login page supports account creation and
sign-in. Passwords must be at least 8 characters.

### Local checks

```powershell
Invoke-WebRequest http://localhost:10000/health
```

The health endpoint must return HTTP 200. The protected `/api/me` endpoint
returns HTTP 401 until you sign in. After sign-in, the browser sends the JWT
automatically.

## Deploy the backend to Render

Deploy the backend first because the frontend rewrite needs the Render URL.

### Option A: Render Dashboard

1. Push the repository to GitHub.
2. In Render, choose **New > Web Service** and select the repository.
3. Set **Root Directory** to `backend`.
4. Set **Runtime** to `Docker`.
5. Render will use `backend/Dockerfile`.
6. Add these environment variables:

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | Supabase Project URL |
   | `SUPABASE_ANON_KEY` | Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
   | `JWT_SECRET` | Long random secret, different from local |
   | `CLIENT_URL` | Your Vercel URL; temporarily use `*` until Vercel is deployed |

7. Deploy the service.
8. Copy the Render service URL, for example:
   `https://subscription-management-api.onrender.com`.
9. Verify:

```powershell
Invoke-WebRequest https://YOUR-RENDER-SERVICE.onrender.com/health
```

The response must be HTTP 200.

### Option B: Render Blueprint

The repository includes [`backend/render.yaml`](backend/render.yaml). If using
a Blueprint, set the repository's Render **Root Directory** to `backend`, or
create the Blueprint from the `backend` directory. Add the environment values
when Render prompts for them.

## Deploy the frontend to Vercel

1. In Vercel, choose **Add New > Project** and select the same repository.
2. Set **Root Directory** to `frontend`.
3. Keep the framework as **Vite**.
4. Use the default build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. Deploy once.
6. In Vercel Project Settings > **Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `VITE_API_BASE_URL` | `https://YOUR-RENDER-SERVICE.onrender.com/api` |

   Add it for the Production environment. Do not add the service-role key or
   JWT secret to Vercel.
7. Redeploy Vercel so Vite embeds the API URL in the production build.
8. Set Render's `CLIENT_URL` to the final Vercel URL and redeploy Render.

The frontend does not need Supabase variables in Vercel. Its API base URL is
provided through `VITE_API_BASE_URL`. For local development, keep
`VITE_API_BASE_URL=/api` so Vite proxies requests to the local backend.

## Authentication

- `POST /api/auth/register` creates a user in the custom `users` table.
- `POST /api/auth/login` verifies the Argon2 password hash and returns a JWT.
- All other `/api/*` routes require `Authorization: Bearer <token>`.
- `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` are backend-only secrets.

## API routes

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/analytics/overview`
- `GET /api/plans`
- `POST /api/plans`
- `GET /api/products`
- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `POST /api/subscriptions/:id/action`
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/invoices`
- `GET /api/payments`
- `GET /api/quotations`
- `POST /api/quotations/:id/convert`

## Security

- Never commit `backend/.env` or `frontend/.env`.
- Never expose the Supabase service_role key or JWT secret to Vercel.
- Use a separate strong `JWT_SECRET` for each environment.
- Rotate any Supabase key that has been shared publicly.
