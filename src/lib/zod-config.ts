import { z } from "zod";

/**
 * Zod v4 ships an opt-in JIT compiler: the first time a schema validates, it
 * feature-detects whether `new Function(...)` is usable by calling
 * `Function("")` once, inside a try/catch, and falls back to its normal
 * interpreted validator if that throws.
 *
 * Under this app's CSP (no `unsafe-eval`), that probe throws — correctly,
 * that's the point of the policy — but Chrome reports the *attempt* itself as
 * a `script-src` violation regardless of whether the exception is caught.
 * That shows up in the browser as a real `securitypolicyviolation` event on
 * every page that builds a client-side Zod schema (the enquiry and admin
 * login forms), even though nothing is actually broken: the fallback path
 * runs the exact same validation the server already uses everywhere.
 *
 * Zod ships an explicit opt-out for exactly this (upstream regression
 * #4461 / #5414, fixed by short-circuiting the probe when this is set):
 * `z.config({ jitless: true })`. It writes to a global shared across every
 * copy of Zod in the module graph, so setting it once is enough — but the
 * underlying check is memoised on first access, so this must run before any
 * schema is built or validated, which is why every client entry point that
 * constructs a Zod schema imports this module first, for its side effect
 * only.
 *
 * No behavioural change: this only ever disables an opportunistic
 * performance path that CSP was already silently forcing off.
 */
z.config({ jitless: true });
