1. For the MVP all registered users belong to one group. We keep it simple and can follow the your reccomendation.
2. By simple scoring system we should follow these rules:

- we take only the result from the basic match time, no extra time, no penalties
- exact match result - 4 points
- correctly predicted a winner - 1 point
- correclty predicted a score difference or draw - 2 points
- incorrectly predicted - 0 points

3. We are using an API from https://www.api-football.com/ with a free tier which allows 100 requests per day
4. WE should use third party authentication providers as a main authentication method (google, facebook, apple, etc.)
5. I'd like to follow your reccomendation and allow real-time updates of the scores and results.
6. To avoid errors we should block betting 5 minutes before the match starts and provide the countdown timer for each match
7. We don't have strict design requirements, so we should use a simple and clean design.
8. We follow your reccomendation and use responsive web application approach.
9. Previous matches should be available for review after the match is over. Previous matches should not be visible by default but available to be displayed by clicking a button.
   10.I'd like to follow your reccomendation and provide a user-fiendly message explaining the situation.

10. As you proposed: rules hsould be mutually exclusive. Exact match = 4 points; if not, then Correct score difference/draw = 2 points; if not, then Correct winner = 1 point.
11. Once a day we should get info regarding upcoming matches. If possible as you suggested we should be getting info for all the simultaneous matches in one call. When the match is over we should not request additional data for it. To keep it simple we can go with updating the data every 10 minutes after the match is started.
12. Update every 10 minutes is acceptable.
13. As you reccomend registration should be possible via direct link
14. As you reccomend main rule is the total points then number of "exact score predictions" otherwise a tie.
15. Following your reccomendation : A comprehensive history view should show the match details (teams and final score), the user's submitted prediction, and a clear breakdown of the points they were awarded for that specific match. This transparency helps users understand the scoring.
16. Let's use the nickname/username during registration
17. Let's follow the material design approach
18. No notifiactions for the MVP
19. Following your reccomendation let's have a simple admin page that allows to manually update match result and recalculate the points for the users.

20. If the limit is reached as you suggest the live updates should be stopped and the user should be informed that the limit is reached. This should not happen because the amount of matches for a given day is known and the frequency of updates can be planned in advance. If however the amount of reads exceeds 90 per day as you suggest the infomration should be displayed to a user that "Live updates are temporarily paused to manage API limits. Final scores will be updated after the matches."
21. We will follow your reccomendation and the admin role will be assigned by a developer directly in the database.
22. Yes, this process should be fully automated. The admin's only action should be to submit the correct score. The system should then automatically trigger a background job to re-evaluate points for every user's bet on that match and update the leaderboard accordingly.
23. Yes, nicknames must be unique to avoid confusion on the leaderboard. We should enforce simple validation rules, such as requiring 3-15 alphanumeric characters (letters and numbers only).
24. If there are no matches planned we should display a message that "No matches planned. Pleasecheck back later." Otherwise display the next available matches with a clearly stated date and time.
25. To prevent confusion, all match times and deadlines should be automatically converted and displayed in each user's local time zone, based on their browser/device settings.
26. Absolutely. Users should be able to edit and re-submit their score prediction for any given match as many times as they wish up until the betting window closes. The last prediction saved will be considered their final bet.
27. We can start with a standard light mode theme using the default Material Design blue as the primary accent color. This provides a clean and familiar look and can be easily customized later.
28. We should design the database schema with the future in mind. By including a group_id column in tables related to users and bets, we can assign everyone to a single, default group for the MVP. This simple step will make implementing multi-group functionality vastly easier in a future release.
29. For the MVP, the admin page should be minimal but functional. It should display a list of recent and ongoing matches. For each match, the admin should be able to see the current score from the API and have an input field to override it. A "save and recalculate" button would then trigger the update.

30. For the MVP, the simplest approach is to retain all data indefinitely. This avoids the complexity of creating archival or deletion processes, which can be defined in a later version.
31. Including a simple Privacy Policy is highly recommended. It is a standard practice, builds user trust, and is often a prerequisite for using third-party authentication services.
32. For the MVP, we should implement robust server-side logging to capture all critical errors. This will be invaluable for diagnosing and fixing bugs quickly after launch.
33. No.
34. Use popular hosting platform like Cloudflare or Azure
35. It's not important right now
36. Api should provide names in one language. Let's use default values or English if more are available.
37. To streamline development and testing, we should focus on supporting the latest stable versions of the most common web browsers: Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.
38. For the MVP it is not required
39. Yes please, create a document
