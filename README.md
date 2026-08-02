## Plan: `readme.txt`

**Project:** Pizza City Oman — Full-Stack Ordering System  
**Stack:** Express + MongoDB + React (Vite) + TypeScript + Tailwind CSS

### Content Outline

1. **Project Overview**  
   Restaurant ordering system with online menu, cart, WhatsApp invoice routing, and admin dashboard.

2. **Auth System**  
   JWT-based with two roles: **superadmin** (full access) and **moderator** (outlet-restricted). Login at `/auth/login`, token refresh via httpOnly cookie.

3. **Environment Variables** (`.env`)  
   - `MONGODB_URI` — MongoDB connection string (empty = in-memory fallback)  
   - `JWT_SECRET` — JWT signing secret  
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — seed credentials for initial superadmin

4. **Setup & Commands**  
   - `npm install`  
   - `npm run dev` — dev server (Express + Vite HMR)  
   - `npm run build` — production build  
   - `npm run start` — production server  
   - `npm run lint` — TypeScript check (`tsc --noEmit`)

5. **Public API Endpoints**  
   `GET /api/health`, `GET /api/menu`, `GET /api/banners`, `GET /api/branches`, `POST /api/orders`, `GET /api/orders/track/:id`, `POST /api/promos/validate`, `GET /api/promos/list`

6. **Authenticated API Endpoints**  
   `GET /api/orders/:outletId` (moderator/superadmin), `GET /api/orders/:outletId/summary`, `PATCH /api/orders/:id/status`, `POST /auth/login`, `POST /auth/refresh`

7. **Admin-Only API Endpoints**  
   Full CRUD for branches, promos, banners, menu items, and users under `/admin/api/*` (superadmin required)

8. **Admin Dashboard**  
   Role-based sidebar: orders, menu manager, banners, promos, branch management, user management. Moderators see only assigned outlets.

9. **Deployment**  
   Build command (`npm run build`), start command (`npm run start`), set env vars on Railway/Render/Fly.

---

