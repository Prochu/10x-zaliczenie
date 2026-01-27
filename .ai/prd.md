# Product Requirements Document (PRD) - BetBuddy

## 1. Product Overview

BetBuddy is a responsive web application designed for a closed group of friends to bet on UEFA Champions League matches. The application automates the process of tracking matches, user bets, and calculating scores. It features real-time updates of match scores and a live leaderboard, pulling data from the api-football.com API. The user interface will be built using Material Design principles with a light theme and a blue primary color, ensuring a clean and intuitive experience on all modern web browsers.

## 2. User Problem

Friends who enjoy betting on Champions League matches often rely on manual methods like spreadsheets or group chats to manage their predictions and track scores. This process is cumbersome, prone to errors, and lacks the excitement of real-time updates. BetBuddy solves this by providing a centralized, automated platform that fetches match data, locks bets before kickoff, updates scores live, and recalculates leaderboards automatically, allowing users to focus on the fun of the competition.

## 3. Functional Requirements

### 3.1. User Management

- R-001: Users must register and log in to be able to use full system functionality.
- R-002: When registering users must provide an email, passowrd and nickname (3-15 characters) to be identified in the application.
- R-003: For the MVP, all registered users will belong to a single, global user group.
- R-004: An 'Admin' role will exist, which must be assigned manually in the database.

### 3.2. Match and Betting System

- R-005: The application must automatically fetch and display a list of all upcoming Champions League matches from the external API.
- R-006: Users must be able to submit and edit their score predictions for any upcoming match.
- R-007: Betting for a specific match must be automatically locked 5 minutes before the official start time.
- R-008: A countdown timer to the betting deadline must be clearly visible for each match.
- R-009: All match times must be displayed in the user's local time zone.
- R-0: Betting is not available for unathenticated users

### 3.3. Scoring and Leaderboard

- R-010: The system will use a mutually exclusive scoring system based on regular match time (excluding extra time and penalties):
  - 4 points for predicting the exact final score.
  - 2 points for correctly predicting a draw or the correct winner and goal difference (but not the exact score).
  - 1 point for correctly predicting the match winner (but not the goal difference or a draw).
- R-011: During live matches, scores and user points must be updated automatically.
- R-012: A leaderboard, accessible to all users, must display the total scores and rankings of all players in real-time.

### 3.4. Match History

- R-013: Users must be able to view a history of past matches.
- R-014: For each past match, the view must include the final score, the user's prediction, and the points they were awarded for that prediction.

### 3.5. Admin Panel

- R-015: A simple, secure admin page must be accessible only to users with the 'Admin' role.
- R-016: Admins must have the ability to manually update the final score of a match.
- R-017: Any manual score update by an admin must automatically trigger a recalculation of points and leaderboard rankings for all users.

### 3.6. Technical & System Requirements

- R-018: The application must be a responsive web app, fully functional on modern desktop and mobile browsers.
- R-019: The system must manage its usage of the external API to stay within the 7000 requests/day limit. Live updates will occur at a 5-minute interval during matches.
- R-020: The application must display a user-friendly message when there are no upcoming matches to show.
- R-021: The database schema must be designed with a `group_id` column to facilitate future implementation of private groups.
- R-022: The application must include a simple, accessible Privacy Policy page.
- R-023: Every bet placement and bet update must be logged in the database, including timestamp, user ID, match ID, and the prediction values.

## 4. Product Boundaries

### 4.1. In Scope (MVP)

- A single, global group for all users.
- The scoring model is fixed as defined in the functional requirements.
- Users can only bet on the final score of the match (without extra time and penalties).
- All core features related to user management, betting, live updates, and admin overrides as detailed above.

### 4.2. Out of Scope (Post-MVP)

- Creation and management of private user groups.
- Different or customizable scoring models.
- Bonus points or alternative betting types (e.g., first goal scorer, number of corners).
- Push notifications or email alerts.
- User analytics and performance tracking.

## 5. User Stories

### User Registration and Management

- ID: US-001
- Title: User registration and access.
- Description: As a user, I want to be able to register and log in to the system in a way that ensures the security of my data.
- Acceptance criteria:
  - Login and registration take place on dedicated pages.
  - Logging in requires an email address and password.
  - Registration requires an email address, nickname, password, and password confirmation.
  - Unregistered user can only display a dashboard without the possibility to place a bet and with no info about previously placed bets
  - Only registered user can see a leaderboard.
  - Only registered user can place a bet.
  - Only registered user can see a match history.
  - Only registered user can see their previous bet and score for each match.
  - The user CAN display a list of planned and live matches withouth the information about placed bet and with no possibility to place a bet.
  - The user can log into the system using the button in the upper right corner.
  - The user can log out of the system using the button in the upper right corner
  - We do not use external login services (e.g., Google, GitHub).
  - Password recovery should be possible.

- ID: US-003
- Title: Returning User Login
- Description: As a returning user, I want to log in quickly using the same account I registered with so I can access my account.
- Acceptance Criteria:
  - Given I am a registered user and am on the login page, I can enter my email and password.
  - When I authenticate successfully, I am logged into my account and redirected to the main dashboard.
  - I do not need to enter a nickname again.

### Viewing Information

- ID: US-004
- Title: View Upcoming Matches
- Description: As a user, I want to see a clear list of upcoming Champions League matches so I can decide which ones to bet on.
- Acceptance Criteria:
  - Given I am logged in, the main dashboard displays a list of upcoming matches.
  - Each match entry shows the two competing teams, the match date, and the kickoff time in my local time zone.
  - For each match, there are input fields for me to enter my score prediction.

- ID: US-005
- Title: View Leaderboard
- Description: As a user, I want to view a leaderboard with the current scores of all players so I can track my ranking against my friends.
- Acceptance Criteria:
  - Given I am logged in, there is a clear link to a "Leaderboard" page.
  - The leaderboard displays a ranked list of all users by their total points, from highest to lowest.
  - Each entry shows the user's rank, nickname, and total points.

- ID: US-006
- Title: View Match History
- Description: As a user, I want to look back at past matches to see the final results and how my points were calculated.
- Acceptance Criteria:
  - Given I am logged in, there is a clear link to a "Match History" page.
  - The page lists all completed matches.
  - Each entry shows the competing teams, the final match score, my prediction for that match, and the points I earned.

- ID: US-007
- Title: View Countdown to Betting Deadline
- Description: As a user looking at an upcoming match, I want to see a countdown timer indicating how much time is left to place or change my bet.
- Acceptance Criteria:
  - Given I am viewing the list of upcoming matches, each match has a timer displayed.
  - The timer accurately shows the time remaining until 5 minutes before kickoff.
  - When the timer reaches zero, the betting inputs for that match become disabled.

- ID: US-008
- Title: View "No Upcoming Matches" Message
- Description: As a user, if there are no upcoming Champions League matches scheduled, I want to see a friendly message informing me of this.
- Acceptance Criteria:
  - Given I am logged in and there are no upcoming matches available from the API, the dashboard displays a message like "No upcoming matches to display. Please check back later."

### Betting Workflow

- ID: US-009
- Title: Place a Bet
- Description: As a user, I want to enter my score prediction for an upcoming match and save it.
- Acceptance Criteria:
  - Given I am viewing an upcoming match for which betting is open, I can enter integer values into the score fields for both teams.
  - When I enter my prediction, a "Save" or "Submit" button becomes active.
  - After saving, I receive a confirmation that my bet has been placed, and the input fields show my saved prediction.
  - The system logs the bet placement in the database with timestamp, user ID, match ID, and prediction values.
  - Betting is only available for registered users

- ID: US-010
- Title: Edit a Bet
- Description: As a user, I want to be able to change my prediction for a match any time before the betting deadline.
- Acceptance Criteria:
  - Given I have already placed a bet on an upcoming match, I can change the values in the score fields.
  - I can save the updated prediction.
  - The system updates my previous bet with the new one.
  - I can repeat this process as many times as I want before the betting deadline.
  - Each bet update is logged in the database with timestamp, user ID, match ID, and the new prediction values.
  - Editing a bet is only available for registered users

- ID: US-011
- Title: Betting is Locked After Deadline
- Description: As a user, I want to be prevented from placing or editing a bet for a match once the deadline has passed to ensure fairness.
- Acceptance Criteria:
  - Given a match is less than 5 minutes from its kickoff time, the score input fields for that match are disabled (read-only).
  - The "Save" button for that bet is hidden or disabled.
  - My last saved bet before the deadline is considered my final prediction.

### Live Experience

- ID: US-012
- Title: See Live Score and Leaderboard Updates
- Description: As a user, I want to see match scores and the leaderboard update automatically during live games so I can follow the action in real-time.
- Acceptance Criteria:
  - Given a match is in progress, the score displayed for that match on the dashboard updates periodically (every 5 minutes).
  - As live scores change, my points and position on the leaderboard are automatically recalculated and updated.
  - The leaderboard page reflects these changes without requiring a manual page refresh.

### Admin Functions

- ID: US-014
- Title: Admin Login
- Description: As an admin, I want a secure way to access a separate admin interface to perform administrative tasks.
- Acceptance Criteria:
  - Given I am a user with an 'Admin' role and I am logged in, I can see a link to an "Admin Panel".
  - Accessing this panel does not require a separate login, but the system verifies my admin status on the server.
  - Users without the 'Admin' role cannot see the link or access the admin URL directly.

- ID: US-015
- Title: Admin Manually Updates a Match Result
- Description: As an admin, I want to be able to manually correct the final score of a completed match to fix any potential errors from the API.
- Acceptance Criteria:
  - Given I am on the Admin Panel, I can see a list of completed matches.
  - I can select a match and edit the input fields for the final score.
  - Upon submitting a new score, the system overwrites the previous result in the database.
  - This action triggers an automatic recalculation of points for all users who bet on that match.
  - The leaderboard is updated to reflect the new point totals.

## 6. Success Metrics

### 6.1. Accuracy and Reliability

- M-01: The system correctly calculates and assigns points with 100% accuracy according to the defined scoring rules.
- M-02: The application operates without exceeding the daily API request limit of 7000.
- M-03: The frequency of admin manual overrides should be minimal, indicating high reliability of the API data pipeline.

### 6.2. User Engagement

- M-04: A high percentage of registered users actively place bets during each Champions League match week.

### 6.3. User Experience

- M-05: The application interface for viewing matches, placing bets, and tracking the leaderboard is simple, clear, and intuitive.
- M-06: The application provides timely data updates during live matches, with a maximum latency of 5 minutes as defined.
