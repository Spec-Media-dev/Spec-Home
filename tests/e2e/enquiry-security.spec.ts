import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Abuse controls on the public enquiry form.
 *
 * There is no CAPTCHA by design. What is left has to be proven properly, so
 * every assertion here checks *persisted database state*, not just the toast
 * the visitor happens to see — a honeypot that shows a fake success looks
 * identical to a real submission from the outside, and that is the point.
 *
 * The blocks are separate `describe.serial` groups on purpose. A failure only
 * skips the rest of its own group, so one broken test can no longer hide
 * whether the others pass — which is exactly what happened when an earlier
 * honeypot failure meant rate limiting was never exercised at all.
 *
 * Rate limiting runs last: it deliberately exhausts the per-IP allowance, and
 * the limiter is in-process, so anything after it would be throttled. Each
 * `npm run test:e2e` starts a fresh server (`reuseExistingServer: false`), so
 * the limiter always begins empty.
 */

// Supabase's dashboard exposes several URLs; the REST one carries a
// `/rest/v1` suffix that supabase-js must not receive — it appends that
// segment itself. Production normalises this in `src/lib/env.ts`; this file
// talks to Supabase directly rather than importing app code, so it repeats
// the same normalisation `tests/integration.test.ts` uses, rather than
// trusting `.env.local` to already be in the right shape. Skipping this was
// the actual defect: an unnormalised `.env.local` value made this file's own
// verification client double up the path (`/rest/v1/rest/v1/...`), which
// PostgREST rejects for a GET (PGRST125) and silently no-counts for a HEAD —
// while the app's own clients, which do normalise, kept working the whole
// time. The fix belongs here, not in application code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  /\/+$/,
  "",
).replace(/\/rest\/v1$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const runId = Date.now();
const emailPrefix = `e2e-enquiry-${runId}`;

const SUCCESS_EN = "Thank you — your enquiry has been sent.";
const RATE_LIMITED_EN = "Too many requests. Please try again in a few minutes.";
const RATE_LIMITED_AR = "طلبات كثيرة جداً. يرجى المحاولة بعد بضع دقائق.";

function serviceClient() {
  expect(
    supabaseUrl && serviceKey,
    "Supabase credentials are required to assert database state",
  ).toBeTruthy();
  return createClient(supabaseUrl!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Rows this run created, and only those. */
async function countEnquiries(pattern: string) {
  const { count, error } = await serviceClient()
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .like("email", pattern);
  expect(error).toBeNull();
  return count ?? 0;
}

async function deleteThisRunsEnquiries() {
  if (!supabaseUrl || !serviceKey) return;
  await serviceClient()
    .from("enquiries")
    .delete()
    .like("email", `${emailPrefix}%`);
}

function submitButton(page: Page, name = "Send enquiry") {
  return page.getByRole("button", { name });
}

async function fillEnquiry(page: Page, email: string, message: string) {
  await page.getByLabel("Full name").fill("TEST/E2E Security Check");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Phone number").fill("+971 50 123 4567");
  await page.getByLabel("Message").fill(message);
  await expect(submitButton(page)).toBeEnabled({ timeout: 20_000 });
}

/**
 * Populates the honeypot the way a scraping bot would: straight through the
 * DOM, ignoring whether a human could ever have focused the field.
 *
 * The native value setter plus a bubbling `input` event is what react-hook-form
 * actually listens for — assigning `.value` alone would leave the library's
 * state empty and the field would arrive at the server blank.
 */
async function populateHoneypot(page: Page, value: string) {
  const honeypot = page.locator("#enquiry-company");
  await honeypot.evaluate((element, text) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(element, text);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);

  // Load-bearing. An earlier version of this suite filled the honeypot in a
  // way that silently failed, so every "honeypot" submission was really a
  // normal one and the trap was never tested. Fail here instead.
  await expect(honeypot).toHaveValue(value);
}

/** The form answers with exactly one of these; waiting for both avoids a
 * 10-second timeout every time the answer is the one we did not expect. */
function outcome(page: Page, ...texts: string[]): Locator {
  const [first, ...rest] = texts.map((text) => page.getByText(text).first());
  return rest.reduce<Locator>((all, next) => all.or(next), first);
}

test.afterAll(deleteThisRunsEnquiries);

test.describe.serial("service-role isolation", () => {
  test("the service key never reaches the browser", async ({ page }) => {
    expect(serviceKey).toBeTruthy();
    const leaked = { value: false };
    const scriptChecks: Promise<void>[] = [];

    page.on("request", (request) => {
      if (request.postData()?.includes(serviceKey!)) leaked.value = true;
    });
    page.on("response", (response) => {
      if (response.request().resourceType() !== "script") return;
      scriptChecks.push(
        response
          .text()
          .then((body) => {
            if (body.includes(serviceKey!)) leaked.value = true;
          })
          .catch(() => undefined),
      );
    });

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(submitButton(page)).toBeEnabled({ timeout: 20_000 });
    await Promise.all(scriptChecks);
    expect(leaked.value).toBe(false);
  });
});

test.describe.serial("honeypot", () => {
  test("a human submission (honeypot empty) stores exactly one lead", async ({
    page,
  }) => {
    const email = `${emailPrefix}-human@example.com`;
    await page.goto("/contact");
    await fillEnquiry(page, email, "TEST/E2E legitimate human submission.");

    // The trap must be present and empty for a real visitor.
    await expect(page.locator("#enquiry-company")).toHaveValue("");

    await submitButton(page).click();
    await expect(outcome(page, SUCCESS_EN)).toBeVisible();

    expect(await countEnquiries(email)).toBe(1);
  });

  test("a bot submission (honeypot filled) stores nothing", async ({ page }) => {
    const email = `${emailPrefix}-bot@example.com`;
    await page.goto("/contact");
    await fillEnquiry(page, email, "TEST/E2E honeypot submission, never stored.");
    await populateHoneypot(page, "Automated Outreach Ltd");

    await submitButton(page).click();

    // The bot is told the same thing a human is told: it must learn nothing.
    await expect(outcome(page, SUCCESS_EN)).toBeVisible();

    // The only assertion that actually matters.
    expect(await countEnquiries(email)).toBe(0);
  });
});

test.describe.serial("submission integrity", () => {
  test("a real double-click stores one lead, escaped, with a server-set status", async ({
    page,
  }) => {
    const email = `${emailPrefix}-double@example.com`;
    const message =
      "TEST/E2E harmless text: <script>window.__e2eXss = true</script>";

    await page.goto("/contact");
    await fillEnquiry(page, email, message);

    // A genuine pointer double-click, not two synthetic events in one tick:
    // the guard exists for what a real user's mouse does.
    await submitButton(page).dblclick({ delay: 50 });
    await expect(outcome(page, SUCCESS_EN)).toBeVisible();

    const { data, error } = await serviceClient()
      .from("enquiries")
      .select("id, message, status")
      .eq("email", email);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    // Stored verbatim as text, and never executed.
    expect(data![0].message).toBe(message);
    expect(data![0].status).toBe("new");
    expect(
      await page.evaluate(
        () => (window as Window & { __e2eXss?: boolean }).__e2eXss,
      ),
    ).toBeUndefined();

    // One outcome, not two stacked toasts.
    await expect(page.getByText(SUCCESS_EN)).toHaveCount(1);

    // The admin inbox renders lead text through React, never as raw HTML.
    const adminDetail = readFileSync(
      "src/app/(admin)/dashboard-admin/(protected)/enquiries/[id]/page.tsx",
      "utf8",
    );
    expect(adminDetail).not.toContain("dangerouslySetInnerHTML");
  });
});

test.describe.serial("rate limiting", () => {
  // Discovers the limit instead of assuming how many slots earlier tests used,
  // so it stays correct if the suite above changes. Bounded so a broken
  // limiter fails fast rather than hammering the server.
  const MAX_ATTEMPTS = 8;

  test("repeated submissions are throttled and stop reaching the database", async ({
    page,
  }) => {
    let accepted = 0;
    let throttled = false;

    for (let attempt = 0; attempt < MAX_ATTEMPTS && !throttled; attempt += 1) {
      await page.goto("/contact");
      await fillEnquiry(
        page,
        `${emailPrefix}-rate-${attempt}@example.com`,
        `TEST/E2E controlled rate-limit submission ${attempt + 1}.`,
      );
      await submitButton(page).click();

      const blocked = page.getByText(RATE_LIMITED_EN).first();
      await expect(outcome(page, SUCCESS_EN, RATE_LIMITED_EN)).toBeVisible();

      if (await blocked.isVisible()) throttled = true;
      else accepted += 1;
    }

    expect(
      throttled,
      `the limiter never engaged within ${MAX_ATTEMPTS} submissions`,
    ).toBe(true);
    expect(accepted, "no submission was accepted at all").toBeGreaterThan(0);

    // Throttled attempts must not have been written.
    expect(await countEnquiries(`${emailPrefix}-rate-%`)).toBe(accepted);
  });

  test("the throttled response is localized, not a raw error", async ({
    page,
  }) => {
    // The allowance is already spent by the test above, on the same IP and
    // inside the same window, so this submission is refused immediately.
    await page.goto("/ar/contact");
    await page.getByLabel("الاسم الكامل").fill("TEST/E2E");
    await page
      .getByLabel("البريد الإلكتروني")
      .fill(`${emailPrefix}-rate-ar@example.com`);
    await page.getByLabel("الرسالة").fill("TEST/E2E رسالة اختبار للحد الأقصى.");

    const arabicSubmit = submitButton(page, "إرسال الاستفسار");
    await expect(arabicSubmit).toBeEnabled({ timeout: 20_000 });
    await arabicSubmit.click();

    await expect(page.getByText(RATE_LIMITED_AR).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/PGRST|supabase|stack/i);

    expect(await countEnquiries(`${emailPrefix}-rate-ar%`)).toBe(0);
  });
});
