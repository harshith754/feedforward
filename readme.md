# FeedForward

FeedForward is a role-based feedback platform for teams. Developers can give feedback to their managers, and managers can view feedback history for their team. The app features a modern UI, authentication, and a feedback analytics dashboard.

---

## Features

- **Role-based dashboards** for managers and developers
- **Structured feedback**: strengths, areas to improve, sentiment, and rating
- **Feedback history**: managers can view all feedback for their team
- **Authentication**: secure login, registration, and session management
- **Mobile-friendly**: responsive UI
- **Modern stack**: FastAPI, React (Vite), TypeScript, Docker

---

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Auth**: JWT (cookie-based)
- **Deployment**: Docker, Railway/Render/Vercel

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional, for containerized dev)

### Backend Setup

1. `cd backend`
2. Create `.env` (see below for example)
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```powershell
   alembic upgrade head
   ```
5. Start server:
   ```powershell
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. `cd frontend`
2. Create `.env` (see below for example)
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start dev server:
   ```powershell
   npm run dev
   ```

---

## Docker

### Build and Run (Dev)

```powershell
cd backend
# Build and run backend
docker-compose up --build
```

### Environment Variables

#### Backend `.env` example:

```
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-secret
JWT_ALGORITHM=HS256
ENV=prod
```

#### Frontend `.env` example:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
```

---

## Deployment

- **Frontend**: Deploy `frontend` to Vercel/Netlify/Railway Static. Use SPA fallback for client-side routing.
- **Backend**: Deploy `backend` to Railway/Render. Set `ENV=prod` in environment variables for proper cookie handling.
- **CORS**: Backend must allow your frontend domain and `allow_credentials=True`.
- **HTTPS**: Both frontend and backend must use HTTPS in production for authentication to work on all devices.

---

## Troubleshooting

- **Mobile login issues**: Ensure backend sets cookies with `SameSite=None; Secure` and you use HTTPS.
- **Dashboard not loading after login**: AuthProvider waits for user to load before rendering children.
- **CORS errors**: Check `ALLOWED_ORIGINS` in backend `.env` and CORS middleware config.

---

## License

MIT
