# Technical Specification: Authentication and User Management System (US-001)

## 1. USER INTERFACE ARCHITECTURE

### 1.1. New Pages and Routes

The following pages will be implemented as Astro pages (`src/pages/*.astro`) to handle server-side logic and initial rendering:

- `/auth/login`: Dedicated login page.
- `/auth/register`: Dedicated registration page (includes nickname field).
- `/auth/recovery`: Password recovery request page.
- `/auth/reset-password`: Page for setting a new password (via recovery link).
- `/auth/callback`: Server-side route to handle Supabase Auth exchange (PKCE).

### 1.2. Component Responsibilities

- **Astro Pages (Server-side)**:
  - Handle session verification via `context.locals.supabase`.
  - Perform redirects for unauthorized access (e.g., redirecting `/leaderboard` to `/auth/login`).
  - Pass initial session state to client components.
- **React Components (Client-side)**:
  - `LoginForm`, `RegisterForm`, `RecoveryForm`: Handle form state, client-side validation (Zod), and calls to Supabase Auth API.
  - `Navigation`: Extended to show "Login" for guests and "Profile/Logout" for authenticated users.

### 1.3. UI State & Access Control

- **Guest Mode (Unauthenticated)**:
  - Access to `/dashboard` (read-only, no betting fields).
  - Access to `/auth/*` routes.
  - Navigation shows "Login" button in the top right.
- **User Mode (Authenticated)**:
  - Access to `/dashboard` (with betting enabled), `/leaderboard`, and `/history`.
  - Redirected away from `/auth/login` and `/auth/register` to `/dashboard`.
  - Navigation shows user nickname and "Logout" button.
- **Admin Mode**:
  - Same as User Mode plus access to `/admin` panel.

### 1.4. Validation & Errors

- **Registration**:
  - Email: Valid format.
  - Password: Min 8 characters, must match confirmation.
  - Nickname: 3-15 characters, alphanumeric only.
- **Error Messages**:
  - "Invalid credentials" for failed login.
  - "Email already registered" for registration.
  - "Nickname already taken" for registration.
  - "Nickname must be 3-15 characters" for registration.
  - "Password reset link expired" for recovery.

---

## 2. BACKEND LOGIC

### 2.1. API Endpoints

New endpoints in `src/pages/api/`:

- `POST /api/auth/register`: Initial user creation and profile setup.
- `POST /api/auth/login`: Session creation.
- `POST /api/auth/logout`: Session termination.

### 2.2. Data Models (Supabase)

- **auth.users**: Managed by Supabase Auth.
- **public.profiles**:
  - `id`: UUID (references auth.users.id).
  - `nickname`: TEXT (unique, 3-15 chars).
  - `role`: TEXT (default 'user', manually set to 'admin').
  - `group_id`: UUID (nullable, for future private groups support - R-021).
  - `created_at`: TIMESTAMPTZ.

### 2.3. Server-Side Rendering (SSR)

- **Middleware Update**: `src/middleware/index.ts` will be extended to:
  - Initialize the Supabase Server Client with cookies.
  - Refresh the session on every request.
  - Populate `context.locals.user` for easy access in Astro pages.
- **Protected Routes**: Astro pages for `/leaderboard`, `/history`, and `/admin` will check `context.locals.user` and redirect to `/auth/login` if null.

---

## 3. AUTHENTICATION SYSTEM (SUPABASE)

### 3.1. Implementation Strategy

- **Client-Side**: Use `@supabase/supabase-js` for browser-based auth actions (login, register, recovery).
- **Server-Side**: Use `@supabase/ssr` (or manual cookie handling in middleware) to maintain session persistence across Astro page navigations.
- **Auth Flow**:
  1. User registers via `supabase.auth.signUp` with additional metadata (nickname).
  2. A Supabase trigger or the registration API endpoint creates the entry in `public.profiles`.
  3. Email confirmation (optional but recommended) redirects to `/auth/callback`.
  4. Middleware detects the session and verifies the profile.

### 3.2. Password Recovery

- Use `supabase.auth.resetPasswordForEmail`.
- Recovery link points to `/auth/callback?next=/auth/reset-password`.
- User provides a new password which is updated via `supabase.auth.updateUser`.

### 3.3. Security

- **RLS (Row Level Security)**:
  - `profiles`: Publicly readable, but only owner can update.
  - `bets`: Only owner can insert/update; readable by owner (and admin).
- **Admin Verification**: Server-side check on the `role` column in the `profiles` table for all `/admin` and `/api/admin/*` requests.

---

## 4. COMPATIBILITY & CONSTRAINTS

- **Existing Behavior**: Dashboard remains accessible to guests but with disabled betting inputs (R-0, US-001).
- **Tech Stack**: Fully utilizes Astro 5 SSR, React 19 components, and Supabase Auth.
- **Navigation**: The existing `Navigation.tsx` will be updated to dynamically reflect auth state without breaking the layout.
