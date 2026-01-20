# View Implementation Plan: Leaderboard

## 1. Overview
The Leaderboard view provides a competitive overview of all users in the application. It displays user rankings based on total points earned from score predictions, the number of matches each user has bet on, and highlights the current user's position. It supports pagination and periodic updates to reflect live match results and point recalculations.

## 2. View Routing
- **Path:** `/leaderboard`
- **Access:** Authenticated users only.

## 3. Component Structure
- `src/pages/leaderboard.astro` (Astro Page)
    - `Layout` (Main Layout)
        - `LeaderboardHeader` (Title and Stats)
        - `LeaderboardContainer` (React - Main Logic)
            - `LeaderboardTable` (Presentation)
                - `LeaderboardRow` (Individual Rows)
            - `LeaderboardPagination` (Page Controls)
            - `LeaderboardCurrentUserRow` (Sticky row for current user)

## 4. Component Details

### LeaderboardContainer (React)
- **Description:** The core logic component that manages data fetching, pagination state, and polling for real-time updates.
- **Main elements:** `div` wrapper containing the header, table, and pagination.
- **Handled interactions:** 
    - Initial data fetch on mount.
    - Page change (updates state and re-fetches).
    - Polling every 5 minutes during active match windows.
- **Handled validation:** 
    - Validates `page` range against `total` items.
- **Types:** `LeaderboardResponse`, `LeaderboardEntryDto`, `MeDto`.
- **Props:** 
    - `currentUser`: `MeDto` (passed from Astro page).

### LeaderboardTable (React)
- **Description:** A presentational component using Shadcn/UI Table components to display the rankings.
- **Main elements:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`.
- **Handled interactions:** None.
- **Types:** `LeaderboardEntryDto[]`.
- **Props:** 
    - `entries`: `LeaderboardEntryDto[]`
    - `currentUserId`: `string` (for highlighting)

### LeaderboardRow (React)
- **Description:** Displays a single user's rank, nickname, total points, and matches bet count.
- **Main elements:** `TableRow` with multiple `TableCell` elements.
- **Handled interactions:** None.
- **Types:** `LeaderboardEntryDto`.
- **Props:** 
    - `entry`: `LeaderboardEntryDto`
    - `isCurrentUser`: `boolean`

### LeaderboardCurrentUserRow (React)
- **Description:** A sticky component that stays at the bottom of the viewport if the current user is not visible in the current paginated view.
- **Main elements:** Styled `div` mimicking a `TableRow`, fixed or sticky positioning.
- **Handled interactions:** None.
- **Types:** `LeaderboardEntryDto`.
- **Props:** 
    - `entry`: `LeaderboardEntryDto`

## 5. Types

### Required DTOs (from `src/types.ts`)
```typescript
export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  nickname: string;
  totalPoints: number;
  matchesBet: number;
}

export type LeaderboardResponse = PaginatedItems<LeaderboardEntryDto>;
```

### View Models
- `LeaderboardViewModel`: Extends `LeaderboardEntryDto` with UI-specific flags like `isHighlighted`.

## 6. State Management
- **Custom Hook:** `useLeaderboard`
    - **Purpose:** Encapsulates fetching logic, pagination, and polling.
    - **State variables:**
        - `items`: `LeaderboardEntryDto[]`
        - `total`: `number`
        - `currentPage`: `number`
        - `pageSize`: `number` (default 50)
        - `isLoading`: `boolean`
        - `error`: `string | null`
    - **Methods:** `setPage(page)`, `refresh()`.

## 7. API Integration
- **Endpoint:** `GET /api/leaderboard`
- **Request Type:**
    - Query Parameters: `page` (number), `pageSize` (number), `sort` (string).
- **Response Type:** `LeaderboardResponse`
- **Action:** Fetch data on mount and whenever `currentPage` changes. Implement 5-minute polling when live matches are detected (or as a general safety interval).

## 8. User Interactions
- **Page Navigation:** Clicking pagination buttons updates `currentPage`, triggering a new API request.
- **Hovering Rows:** Visual feedback on table rows for better readability.
- **Navigation to Dashboard:** Clear link back to the main betting dashboard.

## 9. Conditions and Validation
- **Authentication:** View is protected; redirects to login if no session exists.
- **Empty State:** If `items` is empty, display "No rankings available. Place your first bet to join the competition!".
- **Pagination Limits:** Buttons are disabled if on the first or last page.
- **Current User Highlight:** The row matching `currentUser.id` must have a distinct background color (e.g., light blue).

## 10. Error Handling
- **Network Errors:** Display a toast or a non-intrusive alert box with a "Retry" button.
- **API Errors:** Log to console and show a user-friendly message in the table area.
- **Loading States:** Use Shadcn/UI Skeleton components for the table rows during initial fetch.

## 11. Implementation Steps
1. **Prepare Types:** Ensure `LeaderboardEntryDto` and `LeaderboardResponse` are correctly exported in `src/types.ts`.
2. **Create API Hook:** Implement `useLeaderboard` hook with `fetch` and `setInterval` for polling.
3. **Build UI Components:** 
    - Implement `LeaderboardRow` and `LeaderboardTable` using Shadcn/UI components.
    - Implement `LeaderboardPagination` component.
4. **Develop LeaderboardContainer:** Assemble the logic and presentation components.
5. **Sticky User Row Logic:** Implement logic to determine if the current user is present in the current `items` list; if not, show `LeaderboardCurrentUserRow`.
6. **Astro Page Integration:** Create `src/pages/leaderboard.astro`, fetch the current user profile in `locals`, and pass it to the React container.
7. **Styling:** Add Tailwind classes for the sticky positioning and highlighting.
8. **Testing:** Verify pagination, responsiveness (especially the table), and the 5-minute update cycle.

