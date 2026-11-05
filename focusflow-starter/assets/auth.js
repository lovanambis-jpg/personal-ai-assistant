/* FocusFlow auth layer (Supabase Auth, Google sign-in only).
 * Local-first: the app works fully without signing in. If the config is empty or the
 * SDK cannot be loaded (offline), status becomes "unconfigured" / "unavailable" and nothing breaks.
 */
(function () {
  "use strict";
  // Pinned version, loaded on demand so that offline use is never blocked by it.
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  const listeners = new Set();
  let client = null, user = null, status = "unconfigured"; // unconfigured | loading | ready | unavailable

  const cfg = () => window.FOCUSFLOW_CONFIG || {};
  function isConfigured() {
    const c = cfg();
    if (!c.supabaseUrl || !c.supabaseKey) return false;
    try {
      const u = new URL(c.supabaseUrl);
      return u.protocol === "https:" || u.hostname === "localhost" || u.hostname === "127.0.0.1";
    } catch (e) { return false; }
  }
  function emit() { listeners.forEach((fn) => { try { fn({ status, user }); } catch (e) { console.error(e); } }); }
  function setStatus(s) { status = s; emit(); }

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      const timer = setTimeout(() => { el.remove(); reject(new Error("Supabase SDK timed out")); }, 10000);
      el.src = SDK_URL; el.async = true; el.crossOrigin = "anonymous";
      el.onload = () => { clearTimeout(timer); window.supabase && window.supabase.createClient ? resolve() : reject(new Error("Supabase SDK missing")); };
      el.onerror = () => { clearTimeout(timer); reject(new Error("Could not load Supabase SDK")); };
      document.head.appendChild(el);
    });
  }

  async function init() {
    if (!isConfigured()) { setStatus("unconfigured"); return; }
    setStatus("loading");
    try {
      await loadSdk();
      const c = cfg();
      client = window.supabase.createClient(c.supabaseUrl, c.supabaseKey, {
        auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await client.auth.getSession();
      user = (data && data.session && data.session.user) || null;
      // Keep this callback synchronous: calling other Supabase methods inside it can deadlock.
      client.auth.onAuthStateChange((_event, session) => { user = (session && session.user) || null; emit(); });
      setStatus("ready");
    } catch (e) {
      console.warn("Cloud login unavailable:", e);
      client = null; user = null;
      setStatus("unavailable");
    }
  }

  async function signInWithGoogle() {
    if (!client) throw new Error("Cloud login is not available");
    // Must be listed under Authentication -> URL Configuration -> Redirect URLs in Supabase.
    const redirectTo = location.origin + location.pathname;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } }
    });
    if (error) throw error;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut({ scope: "local" }); // this device only; local data is kept
    if (error) throw error;
  }

  function profile() {
    if (!user) return null;
    const m = user.user_metadata || {};
    const avatar = String(m.avatar_url || m.picture || "");
    return {
      id: user.id,
      email: user.email || "",
      name: String(m.full_name || m.name || "").trim(),
      avatar: /^https:\/\//i.test(avatar) ? avatar : ""
    };
  }

  window.FocusAuth = {
    init, signInWithGoogle, signOut, profile,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get user() { return user; },
    get status() { return status; }
  };
})();
