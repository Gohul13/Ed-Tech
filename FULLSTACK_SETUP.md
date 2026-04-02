# EdTech Full Stack – How to Run

The frontend (React + Vite) and backend (Express + MongoDB) are connected. Follow these steps to run the full application.

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** – Your backend already uses a MongoDB Atlas URI in `edtech-backend/.env`

## 1. Run the backend

```bash
cd edtech-backend
npm install
npm run dev
```

The API will run at **http://localhost:5000** (or the port in your `.env`).

Ensure `edtech-backend/.env` has:

- `PORT=5000`
- `MONGO_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_secret`
- Optional: `FRONTEND_URL=http://localhost:5173` (for CORS; default is 5173)

## 2. Run the frontend

In a **new terminal**:

```bash
cd edtech-frontend
npm install
npm run dev
```

The app will open at **http://localhost:5173**.

The frontend uses `VITE_API_URL=http://localhost:5000` from `edtech-frontend/.env`. Change it if your API runs on another host/port.

## What’s connected

- **Auth**: Login and Sign up use the backend (`/auth/login`, `/auth/register`). JWT is stored and sent with requests.
- **Courses**: Course list and course details come from the API (`/courses`, `/courses/:id`).
- **Enrollment**: Students enroll via `/enroll/:courseId`; “My courses” from `/my-courses`.
- **Lessons**: Lessons for a course from `/courses/:courseId/lessons`; single lesson from `/courses/lesson/:lessonId`. Completing a lesson uses `/lessons/:lessonId/complete`.
- **CORS**: Backend allows the frontend origin (default `http://localhost:5173`).

## First-time use

1. Open http://localhost:5173 and sign up (name, email, password, role: Student or Admin).
2. As a **student**: browse courses, enroll, open lessons, and mark them complete.
3. As **admin**: you can use the admin dashboard; admin-only API routes are protected by role.

Admin dashboard, courses, and lessons are wired to the backend (`/admin/*`).

## Troubleshooting – "Only errors" or "Not working"

1. **Backend must be running first**  
   In a terminal: `cd edtech-backend` then `npm run dev`. You should see `Server running on port 5000` and `MongoDB connected`. If the backend stops or isn’t running, the frontend will show errors like "Cannot reach server" or "Failed to fetch".

2. **Run frontend in a separate terminal**  
   `cd edtech-frontend` then `npm run dev`. Open **http://localhost:5173** in your browser.

3. **Check the exact error**  
   - **"Cannot reach server. Is the backend running at http://localhost:5000?"** → Start the backend (step 1). Then click **Retry** on the Courses page (or refresh).
   - **"Invalid credentials"** → Use the email and password you used when signing up (login uses email, not username).
   - **"Not authorized" or "Invalid token"** → Log out and log in again.
   - **CORS or network errors in browser console** → Ensure `edtech-backend/.env` has `FRONTEND_URL=http://localhost:5173` (or the URL where the frontend runs).

4. **Restart after changing .env**  
   If you change `edtech-frontend/.env` (e.g. `VITE_API_URL`), restart the frontend dev server (`npm run dev`).
