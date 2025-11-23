#!/usr/bin/env node
// Simple diagnostics: register temp user, call protected + list endpoints.
const base = process.env.API_BASE || 'http://localhost:3002';
const rand = Date.now();
const email = `diag${rand}@example.com`;
const password = 'Test123!';
(async () => {
  const out = {};
  async function req(path, init) {
    const url = base + path;
    const started = Date.now();
    let res;
    try {
      res = await fetch(url, init);
    } catch (e) {
      return { error: e.message, url, tookMs: Date.now() - started };
    }
    const tookMs = Date.now() - started;
    let bodyText = await res.text();
    let body;
    try { body = JSON.parse(bodyText); } catch { body = bodyText; }
    return { status: res.status, ok: res.ok, url, body, tookMs };
  }
  out.health = await req('/health');
  out.register = await req('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, username: 'diaguser' }) });
  let token = out.register.body && out.register.body.token;
  if (!token && out.register.status === 400) {
    // Try login if register rejected (maybe username collision only?)
    out.login = await req('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    token = out.login.body && out.login.body.token;
  }
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  out.me = await req('/api/auth/me', { headers: authHeader });
  out.tournaments = await req('/api/tournaments');
  out.teams = await req('/api/teams');
  out.notifications = await req('/api/notifications', { headers: authHeader });
  // Summarize
  const summary = Object.fromEntries(Object.entries(out).map(([k,v]) => [k, { status: v.status, ok: v.ok, tookMs: v.tookMs, keys: v.body && typeof v.body === 'object' && !Array.isArray(v.body) ? Object.keys(v.body) : undefined, count: Array.isArray(v.body) ? v.body.length : undefined }]));
  console.log('DIAG_SUMMARY', JSON.stringify(summary, null, 2));
  if (token) console.log('Token prefix:', token.slice(0,25)+'...');
})();
