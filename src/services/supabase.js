/**
 * Supabase Client Initialization
 * 
 * This file sets up the Supabase client for authentication and API calls.
 * 
 * CONFIGURATION:
 * - Uses environment variables for Supabase URL and publishable anon key
 * - Auto-refresh tokens enabled by default
 * - Session persisted to localStorage automatically
 * - Handles OAuth redirects at /auth/callback
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - REACT_APP_SUPABASE_URL: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
 * - REACT_APP_SUPABASE_ANON_KEY: Your Supabase publishable/anon key
 * 
 * SECURITY NOTE:
 * - The anon key is safe to expose in client-side code
 * - Row Level Security (RLS) policies should be configured in Supabase
 * - Use service role key only on backend/server-side code
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Required: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY');
}

/**
 * Supabase client instance
 * 
 * Features:
 * - Automatic token refresh
 * - Session persistence via localStorage
 * - OAuth redirect handling
 * - Real-time subscriptions (if needed)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh access tokens before they expire
    autoRefreshToken: true,
    
    // Persist session to localStorage (survives page reloads)
    persistSession: true,
    
    // Detect session from URL parameters after OAuth redirect
    detectSessionInUrl: true,
    
    // Storage key for localStorage (default: 'sb-<project-ref>-auth-token')
    // storageKey: 'habit-tracker-auth',
  },
});

export default supabase;
