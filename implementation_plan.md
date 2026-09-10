# Priority 1 Architecture & Maintainability Refactoring Plan — Pizza City Oman

This implementation plan addresses the critical high-priority architecture, maintainability, and security issues identified in the Pizza City Oman project audit. The goal is to modularize the monolithic backend (`server.ts`) and frontend dashboard (`AdminDashboard.tsx`), standardize pricing validation, enforce role-based outlet access control (RBAC), and optimize initial bundle loading through React route lazy-loading.

---

## User Review Required

> [!IMPORTANT]
> **Backend Architecture Restructuring**: `server.ts` (2,878 lines) will be split into modular routes, models, middleware, and services under `src/server/`. The root `server.ts` will serve as the lightweight entry point.
> **Production Fallback Behavior**: In-memory database fallbacks will be strictly restricted to development/testing environments (`NODE_ENV !== 'production'`). In production, MongoDB connection failures will return standard 503 Service Unavailable errors rather than falling back to in-memory mock data.

> [!WARNING]
> **Admin Dashboard Component Splitting**: `AdminDashboard.tsx` (3,864 lines) will be decomposed into 8 focused subcomponents under `src/components/admin/`. No visual or behavioral UI changes will occur, but props and state handoffs will be structured cleanly.

---

## Open Questions

> [!NOTE]
> 1. **MongoDB Connection Failures in Production**: Should the backend attempt automatic reconnection for a fixed number of retries before returning 503, or fail fast? (Recommended: 3 retries with backoff, then fail fast).
> 2. **Moderator Outlet Access Scope**: When a moderator has assigned outlets (e.g. `["Nizwa", "Samail"]`), should they be restricted from viewing global metrics on the main dashboard tab, or only restricted from modifying menu/order items belonging to other outlets? (Recommended: restrict order modifications and outlet-specific data filtering strictly to allowed outlets).

---

## Proposed Changes

### Backend Infrastructure & Modularization (`server.ts`)

#### [MODIFY] [server.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/server.ts)
- Refactor into a minimal Express setup file that imports and mounts config, routes, middleware, and Vite/static rendering handlers.

#### [NEW] [src/server/config/db.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/config/db.ts)
- Isolate MongoDB connection logic, retry strategy, and production safety check (`NODE_ENV` handling).

#### [NEW] [src/server/middleware/auth.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/middleware/auth.ts)
- Isolate `verifyToken`, `requireSuperAdmin`, `requireModerator`, and `verifyOutletAccess` middleware functions.

#### [NEW] [src/server/models/index.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/models/index.ts)
- Consolidate Mongoose schemas & models: `MongoOrder`, `MongoMenu`, `MongoBranch`, `MongoBanner`, `MongoPromoCode`, `MongoUser`.

#### [NEW] [src/server/routes/orderRoutes.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/routes/orderRoutes.ts)
- Public order placement with server-side price recalculation via [priceUtils.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/shared/priceUtils.ts).
- Admin order querying, status updating, and cancellation with moderator outlet-filtering.

#### [NEW] [src/server/routes/adminRoutes.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/routes/adminRoutes.ts)
- Admin auth (`/admin/api/login`, `/admin/api/verify`), user/moderator CRUD, and image upload endpoints.

#### [NEW] [src/server/routes/menuRoutes.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/routes/menuRoutes.ts)
- Public menu item fetch, admin menu CRUD endpoints.

#### [NEW] [src/server/routes/bannerRoutes.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/routes/bannerRoutes.ts)
- Public active banner fetch, admin banner management & active status toggling.

#### [NEW] [src/server/routes/branchRoutes.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/routes/branchRoutes.ts)
- Public branch location queries, admin branch management endpoints.

#### [NEW] [src/server/routes/promoRoutes.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/routes/promoRoutes.ts)
- Promo code validation, admin promo CRUD endpoints.

#### [NEW] [src/server/services/seoService.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/server/services/seoService.ts)
- SSR dynamic meta tag injection for dynamic location and menu item pages (`renderLocationPage`, `renderMenuItemPage`, `STATIC_SEO`).

---

### Admin Dashboard Decomposition (`src/components/AdminDashboard.tsx`)

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/AdminDashboard.tsx)
- Re-architect as the parent container managing tab routing, authentication check, and state distribution to subcomponents.

#### [NEW] [src/components/admin/AdminSidebar.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminSidebar.tsx)
- Navigation bar, dark mode toggle, user role badge, logout action.

#### [NEW] [src/components/admin/AdminOrdersView.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminOrdersView.tsx)
- Live order table, search/filter controls, status updates, order detail modal, receipt printing.

#### [NEW] [src/components/admin/AdminMenuView.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminMenuView.tsx)
- Menu item grid, add/edit modal, price/size configuration, item availability toggles.

#### [NEW] [src/components/admin/AdminBannersView.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminBannersView.tsx)
- Banner card manager, upload integration, active status toggling.

#### [NEW] [src/components/admin/AdminBranchesView.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminBranchesView.tsx)
- Outlet branch details editor, map URL manager, operating hours.

#### [NEW] [src/components/admin/AdminPromosView.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminPromosView.tsx)
- Promo code list, discount configuration, usage tracking.

#### [NEW] [src/components/admin/AdminModeratorsView.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/AdminModeratorsView.tsx)
- Moderator account management and outlet access permission matrix (SuperAdmin only).

#### [NEW] [src/components/admin/ImageUploader.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/admin/ImageUploader.tsx)
- Reusable drag-and-drop file upload component for banners, menu items, and branch images.

---

### Frontend Bundle Optimization & Deduplication (`App.tsx`, `types.ts`)

#### [MODIFY] [App.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/App.tsx)
- Wrap non-critical page routes (`AdminPage`, `LocationsPage`, `ItemDetailPage`, `TrackOrderPage`, `FaqPage`, `ContactPage`) in `React.lazy()` and `Suspense` with a custom loader.

#### [MODIFY] [types.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/types.ts)
- Centralize `OUTLETS` definition as single source of truth across frontend components.

#### [MODIFY] [OutletSelector.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/OutletSelector.tsx)
- Import `OUTLETS` directly from `src/types.ts` instead of local fallback duplicates.

#### [MODIFY] [HomeLocationChips.tsx](file:///c:/Users/j/Downloads/pizza-city-oman-backend/src/components/home/HomeLocationChips.tsx)
- Utilize shared `OUTLETS` constants.

---

## Verification Plan

### Automated Tests
- TypeScript compilation check: `npm run build` or `npx tsc --noEmit`
- Verify server startup and route binding using test script: `node --import tsx/esm server.ts` or `npm run dev`

### Manual Verification
1. **API & DB Fallback Verification**:
   - Verify `/api/orders`, `/admin/api/login`, and `/admin/api/menu` respond correctly.
   - Verify production environment fails gracefully if MongoDB connection string is invalid.
2. **Admin Dashboard Flow**:
   - Test login as `superadmin` and `moderator`.
   - Test tab switching across Orders, Menu, Banners, Branches, Promos, and Moderators.
   - Test item edit, banner toggle, image upload, and receipt printing.
3. **Price Validation Verification**:
   - Submit order payload with tampered item price to verify server recalculates total using [priceUtils.ts](file:///c:/Users/j/Downloads/pizza-city-oman-backend/shared/priceUtils.ts).
4. **Lazy-loading & Bundle Verification**:
   - Inspect Network tab in browser dev tools to confirm page chunks load dynamically on navigation.
