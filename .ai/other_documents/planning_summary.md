<conversation_summary>
<decisions>
User Group: For the MVP, all registered users will belong to a single, global group.
Scoring System: A mutually exclusive scoring system will be used: 4 points for the exact score, 2 for the correct score difference/draw, and 1 for the correct winner. Results are based on regular match time only.
API: The project will use the api-football.com API with a free tier limit of 100 requests/day.
Authentication: User registration and login will be handled through third-party providers (Google, Facebook, Apple, etc.). Users will create a unique, alphanumeric nickname (3-15 characters) upon registration.
Live Updates: Scores and leaderboards will update automatically in real-time, with a 10-minute interval between updates during matches to manage API limits.
Betting Deadline: Betting will be locked 5 minutes before each match starts, with a countdown timer displayed. Users can edit their bets until this deadline.
Platform & Design: The application will be a responsive web app for modern browsers, using a light-themed Material Design with a blue primary color.
Match History: A view for past matches will be available, showing the final score, the user's bet, and points awarded.
Admin Role: An admin role will be assigned manually in the database. A simple admin page will allow for manually updating match results, which will automatically trigger a recalculation of all points.
API Limit Handling: If the daily API request limit is neared (90+ requests), live updates will be paused, and a notification will be displayed to users.
Data Retention & Privacy: All data will be retained indefinitely for the MVP. A simple Privacy Policy page will be included.
Notifications & Analytics: No user notifications or analytics will be included in the MVP.
Hosting: The application will be hosted on a platform like Cloudflare or Azure.
</decisions>
<matched_recommendations>
Mutually Exclusive Scoring: The recommendation to make the scoring rules mutually exclusive (e.g., a user gets 4 points for an exact score, not 4+2+1) was accepted to ensure simplicity.
Future-Proof Database Schema: The recommendation to design the database with a group_id column from the start was accepted to facilitate the future implementation of private groups.
Admin Panel for Manual Overrides: The recommendation to include a minimal admin panel for manually correcting scores and automatically recalculating points was accepted to handle potential API errors.
Graceful Degradation for API Limits: The recommendation to implement a "graceful degradation" mode by pausing live updates when the API limit is approached was accepted as a contingency plan.
User Nicknames for Privacy: The recommendation to have users create a unique nickname instead of using their full names from social profiles was accepted to protect user privacy.
Time Zone Conversion: The recommendation to display all times in the user's local time zone was accepted to prevent confusion.
Handling "Empty States": The recommendation to display a user-friendly message when no upcoming matches are available was accepted to improve user experience.
</matched_recommendations>
<prd_planning_summary>
The conversation has successfully defined the scope and requirements for the MVP of a Champions League betting application for a closed group of friends.
a. Main Functional Requirements:
User Management: Third-party authentication, unique user nicknames, and a single group for all MVP users.
Match Data: Automated fetching of upcoming matches from api-football.com, displayed clearly to the user.
Betting System: Ability for users to place and edit score predictions up until 5 minutes before kick-off.
Automated Scoring: An automated, tiered scoring system (4/2/1 points) that calculates user points based on live match results.
Live Updates: A real-time view of match scores and a user leaderboard that automatically updates every 10 minutes during games.
Match History: An on-demand view for users to review their past bets and the points they earned.
Admin Interface: A basic, secured panel for an administrator to manually correct match scores, which triggers an automatic system-wide points recalculation.
Technical Foundations: A responsive web application built with Material Design, with a database schema prepared for future multi-group functionality and robust server-side error logging.
b. Key User Stories and Usage Paths:
Registration: "As a new user, I want to register quickly using my Google account and choose a nickname so I can start betting without a lengthy sign-up process."
Placing a Bet: "As a user, I want to see a list of upcoming matches and easily enter my score prediction for each one."
Changing a Bet: "As a user, I want to be able to change my prediction for a match before it starts because my opinion might change."
Tracking Results: "As a user, I want to watch the leaderboard and my total score update automatically during live matches so I can see how I'm doing against my friends."
Reviewing History: "As a user, I want to look back at past matches to see what I predicted and how my points were calculated to understand the scoring rules better."
Admin Correction: "As an admin, I want to be able to fix an incorrect final score from the API to ensure the final standings are fair and accurate."
c. Important Success Criteria:
Accuracy: The application must correctly calculate and award points to all users based on the established scoring logic and final match results.
Clarity: The user interface for displaying matches, leaderboards, and betting history must be simple, clear, and intuitive.
Reliability & Efficiency: The application must operate without exceeding the 100 daily API request limit while providing timely updates to users.
</prd_planning_summary>
<unresolved_issues>
There are no major unresolved issues for the defined MVP scope. All initial ambiguities have been clarified through the Q&A process.
</unresolved_issues>
</conversation_summary>
