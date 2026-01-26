# Authentication System - Testing Guide

## Prerequisites
- Dev server running: `npm run dev`
- Supabase local instance or connection configured in `.env`
- Browser with JavaScript enabled

## Test Scenarios

### 1. User Registration

#### Test Case: Successful Registration
**Steps:**
1. Navigate to http://localhost:3000/auth/register
2. Fill in the form:
   - Email: `testuser@example.com`
   - Nickname: `testuser123` (3-15 alphanumeric)
   - Password: `password123` (min 8 characters)
   - Confirm Password: `password123`
3. Click "Create account"

**Expected Result:**
- ✅ Form submits successfully
- ✅ User is redirected to `/dashboard`
- ✅ Navigation shows nickname "testuser123"
- ✅ "Sign out" button visible
- ✅ User can place bets on matches

#### Test Case: Duplicate Nickname
**Steps:**
1. Register first user with nickname "alice123"
2. Try to register second user with same nickname "alice123"

**Expected Result:**
- ❌ Error message: "Nickname already taken"
- ❌ User remains on registration page

#### Test Case: Invalid Nickname Format
**Steps:**
1. Navigate to `/auth/register`
2. Try nickname "ab" (too short)

**Expected Result:**
- ❌ Error message: "Nickname must be 3-15 characters"

**Steps:**
1. Try nickname "test user" (contains space)

**Expected Result:**
- ❌ HTML5 validation: Pattern mismatch (alphanumeric only)

#### Test Case: Password Mismatch
**Steps:**
1. Enter password: "password123"
2. Enter confirm password: "different456"
3. Click "Create account"

**Expected Result:**
- ❌ Error message: "Passwords do not match"

### 2. User Login

#### Test Case: Successful Login
**Steps:**
1. Navigate to http://localhost:3000/auth/login
2. Fill in credentials:
   - Email: `testuser@example.com`
   - Password: `password123`
3. Click "Sign in"

**Expected Result:**
- ✅ User is redirected to `/dashboard`
- ✅ Navigation shows user nickname
- ✅ User can access protected routes

#### Test Case: Invalid Credentials
**Steps:**
1. Navigate to `/auth/login`
2. Enter incorrect email or password
3. Click "Sign in"

**Expected Result:**
- ❌ Error message: "Invalid credentials"
- ❌ User remains on login page

#### Test Case: Already Logged In
**Steps:**
1. Login successfully
2. Try to navigate to `/auth/login` directly

**Expected Result:**
- ✅ Automatically redirected to `/dashboard`

### 3. Password Recovery

#### Test Case: Request Reset
**Steps:**
1. Navigate to http://localhost:3000/auth/recovery
2. Enter email: `testuser@example.com`
3. Click "Send reset link"

**Expected Result:**
- ✅ Success message displayed
- ✅ "Check your email" message shown
- ⚠️ Email sent (requires Supabase email config)

#### Test Case: Reset Password
**Steps:**
1. Click recovery link from email
2. Should land on `/auth/reset-password`
3. Enter new password (min 8 chars)
4. Confirm new password
5. Click "Update password"

**Expected Result:**
- ✅ Success message: "Password updated"
- ✅ Can click "Continue to sign in"
- ✅ Can login with new password

### 4. Logout

#### Test Case: Desktop Logout
**Steps:**
1. Login successfully
2. Click on user icon/nickname in top right
3. Click "Sign out"

**Expected Result:**
- ✅ Cookies cleared
- ✅ Redirected to `/dashboard`
- ✅ Navigation shows "Sign in" button
- ✅ Cannot access protected routes

#### Test Case: Mobile Logout
**Steps:**
1. Login successfully
2. Resize browser to mobile width
3. Click "Profile" in bottom navigation
4. Click "Sign out"

**Expected Result:**
- ✅ Same as desktop logout

### 5. Protected Routes

#### Test Case: Leaderboard Access
**As Guest:**
1. Navigate to http://localhost:3000/leaderboard

**Expected Result:**
- ✅ Redirected to `/auth/login`

**As Authenticated User:**
1. Login first
2. Navigate to `/leaderboard`

**Expected Result:**
- ✅ Page loads successfully
- ✅ Leaderboard data displayed

#### Test Case: Match History Access
**As Guest:**
1. Navigate to http://localhost:3000/history

**Expected Result:**
- ✅ Redirected to `/auth/login`

**As Authenticated User:**
1. Login first
2. Navigate to `/history`

**Expected Result:**
- ✅ Page loads successfully
- ✅ History data displayed

### 6. Dashboard Access

#### Test Case: Guest Dashboard
**Steps:**
1. Ensure logged out
2. Navigate to http://localhost:3000/dashboard

**Expected Result:**
- ✅ Page loads successfully
- ✅ Matches displayed
- ✅ No bet input fields visible
- ✅ No previous bets shown
- ✅ "Sign in" button in navigation

#### Test Case: Authenticated Dashboard
**Steps:**
1. Login successfully
2. Navigate to `/dashboard`

**Expected Result:**
- ✅ Page loads successfully
- ✅ Matches displayed
- ✅ Bet input fields visible for upcoming matches
- ✅ Previous bets shown (if any)
- ✅ User nickname in navigation

### 7. Betting Functionality

#### Test Case: Place Bet (Authenticated)
**Steps:**
1. Login successfully
2. Navigate to `/dashboard`
3. Find an upcoming match
4. Enter home score: 2
5. Enter away score: 1
6. Click "Save"

**Expected Result:**
- ✅ Bet saved successfully
- ✅ Input fields show saved values
- ✅ No error messages

#### Test Case: Place Bet (Guest)
**Steps:**
1. Ensure logged out
2. Navigate to `/dashboard`
3. Look for bet input fields

**Expected Result:**
- ✅ No bet input fields visible
- ✅ Cannot place bets

### 8. Navigation UI

#### Test Case: Guest Navigation
**Expected UI:**
- Desktop: "Sign in" button in top right
- Mobile: "Login" item in bottom bar

#### Test Case: User Navigation
**Expected UI:**
- Desktop: User nickname + dropdown with "Sign out"
- Mobile: "Profile" item in bottom bar → dropdown with "Sign out"

#### Test Case: Admin Navigation
**Expected UI:**
- Same as user + "Admin Panel" link in dropdown
- (Admin panel not yet implemented)

## API Endpoint Testing

### Using curl or Postman

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "testuser"
  }'
```

**Expected:** 200 OK with cookies set

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected:** 200 OK with cookies set

#### Access Protected Endpoint
```bash
curl http://localhost:3000/api/matches/history \
  -b cookies.txt
```

**Expected:** 200 OK with history data

#### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**Expected:** 200 OK, cookies cleared

## Common Issues & Solutions

### Issue: "Authentication not yet implemented"
**Solution:** Check if API endpoints are created and middleware is working

### Issue: Redirects don't work
**Solution:** Check browser console for errors, verify Astro.redirect() calls

### Issue: Cookies not being set
**Solution:**
- Check browser dev tools → Application → Cookies
- Verify `httpOnly`, `secure`, `sameSite` settings
- Check if running on HTTPS in production

### Issue: "Nickname already taken" on first registration
**Solution:** Check database - nickname might already exist from seed data

### Issue: Email not sent for password recovery
**Solution:**
- Verify Supabase email configuration
- Check Supabase dashboard → Authentication → Email Templates
- For testing, use recovery link from Supabase logs

### Issue: Session expires quickly
**Solution:**
- Check token expiration settings in Supabase
- Verify `maxAge` in cookie settings

## Database Verification

### Check if user was created
```sql
SELECT * FROM auth.users WHERE email = 'test@example.com';
SELECT * FROM public.profiles WHERE nickname = 'testuser';
SELECT * FROM public.user_groups WHERE user_id = '<profile_id>';
```

### Check if bet was placed
```sql
SELECT * FROM public.bets WHERE user_id = '<profile_id>';
SELECT * FROM public.bet_logs WHERE user_id = '<profile_id>';
```

## Success Criteria

✅ All user stories from US-001 implemented:
- [x] User can register with email, password, nickname
- [x] User can login
- [x] User can logout
- [x] Guest can view dashboard (read-only)
- [x] Authenticated user can place bets
- [x] Protected routes require authentication
- [x] Password recovery works

## Notes

- Registration requires unique email and nickname
- Passwords must be at least 8 characters
- Nicknames must be 3-15 alphanumeric characters
- Sessions persist via HTTP-only cookies
- Guest mode allows viewing matches without betting
- All API endpoints validate authentication where required
