# 🚀 Quick Start - Supabase Authentication

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- Google OAuth configured in Supabase Dashboard
- Node.js and npm installed

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs `@supabase/supabase-js` and removes `@auth0/auth0-react`.

---

## Step 2: Configure Environment Variables

Create or update your `.local.env` file:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your existing API configuration
REACT_APP_API_BASE_URL=http://localhost:8080
```

**Get these values from:**
- Supabase Dashboard → Settings → API
  - Project URL → `REACT_APP_SUPABASE_URL`
  - Project API keys → `anon` `public` → `REACT_APP_SUPABASE_ANON_KEY`

---

## Step 3: Configure Supabase Dashboard

### Enable Google Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth Client ID and Secret

### Add Redirect URLs
1. Go to **Authentication** → **URL Configuration**  
2. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   ```
   (Add more for dev/qa/prod environments)

---

## Step 4: Start the App

```bash
npm run start:local
```

---

## Step 5: Test Authentication

1. App should redirect to Google OAuth sign-in
2. Sign in with your Google account
3. After authorization, you'll be redirected back to the app
4. You should see the authenticated app content

---

## Expected Flow

```
1. Open http://localhost:3000
2. → Redirects to Google OAuth
3. → Sign in with Google
4. → Redirects to /auth/callback
5. → Redirects to / (authenticated)
```

---

## Verify It's Working

Open browser DevTools console. You should see:
```
Supabase token set in localStorage
```

Check localStorage:
```javascript
localStorage.getItem('auth_token')
// Should show a JWT token
```

---

## Troubleshooting

### "Missing Supabase environment variables!"
- Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` to `.local.env`
- Restart the dev server

### Infinite redirect loop
- Add callback URL to Supabase Dashboard → Authentication → URL Configuration
- Verify the route `/auth/callback` exists in `AppRouter.js`

### "Invalid API key"
- Use the **anon/public** key, not the service role key
- Copy key exactly from Supabase Dashboard

---

## Test Logout

Navigate to: `http://localhost:3000/logout`

Should:
- Clear session
- Redirect to login screen

---

## Build for Production

```bash
# Development
npm run build:dev

# QA
npm run build:qa

# Production
npm run build:prod
```

---

## Docker Deployment

```bash
# Build with environment-specific configuration
docker build --build-arg BUILD_ENV=prod -t habit-tracker:prod .

# Run
docker run -p 8080:8080 habit-tracker:prod
```

---

## Next Steps

- ✅ Test in all environments (local, dev, qa, prod)
- ✅ Update backend API to verify Supabase tokens
- ✅ Configure environment-specific redirect URLs
- ✅ Update CI/CD pipelines

---

## Documentation

- [SUPABASE_ENV_SETUP.md](SUPABASE_ENV_SETUP.md) - Environment configuration
- [AUTH0_TO_SUPABASE_MIGRATION.md](AUTH0_TO_SUPABASE_MIGRATION.md) - Migration details
- [Supabase Docs](https://supabase.com/docs/guides/auth) - Official documentation

---

**Need Help?** Check inline code comments in:
- `src/services/supabase.js`
- `src/contexts/SupabaseAuthContext.js`
- `src/pages/AuthCallbackPage.js`
