import "@/lib/zod-config";
import { z } from "zod";

/**
 * The configured Zod entry point.
 *
 * Import `z` from here — never directly from `"zod"` — in any module that
 * builds or validates a schema, if that module can end up in a browser
 * bundle. `zod-config` calls `z.config({ jitless: true })` as a side effect;
 * bundling it into this re-export, rather than relying on every call site to
 * separately import it in the right order, is what makes the guarantee hold:
 * whichever client module first constructs a `z.object(...)` pulls this
 * module in as part of that very same import statement, so the config is
 * always applied before the schema exists — no dependency on which chunk a
 * bundler happens to evaluate first.
 *
 * Background: Zod's JIT compiler feature-detects `eval`-like code generation
 * by calling `Function("")` once, inside a try/catch. Under this app's CSP
 * (no `unsafe-eval`) that throws, as intended, but the browser reports the
 * *attempt* as a `script-src` violation regardless of the catch. `jitless`
 * (an official Zod option, upstream regression #4461 / #5414) skips the
 * probe outright — schemas still validate correctly, just through Zod's
 * normal interpreted path, the only path the server ever used anyway.
 */
export { z };
