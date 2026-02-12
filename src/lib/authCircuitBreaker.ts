/**
 * Auth Circuit Breaker
 *
 * Intercepts refresh-token requests to:
 *  1. Cap each request at ~10 s (abort + timeout error).
 *  2. Track failures (522 / network error / timeout).
 *  3. If 2 failures within 10 min → open the breaker for 15 min.
 *  4. While open: block refresh calls, clear the stale session from
 *     localStorage, and surface a flag so the UI can show
 *     "Auth temporarily unavailable".
 *
 * State is persisted in localStorage so it survives page reloads.
 */

const STORAGE_KEY = "auth_circuit_breaker";
const FAILURE_WINDOW_MS = 10 * 60 * 1000;   // 10 min
const COOLDOWN_MS = 15 * 60 * 1000;          // 15 min
const MAX_FAILURES = 2;
const REFRESH_TIMEOUT_MS = 10_000;            // 10 s cap

// ── Persisted state ────────────────────────────────────────────────
interface BreakerState {
  failures: number[];   // timestamps of recent failures
  openUntil: number;    // epoch ms – 0 when closed
}

function load(): BreakerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BreakerState;
  } catch { /* ignore corrupt data */ }
  return { failures: [], openUntil: 0 };
}

function save(s: BreakerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota exceeded – best-effort */ }
}

// ── Public helpers ─────────────────────────────────────────────────

/** Is the breaker currently open? */
export function isBreakerOpen(): boolean {
  const s = load();
  if (s.openUntil && Date.now() < s.openUntil) return true;
  // Auto-close if cooldown elapsed
  if (s.openUntil && Date.now() >= s.openUntil) {
    save({ failures: [], openUntil: 0 });
  }
  return false;
}

/** Manually reset (e.g. after a successful login). */
export function resetBreaker() {
  save({ failures: [], openUntil: 0 });
}

/** Record a refresh failure. Returns true if breaker just tripped. */
function recordFailure(): boolean {
  const now = Date.now();
  const s = load();
  // Prune old failures outside window
  s.failures = s.failures.filter((t) => now - t < FAILURE_WINDOW_MS);
  s.failures.push(now);
  if (s.failures.length >= MAX_FAILURES) {
    s.openUntil = now + COOLDOWN_MS;
    s.failures = [];
    save(s);
    return true;
  }
  save(s);
  return false;
}

/** Clear session tokens from localStorage so the UI falls back to login. */
function clearStaleSession() {
  // Supabase stores the session under a key that starts with
  // "sb-" and ends with "-auth-token".
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
      localStorage.removeItem(key);
    }
  }
}

// ── Change listeners (so React can subscribe) ──────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();
export function onBreakerChange(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function notifyListeners() {
  listeners.forEach((fn) => fn());
}

// ── Fetch interceptor ──────────────────────────────────────────────
const _originalFetch = window.fetch.bind(window);

function isRefreshRequest(input: RequestInfo | URL): boolean {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
  return url.includes("/auth/v1/token") && url.includes("grant_type=refresh_token");
}

window.fetch = async function patchedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (!isRefreshRequest(input)) {
    return _originalFetch(input, init);
  }

  // ── Breaker open → short-circuit immediately ──
  if (isBreakerOpen()) {
    return new Response(
      JSON.stringify({ error: "circuit_breaker_open", error_description: "Auth refresh paused – circuit breaker open" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── 10 s timeout wrapper ──
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  // Merge abort signals
  const mergedInit: RequestInit = { ...init, signal: controller.signal };

  try {
    const res = await _originalFetch(input, mergedInit);
    clearTimeout(timeout);

    if (res.status === 522 || res.status >= 500) {
      const tripped = recordFailure();
      if (tripped) {
        clearStaleSession();
        notifyListeners();
      }
    } else if (res.ok) {
      // Successful refresh → reset failure count
      const s = load();
      if (s.failures.length > 0) {
        save({ failures: [], openUntil: 0 });
      }
    }
    return res;
  } catch (err: unknown) {
    clearTimeout(timeout);
    // Network error / abort / timeout
    const tripped = recordFailure();
    if (tripped) {
      clearStaleSession();
      notifyListeners();
    }
    // Return a synthetic 503 so Supabase SDK doesn't hang or tight-loop
    return new Response(
      JSON.stringify({ error: "refresh_failed", error_description: String(err) }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
};
