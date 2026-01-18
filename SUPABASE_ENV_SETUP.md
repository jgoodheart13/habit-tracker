# Supabase Authentication - Environment Variables

## Required Environment Variables

Add these to your `.local.env`, `.dev.env`, `.qa.env`, and `.prod.env` files:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Where to Find These Values

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **Project API keys** → `anon` `public` → `REACT_APP_SUPABASE_ANON_KEY`

## ⚠️ Remove Old Auth0 Variables

Delete these from all environment files:

```env
# ❌ REMOVE THESE
REACT_APP_AUTH0_DOMAIN=...
REACT_APP_AUTH0_CLIENT_ID=...
REACT_APP_AUTH0_AUDIENCE=...
```

## Example Configuration

### .local.env (Local Development)
```env
# Backend API
REACT_APP_API_BASE_URL=http://localhost:8080

# Supabase
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### .dev.env (Development Environment)
```env
# Backend API
REACT_APP_API_BASE_URL=https://dev-api.your-domain.com

# Supabase
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### .qa.env (QA Environment)
```env
# Backend API
REACT_APP_API_BASE_URL=https://qa-api.your-domain.com

# Supabase
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### .prod.env (Production)
```env
# Backend API
REACT_APP_API_BASE_URL=https://api.your-domain.com

# Supabase
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Supabase Dashboard Configuration

### 1. Enable Google OAuth Provider

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret

### 2. Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add **Redirect URLs** for each environment:

```
http://localhost:3000/auth/callback
https://dev.your-domain.com/auth/callback
https://qa.your-domain.com/auth/callback
https://your-domain.com/auth/callback
```

### 3. Configure Site URL (Optional)

Set your production URL as the **Site URL**:
```
https://your-domain.com
```

## Security Notes

- ✅ `REACT_APP_SUPABASE_ANON_KEY` is safe to expose in client-side code
- ✅ Row Level Security (RLS) policies protect your data
- ❌ Never expose service role key in frontend
- ✅ The anon key respects RLS policies configured in Supabase

## Testing

After configuring environment variables:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local development:**
   ```bash
   npm run start:local
   ```

3. **Test authentication:**
   - App should redirect to Google OAuth
   - After sign-in, should redirect to `/auth/callback`
   - Then redirect to home page with authenticated state

## Troubleshooting

### Issue: "Missing Supabase environment variables!"

**Solution:** Ensure both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in your `.local.env` file.

### Issue: "Invalid API key"

**Solution:** 
1. Verify you're using the **anon/public** key, not the service role key
2. Copy the key exactly from Supabase Dashboard
3. Restart your development server after changing `.env` files

### Issue: Authentication redirects to wrong URL

**Solution:** Add the correct callback URL to Supabase Dashboard → Authentication → URL Configuration

### Issue: OAuth error after Google sign-in

**Solution:** Verify Google OAuth credentials in Supabase Dashboard → Authentication → Providers → Google
