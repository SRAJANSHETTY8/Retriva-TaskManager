# Frontend — Task & Knowledge Management System

A simple React (Vite) frontend for the FastAPI backend. Plain UI, no
extra libraries beyond routing — built to satisfy the assignment
requirements, not as a polished product.

## Tech stack

- React 18
- Vite
- react-router-dom (routing + protected routes)
- Plain CSS (no UI framework)
- Fetch API for all backend calls

## Setup

1. Make sure the FastAPI backend is running, by default at
   `http://localhost:8000`.

2. Install dependencies:

   ```
   cd frontend
   npm install
   ```

3. If your backend runs on a different URL, edit `.env`:

   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the dev server:

   ```
   npm run dev
   ```

   The app runs at `http://localhost:5173`.

## Pages / features

- **Login / Register** — JWT auth, role selectable at registration
  (`admin` or `user`).
- **Documents** — list documents; admins can upload `.pdf` / `.txt`
  files and delete documents.
- **Search** — semantic search box, calls `/search`, shows matching
  chunks with document title and similarity score.
- **Tasks** — admins create and assign tasks and can filter by
  status/assignee; users see only their own tasks and can mark them
  Pending/Completed.
- **Analytics** — admin-only dashboard: total/completed/pending tasks
  and most searched queries.

## Notes

- The JWT is decoded client-side only to read the `role` claim for
  showing/hiding UI (e.g. the Analytics link, upload button). All real
  access control is enforced by the backend.
- `assigned_to` on task creation/filtering is entered as a plain user
  ID since the backend does not expose a `/users` list endpoint.
