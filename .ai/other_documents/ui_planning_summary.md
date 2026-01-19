# UI Architecture Planning Summary - BetBuddy MVP

<conversation_summary>
<decisions>
1. Users without a nickname will be automatically redirected to an onboarding page via middleware/layout check.
2. The Dashboard will combine Live and Upcoming matches in a single view.
3. A 5-minute polling interval will be used to synchronize live scores and leaderboard data.
4. Navigation will adapt to device type: bottom bar for mobile, top header for desktop.
5. Betting inputs will use optimistic updates with toast notifications for error handling.
6. Admin match editing will be consolidated into a single interface handling both metadata (logos, time) and score overrides.
7. The Leaderboard will be a single-page list for the MVP with a sticky row for the current user's rank.
8. Bet logs (audit history) will not have a dedicated view in the MVP.
9. Mobile accessibility will be prioritized using numeric steppers with large touch targets and `inputmode="numeric"`.
10. All dates will be handled in UTC on the server and formatted to local time on the client to avoid hydration issues.
11. Nickname creation will include a debounced availability check for real-time feedback.
12. Live matches will have a distinct visual treatment (e.g., pulsating indicators).
13. Match history will be organized chronologically by weeks or months using accordions.
14. Nicknames are immutable once set for the duration of the MVP.
15. Session expiry (401 errors) will trigger an automatic redirect to the login page.
</decisions>

<matched_recommendations>
1. **Hybrid Architecture:** Use Astro for static shells and navigation, with React "Islands" for interactive components like match cards and countdowns.
2. **Onboarding UX:** Prevent access to core features until a profile (nickname) is created using a dedicated onboarding route.
3. **Data Freshness:** Implement a 5-minute refresh cycle for live data with a "Last updated" timestamp to manage user expectations.
4. **Optimistic Writes:** Update the UI immediately when a bet is saved, reverting only if the API returns an error (e.g., betting locked).
5. **Admin Workflow:** Abstract the technical difference between PATCH metadata and PATCH score endpoints behind a unified Admin UI.
6. **Device Adaptation:** Ensure 44x44px touch targets for stepper buttons and secondary navigation for mobile users.
7. **Performance Optimization:** Use skeleton screens for the Dashboard to maintain layout stability during initial data fetch.
8. **Error Handling:** Centralize API error responses (429, 500) into a toast notification system to inform users without breaking the UI.
</matched_recommendations>

<ui_architecture_planning_summary>
### Main UI Architecture Requirements
The application will leverage **Astro 5** for high-performance static rendering of the page structure and **React 19** for dynamic elements. **Tailwind 4** and **Shadcn/ui** will provide the design system, focusing on a clean, Material-inspired light theme with blue accents.

### Key Views, Screens, and User Flows
- **Auth/Login:** Entry point via third-party providers.
- **Onboarding:** Forced redirection for new users to select a unique nickname.
- **Unified Dashboard:** The central hub showing live matches (pulsing indicators) and upcoming matches with real-time countdowns.
- **Leaderboard:** A ranked list of all users on a single page, featuring a sticky profile row for the current user's standing.
- **Match History:** A chronologically grouped archive of past results and earned points.
- **Admin Panel:** A protected area for managing match data and finalizing scores, visible only to authorized users.
- **Intermission View:** An engaging state displayed when no matches are scheduled, highlighting top players and history.

### API Integration and State Management Strategy
- **Polling:** React Query will manage a 5-minute polling loop for the matches and leaderboard endpoints.
- **Optimistic UI:** Betting actions will be reflected immediately in the UI to minimize perceived latency.
- **Interceptors:** A Supabase client interceptor will handle 401/403 errors, ensuring graceful session management.
- **Data Neutrality:** Dates are transmitted as UTC ISO strings, with local formatting occurring strictly on the client side.

### Responsiveness, Accessibility, and Security
- **Mobile-First:** Navigation and inputs are optimized for small screens (bottom nav, large touch targets).
- **Accessibility:** Proper `inputmode` usage and ARIA labels for dynamic status changes (like "Betting Locked").
- **Security:** Access control is enforced at both the UI level (conditional rendering) and via middleware redirects.
</ui_architecture_planning_summary>

<unresolved_issues>
1. Confirmation of specific fallback icons/graphics for the "Intermission" and "Fallback Logo" states.
2. Final determination of the "Admin" role manual assignment process in the database (out of UI scope but impacts access).
</unresolved_issues>
</conversation_summary>

