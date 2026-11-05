# Setting up Google sign-in (Supabase)

FocusFlow works without any of this (local-only mode). Do these steps only when you want the "Continue with Google" button to work.

## 1. Create the Supabase project and database
1. Create a project at supabase.com.
2. Open **SQL Editor** and run, in this order, the contents of:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_foundation_helpers.sql`
   - `supabase/migrations/0003_rls_policies.sql`
3. (Recommended) Run `supabase/tests/rls_smoke_test.sql`. It runs in a transaction that is rolled back; the last result should say `RLS smoke test passed`.

## 2. Create Google OAuth credentials
1. Open Google Cloud Console and create (or pick) a project.
2. Configure the **OAuth consent screen** (app name, support email). The default scopes (email, profile, openid) are enough.
3. Go to **Credentials -> Create credentials -> OAuth client ID -> Web application**.
4. Under **Authorized redirect URIs** add the callback URL that Supabase shows on its Google provider page. It looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`.
5. Copy the **Client ID** and **Client secret**.

## 3. Enable Google in Supabase
1. Supabase Dashboard -> **Authentication -> Providers -> Google**: enable it and paste the Client ID and Client secret.
2. **Authentication -> URL Configuration**:
   - Set **Site URL** to your deployed address (for example your Cloudflare Pages URL).
   - Under **Redirect URLs** add every address where the app runs, with a wildcard, for example:
     - `https://your-app.pages.dev/**`
     - `http://localhost:5500/**` and `http://127.0.0.1:5500/**` (VS Code Live Server)
     - `http://localhost:8000/**` (python http.server)
   The app redirects back to the page you started from, so that page must match this list.

## 4. Put the project keys in the app
Open `assets/config.js` and fill in:
- `supabaseUrl`: Project Settings -> API -> Project URL
- `supabaseKey`: the **publishable** key (`sb_publishable_...`) or the legacy **anon** key

Never paste a `secret` or `service_role` key into this file. The publishable/anon key is meant to be public; your data is protected by the RLS policies from step 1.

## 5. Try it
Reload the app (hard refresh), click the avatar at the top right, then **Continue with Google**.

## Troubleshooting
- **redirect_uri_mismatch** (Google error page): the redirect URI in Google Cloud must be exactly the Supabase callback URL from step 2.4.
- **Redirected back but not signed in / lands on the Site URL**: the address you started from is not in Supabase **Redirect URLs** (step 3.2).
- **Button is greyed out**: check the hint text under it. "not set up" means `assets/config.js` is empty; "could not reach" means the Supabase SDK could not be downloaded (offline or blocked).
- **Old behaviour after editing files**: Application tab -> Service Workers -> Unregister, then hard refresh.
