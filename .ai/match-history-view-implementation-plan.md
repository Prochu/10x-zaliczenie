# View Implementation Plan: Match History

## 1. Overview

The Match History view allows users to review their past betting performance. It provides a chronological list of completed matches, showing the official final results alongside the user's predictions and the points they earned based on the scoring system.

## 2. View Routing

- **Path:** `/history`
- **File:** `src/pages/history.astro` (containing the React `MatchHistory` component)

## 3. Component Structure

- `MatchHistory` (Main Page Component)
  - `HistoryHeader` (Page title and optional stats)
  - `MatchHistoryList` (Container for history items)
    - `HistoryCard` (Individual match result)
      - `TeamDisplay` (Logo and name for home/away)
      - `ScoreComparison` (Final score vs. prediction)
      - `PointsBadge` (Visual indicator of points earned)
    - `EmptyHistoryState` (Shown when no past matches exist)
  - `PaginationControls` (Next/Prev and page numbers)

## 4. Component Details

### MatchHistory

- **Description:** Root React component for the history view. Manages pagination state and data fetching.
- **Main elements:** `<main>` wrapper, `HistoryHeader`, `MatchHistoryList`, `PaginationControls`.
- **Handled interactions:** Page changes, initial data fetch.
- **Types:** `MatchHistoryResponse`.
- **Props:** None (Page-level).

### HistoryCard

- **Description:** A card representing a completed match and the user's bet outcome.
- **Main elements:** Grid layout showing teams, scores, and points.
- **Handled interactions:** None (Read-only).
- **Validation:**
  - Display "No Bet" if `userBet` is missing.
  - Points should be highlighted based on value (4 = Exact, 2 = Outcome+GD, 1 = Outcome, 0 = None).
- **Types:** `MatchHistoryItemDto`.
- **Props:** `item: MatchHistoryItemDto`.

### PointsBadge

- **Description:** A stylistic badge showing points earned.
- **Main elements:** `<span>` with variant-based styling.
- **Handled validation:**
  - `4 points`: High-contrast (e.g., Green/Gold).
  - `2 points`: Medium-contrast (e.g., Blue/Silver).
  - `1 point`: Low-contrast (e.g., Gray/Bronze).
  - `0 points`: Muted/Red.
- **Props:** `points: number | null`.

### PaginationControls

- **Description:** Standard pagination navigation.
- **Main elements:** "Previous", "Next" buttons, current page indicator.
- **Handled interactions:** `onPageChange(newPage)`.
- **Props:** `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`.

## 5. Types

### ViewModel Types

```typescript
interface HistoryState {
  items: MatchHistoryItemDto[];
  total: number;
  isLoading: boolean;
  error: string | null;
}
```

### Required DTOs (from src/types.ts)

- `MatchHistoryResponse`: Paginated response wrapper.
- `MatchHistoryItemDto`: Contains `match` (MatchSummaryDto), `bet` (UserBetInlineDto), and `pointsAwarded`.
- `MatchSummaryDto`: Basic match details (teams, final score, kickoff).
- `UserBetInlineDto`: User's predicted scores.

## 6. State Management

- **Pagination State:** Managed via `useState` for `currentPage` (starting at 1).
- **History Data:** Managed via a custom hook `useMatchHistory` which fetches data whenever the `currentPage` changes.
- **Loading State:** Boolean flag to show skeletons/spinners during API calls.

## 7. API Integration

- **Endpoint:** `GET /api/matches/history`
- **Request Parameters:**
  - `page`: number
  - `pageSize`: number (default: 20)
  - `order`: "desc" (default to show most recent first)
- **Response Type:** `MatchHistoryResponse`

## 8. User Interactions

1. **Navigating to History:** User clicks "History" in navigation; `MatchHistory` fetches the first page of results.
2. **Changing Pages:** User clicks a pagination button; `currentPage` updates, triggering a new fetch.
3. **Empty State:** If `total === 0`, user sees a message suggesting they start betting on upcoming matches with a link to the dashboard.

## 9. Conditions and Validation

- **Authentication:** The view is protected; if the API returns 401, the component should trigger a redirect to the login page (handled via middleware or layout).
- **Score Display:** If a match was cancelled or postponed, the card should reflect this status instead of showing points.
- **Date Formatting:** `kickoffTime` must be formatted to the user's local time and locale.

## 10. Error Handling

- **Fetch Failures:** Show a "Failed to load history" message with a "Retry" button.
- **Partial Data:** If `bet` is missing, display "No prediction made" in the `ScoreComparison` area.
- **Zero Points:** Ensure 0 points is explicitly shown (not hidden) to provide feedback on incorrect predictions.

## 11. Implementation Steps

1. **Create Page:** Set up `src/pages/history.astro` with the base layout.
2. **Define Hook:** Implement `useMatchHistory` in `src/lib/hooks/useMatchHistory.ts` (or similar).
3. **Build Components:**
   - Create `HistoryCard` with Tailwind styling.
   - Create `PointsBadge` component.
   - Create `PaginationControls` (reusable if possible).
4. **Assemble `MatchHistory`:** Combine sub-components and connect to the hook.
5. **Handle States:** Implement loading skeletons and the `EmptyHistoryState`.
6. **Final Styling:** Ensure mobile responsiveness (stacking team names on small screens).
7. **Add Navigation:** Link to `/history` from the main app navigation bar.
