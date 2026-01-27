# Supabase Cron Jobs Setup Guide

This guide explains how to configure Supabase Cron Jobs for the intelligent match synchronization system.

## Overview

The system uses two separate cron jobs:

1. **Daily Sync**: Fetches all Champions League fixtures once per day (full season sync)
2. **Live Sync**: Checks for live matches every 5 minutes with intelligent pre-check to minimize API calls

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Supabase Cron (pg_cron extension)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Daily Job (0 2 * * *)                                      │
│  └─> POST /api/cron/sync?type=daily                         │
│      └─> Syncs all fixtures for the season                  │
│                                                               │
│  Live Job (*/5 * * * *)                                     │
│  └─> POST /api/cron/sync?type=live                          │
│      └─> Pre-check DB for matches in live window           │
│          └─> If matches found: Call API and update          │
│          └─> If no matches: Skip (0 API calls)              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Steps

### Prerequisites

1. Access to Supabase Dashboard
2. Your application deployed with public URL
3. `CRON_SECRET` environment variable configured in both:
   - Supabase project settings (for cron jobs)
   - Application environment variables (for authentication)

### Step 1: Access Supabase Cron Jobs

1. Log in to your Supabase project dashboard
2. Navigate to **Database** → **Cron Jobs** (in the left sidebar)
3. Click **Create a new cron job**

### Step 2: Create Daily Sync Cron Job

**Job Configuration:**

- **Name**: `daily-matches-sync`
- **Schedule**: `0 2 * * *` (runs daily at 2:00 AM UTC)
- **SQL Command**:

```sql
SELECT net.http_post(
  url := 'https://your-domain.com/api/cron/sync?type=daily',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_CRON_SECRET'
  )
) AS request_id;
```

**Important**: Replace the following placeholders:

- `your-domain.com` → Your actual application domain
- `YOUR_CRON_SECRET` → Your actual CRON_SECRET value from environment variables

**Purpose**: Fetches all Champions League fixtures for the season and updates the database. This ensures new matches are added and existing matches stay in sync.

### Step 3: Create Live Sync Cron Job

**Job Configuration:**

- **Name**: `live-matches-sync`
- **Schedule**: `*/5 * * * *` (runs every 5 minutes)
- **SQL Command**:

```sql
SELECT net.http_post(
  url := 'https://your-domain.com/api/cron/sync?type=live',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_CRON_SECRET'
  )
) AS request_id;
```

**Important**: Replace the same placeholders as above.

**Purpose**: Implements intelligent live match updates:

1. Checks database for matches in live window (kickoff_time ±30-180 minutes)
2. Only calls external API if matches are found
3. Updates scores and recalculates points in real-time

### Step 4: Verify Cron Jobs

After creating both jobs, verify they appear in the Cron Jobs list:

```
Name                  Schedule        Active
────────────────────────────────────────────
daily-matches-sync    0 2 * * *       ✓
live-matches-sync     */5 * * * *     ✓
```

## Cron Schedule Explanation

### Daily Sync: `0 2 * * *`

- Minute: 0 (top of the hour)
- Hour: 2 (2:00 AM UTC)
- Day of Month: \* (every day)
- Month: \* (every month)
- Day of Week: \* (every day of week)

### Live Sync: `*/5 * * * *`

- Minute: \*/5 (every 5 minutes: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
- Hour: \* (every hour)
- Day of Month: \* (every day)
- Month: \* (every month)
- Day of Week: \* (every day of week)

## Testing Cron Jobs

### Test Daily Sync

```bash
curl -X POST https://your-domain.com/api/cron/sync?type=daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Response** (when successful):

```json
{
  "success": true,
  "result": {
    "synced": 10,
    "updated": 15
  }
}
```

### Test Live Sync (No Matches)

```bash
curl -X POST https://your-domain.com/api/cron/sync?type=live \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Response** (when no matches in live window):

```json
{
  "success": true,
  "result": {
    "updated": 0,
    "apiCallMade": false,
    "skipped": true,
    "reason": "No matches in live window (kickoff_time ±30-180 min)"
  }
}
```

**Expected Response** (when matches are live):

```json
{
  "success": true,
  "result": {
    "updated": 2,
    "apiCallMade": true
  }
}
```

## Monitoring

### Check Cron Job Execution History

In Supabase Dashboard:

1. Go to **Database** → **Cron Jobs**
2. Click on a job name to see execution history
3. Check for errors or failed executions

### Monitor API Usage

The intelligent pre-check system minimizes API calls:

**Without intelligent pre-check** (naive approach):

- 288 calls/day (every 5 minutes) × 365 days = 105,120 calls/year ❌

**With intelligent pre-check** (smart approach):

- Daily sync: ~365 calls/year
- Live sync: ~9,360 calls/season (only during match windows)
- **Total**: ~27 calls/day on average ✅

This keeps you well under the 7,000 calls/day API limit.

## Troubleshooting

### Cron Job Not Running

1. **Check Active Status**: Ensure the cron job is marked as "Active" in the dashboard
2. **Verify Schedule**: Confirm the cron schedule syntax is correct
3. **Check Execution History**: Look for error messages in the execution log

### Authentication Errors (401 Unauthorized)

1. **Verify CRON_SECRET**: Ensure it matches in both:
   - Supabase cron job SQL command
   - Application environment variables
2. **Check Authorization Header**: Format should be `Bearer YOUR_CRON_SECRET`

### No Matches Being Updated

1. **Test Endpoint Manually**: Use curl commands above to test
2. **Check Match Data**: Verify matches exist in database with correct `kickoff_time`
3. **Verify Live Window**: Matches must be within kickoff_time ±30-180 minutes
4. **Check Match Status**: Only matches with status `scheduled` or `live` are checked

### API Rate Limit Exceeded

If you hit the 7,000 calls/day limit:

1. **Review Logs**: Check if live sync is being called unnecessarily
2. **Verify Pre-Check Logic**: Ensure `shouldSyncLiveMatches()` is working correctly
3. **Adjust Live Window**: Consider narrowing the time window (currently ±30-180 min)

## Live Window Configuration

The current live window is configured in `matchSyncService.ts`:

```typescript
const windowStart = new Date(now.getTime() - 30 * 60 * 1000); // -30 minutes
const windowEnd = new Date(now.getTime() + 180 * 60 * 1000); // +180 minutes
```

**Rationale**:

- **-30 minutes**: Catches matches that start slightly early
- **+180 minutes**: Covers regular match (90 min) + extra time (30 min) + penalties (30 min) + buffer (30 min)

To adjust the window, modify these values in `MatchSyncService.shouldSyncLiveMatches()`.

## Security Notes

1. **CRON_SECRET**: Never commit this value to version control
2. **Service Role Key**: The endpoint uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for sync operations
3. **Authorization**: The endpoint validates the `Authorization` header on every request
4. **HTTPS Only**: Always use HTTPS for production cron job URLs

## Disabling/Enabling Cron Jobs

### Temporarily Disable Live Sync

If you need to pause live updates (e.g., during off-season):

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Find `live-matches-sync`
3. Toggle the "Active" switch to OFF

The daily sync will continue to keep the database updated with fixture information.

### Re-enable Live Sync

When matches resume:

1. Toggle the "Active" switch to ON
2. Verify the schedule is still `*/5 * * * *`

## Additional Resources

- [Supabase Cron Jobs Documentation](https://supabase.com/docs/guides/database/cron-jobs)
- [pg_cron Extension Documentation](https://github.com/citusdata/pg_cron)
- [Crontab Guru](https://crontab.guru/) - Cron schedule expression validator
