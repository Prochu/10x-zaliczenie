# View Implementation Plan: Unified Dashboard

## 1. Overview
The Unified Dashboard serves as the central hub of BetBuddy. It allows users to view scheduled and live Champions League matches, place or edit their score predictions, and track live scores in real-time. The view focuses on clear visibility of betting deadlines and immediate feedback for user actions.

## 2. View Routing
- **Path:** `/dashboard`
- **File:** `src/pages/dashboard.astro` (containing the React Dashboard component)

## 3. Component Structure
- `Dashboard` (Main Page Component)
    - `DashboardHeader` (Title and "Last Updated" timestamp)
    - `MatchList` (Container with grid/list layout)
        - `EmptyState` (Shown when no matches are available)
        - `MatchCard` (Individual match entry)
            - `LiveBadge` (Pulsing indicator for `live` status)
            - `CountdownTimer` (Countdown to the 5-minute betting deadline)
            - `ScoreDisplay` (Displays current match score for live/finished games)
            - `BettingForm` (Input area for user predictions)
                - `ScoreStepper` (Custom input for incrementing/decrementing scores)
                - `SaveButton` (Action button with loading state)

## 4. Component Details

### Dashboard
- **Description:** Orchestrates data fetching, polling logic, and layout.
- **Main elements:** `main` container, `DashboardHeader`, `MatchList`.
- **Handled interactions:** Initial data load, periodic polling (every 5 minutes).
- **Types:** `MatchListResponse`.
- **Props:** None (Page-level component).

### MatchCard
- **Description:** Displays match metadata, real-time score, and the betting interface.
- **Main elements:** Team names and logos, kickoff time, countdown timer, betting inputs.
- **Handled interactions:** Score adjustment, form submission.
- **Handled validation:** 
    - Scores must be integers >= 0.
    - Betting is disabled if `now > bettingDeadline` or match status is not `scheduled` or `live`.
- **Types:** `MatchListItemDto`, `UserBetInlineDto`.
- **Props:** `match: MatchListItemDto`.

### ScoreStepper
- **Description:** A custom numeric input for goal predictions.
- **Main elements:** Minus button, numeric value display, Plus button.
- **Handled interactions:** Click/Tap to increment/decrement.
- **Handled validation:** Prevents values below 0.
- **Props:** `value: number`, `onChange: (val: number) => void`, `disabled: boolean`.

### CountdownTimer
- **Description:** A live timer showing remaining time until the betting lock.
- **Main elements:** `<span>` with formatted time (e.g., "02:15:04").
- **Handled interactions:** Updates every second.
- **Handled validation:** Triggers a "Lock" event when reaching zero.
- **Props:** `deadline: string` (ISO date).

## 5. Types

### ViewModel Types
```typescript
// Local state for the betting form within a MatchCard
interface BettingState {
  homeScore: number;
  awayScore: number;
  isDirty: boolean; // True if local score differs from saved bet
  isSaving: boolean;
}
```

### Required DTOs (from src/types.ts)
- `MatchListItemDto`: Contains match details and existing `userBet`.
- `MatchListResponse`: Paginated response containing `items` of `MatchListItemDto`.
- `BetUpsertCommand`: `{ homeScore: number, awayScore: number }`.
- `BetResponse`: Result of the upsert operation.

## 6. State Management
- **Matches State:** Managed via a custom hook `useMatches` which uses `useEffect` for fetching and `setInterval` (5 minutes) for polling.
- **Local Betting State:** Managed within individual `MatchCard` components using `useState` to allow per-match editing without affecting the global list.
- **Countdown State:** Managed via `useCountdown` hook to provide reactive time remaining.

## 7. API Integration

### Fetch Matches
- **Endpoint:** `GET /api/upcomingmatches`
- **Request Query:** `status=scheduled,live&sort=kickoff_time:asc`
- **Response:** `MatchListResponse`

### Save Bet
- **Endpoint:** `PUT /api/matches/[matchId]/bet`
- **Request Body:** `BetUpsertCommand`
- **Response:** `BetResponse`

## 8. User Interactions
1. **Viewing Dashboard:** User lands on page; loading spinner shows until `GET /api/upcomingmatches` completes.
2. **Adjusting Score:** User clicks `+` or `-` on `ScoreStepper`. `isDirty` becomes true, enabling the "Save" button.
3. **Saving Bet:** User clicks "Save". `isSaving` becomes true. On success, toast notification appears and `isDirty` reset. On failure, error message shown.
4. **Deadline Reached:** `CountdownTimer` hits zero. UI immediately disables `ScoreStepper` and hides "Save" button.

## 9. Conditions and Validation
- **Betting Lock:** The UI must calculate `bettingDeadline` as `kickoffTime - 5 minutes`. If current time exceeds this, all inputs for that match must be `disabled`.
- **Numeric Integrity:** Inputs must strictly allow non-negative integers.
- **Status Checks:** Matches with status `finished`, `cancelled`, or `postponed` should have betting disabled regardless of the timer.

## 10. Error Handling
- **API Failures:** Show a global "Error fetching matches" alert or toast for polling failures.
- **403 Betting Locked:** If a user attempts to save a bet after the server-side lock, show a "Betting is closed for this match" toast and refresh the data.
- **Empty State:** If `items.length === 0`, render the `EmptyState` component with a friendly message: "No upcoming matches to display. Please check back later."

## 11. Implementation Steps
1. **Create Layout:** Set up the basic grid layout in `src/pages/dashboard.astro`.
2. **Implement `useMatches`:** Create the custom hook for fetching and polling match data.
3. **Build `EmptyState`:** Implement the UI for when no matches are returned.
4. **Develop `MatchCard` Skeleton:** Create the visual card using Shadcn `Card` components.
5. **Implement `ScoreStepper`:** Build the custom input with increment/decrement logic.
6. **Add `CountdownTimer`:** Implement the timer logic using `requestAnimationFrame` or `setInterval`.
7. **Integrate Betting API:** Connect the "Save" button to the `PUT /api/matches/[matchId]/bet` endpoint.
8. **Add Live Feedback:** Implement the `LiveBadge` and real-time score updates from the polling data.
9. **Final Polishing:** Add Tailwind transitions, loading skeletons, and toast notifications for success/error states.

