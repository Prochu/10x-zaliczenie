# UI Architecture for BetBuddy

## 1. UI Structure Overview

BetBuddy follows a **Mobile-First, Hybrid Architecture** leveraging Astro 5 for the static shell and routing, and React 19 for interactive "islands." The UI is designed for a light theme with a primary blue color, emphasizing clarity and ease of use for a closed group of friends. 

The structure is divided into three main zones:
1.  **Public Zone:** Landing and authentication.
2.  **Onboarding Zone:** Forced state for new users to set their identity.
3.  **App Zone:** The core experience (Dashboard, Leaderboard, History) accessible to registered users.
4.  **Admin Zone:** Restricted management tools for score overrides and metadata.

## 2. View List

### Login / Landing
-   **View Path:** `/`
-   **Main Purpose:** Authenticate users and introduce the product.
-   **Key Information:** Product value proposition, "Sign in with Google/Facebook/Apple" buttons, link to Privacy Policy.
-   **Key View Components:** Auth Provider Buttons, Feature Highlights.
-   **Considerations:**
    -   **Security:** Uses Supabase OAuth flow.
    -   **UX:** Simple, distraction-free entry point.

### Onboarding
-   **View Path:** `/onboarding`
-   **Main Purpose:** Ensure every user has a unique nickname before entering the app.
-   **Key Information:** Nickname input field, validation rules (3-15 alphanumeric), real-time availability status.
-   **Key View Components:** Nickname Form, Availability Badge (debounced check).
-   **Considerations:**
    -   **UX:** Prevent access to other pages until complete via middleware.
    -   **Accessibility:** Clear error messages for validation failures.

### Unified Dashboard
-   **View Path:** `/dashboard`
-   **Main Purpose:** The central hub for active betting and following live games.
-   **Key Information:** Live matches (pulsing), upcoming matches, countdown timers, user's current bets, "Last Updated" timestamp.
-   **Key View Components:** Match Card (Live/Upcoming), Score Stepper, Countdown Timer, Empty State (Intermission view).
-   **Considerations:**
    -   **UX:** Optimistic updates on bet placement; 5-minute polling for live scores.
    -   **Accessibility:** `inputmode="numeric"` for mobile keyboards; large touch targets for steppers.

### Leaderboard
-   **View Path:** `/leaderboard`
-   **Main Purpose:** Display competitive standings and total points.
-   **Key Information:** Global rank, Nickname, Total Points, Number of matches bet.
-   **Key View Components:** Rankings Table, Sticky Current User Row (at bottom or top if not in top N).
-   **Considerations:**
    -   **UX:** Highlight the current user visually.
    -   **Accessibility:** Semantic table structure for screen readers.

### Match History
-   **View Path:** `/history`
-   **Main Purpose:** Review past results and points earned.
-   **Key Information:** Completed match results, user's predictions, points awarded per match.
-   **Key View Components:** Chronological Match List (grouped by week/month), Points Badge.
-   **Considerations:**
    -   **UX:** Use accordions or infinite scroll for long lists.
    -   **Security:** Display only the current user's historical bets.

### Admin Panel
-   **View Path:** `/admin`
-   **Main Purpose:** Manual score overrides and match metadata management.
-   **Key Information:** List of all matches (filterable by status), Editable score fields, Status toggles.
-   **Key View Components:** Admin Match Table, Score Override Modal, API Sync Trigger.
-   **Considerations:**
    -   **Security:** Server-side `is_admin` check required for access.
    -   **UX:** Consolidate PATCH metadata and PATCH score actions into a single intuitive form.

### Privacy Policy
-   **View Path:** `/privacy`
-   **Main Purpose:** Legal compliance.
-   **Key Information:** Data usage, third-party auth disclosure.
-   **Key View Components:** Static text content.

## 3. User Journey Map

### The "First Bet" Journey (New User)
1.  **Discovery:** User lands on `/`, clicks "Sign in with Google."
2.  **Authentication:** Redirected to Google, returns to BetBuddy.
3.  **Onboarding:** Middleware detects no nickname, redirects to `/onboarding`.
4.  **Identity:** User enters "Striker99," sees "Available" green check, submits.
5.  **Dashboard:** Redirected to `/dashboard`.
6.  **Action:** User finds upcoming "Real Madrid vs Man City," uses steppers to set "2 - 1," clicks "Save."
7.  **Feedback:** Sees a success toast; input fields turn green/locked-style.

### The "Live Pulse" Journey (Returning User)
1.  **Check-in:** User opens app during match time, lands on `/dashboard`.
2.  **Real-time:** Sees a live match with a pulsing "LIVE" indicator.
3.  **Standings:** Switches to `/leaderboard` to see their rank jump as a goal is scored.
4.  **History:** Checks `/history` to confirm points from yesterday's match.

## 4. Layout and Navigation Structure

### Adaptive Navigation
-   **Mobile Layout:** 
    -   **Bottom Navigation Bar:** Icons for Dashboard, Leaderboard, History.
    -   **Top Bar:** App Logo and User Avatar (opens Profile/Logout/Admin menu).
-   **Desktop Layout:**
    -   **Top Header:** Logo on left; Navigation links (Dashboard, Leaderboard, History) in center; Profile/Logout/Admin on right.

### Global Elements
-   **Notification System:** Toast messages for errors (e.g., "Betting locked") and successes (e.g., "Bet saved").
-   **Loading States:** Skeleton screens for the Dashboard and Leaderboard to prevent layout shift.

## 5. Key Components

-   **MatchCard:** Encapsulates team info, logos, status, and betting inputs. Shared between Dashboard (interactive) and History (read-only).
-   **ScoreStepper:** A custom numeric input with `+` and `-` buttons for better mobile UX.
-   **CountdownTimer:** High-accuracy timer that triggers the "Lock" state in the UI when it hits 0.
-   **AppShell:** The main wrapper providing navigation and theme context.
-   **AdminGuard:** A wrapper component/logic that prevents rendering of admin links/views for non-admin users.

