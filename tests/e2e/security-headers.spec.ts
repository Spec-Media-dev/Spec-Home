import { expect, test, type Page } from "@playwright/test";

/**
 * Security headers, and whether the Content-Security-Policy is safe to enforce.
 *
 * The full policy currently ships as `Content-Security-Policy-Report-Only`
 * while only `frame-ancestors 'none'` is enforced. Report-Only still fires
 * `securitypolicyviolation` in the browser, so the second block below is a
 * real gate rather than a formality: if it passes, nothing on these pages
 * violates the policy and it can be promoted to enforced by moving one line in
 * `next.config.ts`. If it fails, the violation names the exact directive.
 */

const PUBLIC_ROUTES = ["/", "/about", "/contact", "/projects", "/properties"];

type ViolationRecord = {
  directive: string;
  blockedURI: string;
  disposition: string;
};

declare global {
  interface Window {
    __cspViolations?: ViolationRecord[];
  }
}

async function collectCspViolations(page: Page) {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations?.push({
        directive: event.effectiveDirective || event.violatedDirective,
        blockedURI: event.blockedURI,
        disposition: event.disposition,
      });
    });
  });
}

test.describe("security headers", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} carries the expected security headers`, async ({
      request,
    }) => {
      const response = await request.get(route);
      expect(response.status()).toBe(200);
      const headers = response.headers();

      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

      // Clickjacking, stated twice on purpose (legacy header + CSP) and
      // required to agree.
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["content-security-policy"]).toContain(
        "frame-ancestors 'none'",
      );

      const permissions = headers["permissions-policy"] ?? "";
      for (const capability of ["camera", "microphone", "geolocation"]) {
        expect(permissions, `${capability} must be denied`).toContain(
          `${capability}=()`,
        );
      }

      // Semantic checks on the candidate policy, not a brittle full-string
      // comparison: directive order is irrelevant to the browser.
      const reportOnly = headers["content-security-policy-report-only"] ?? "";
      for (const directive of [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ]) {
        expect(reportOnly).toContain(directive);
      }
      // Whatever else the policy allows, it must never allow eval.
      expect(reportOnly).not.toContain("unsafe-eval");
    });
  }

  test("HSTS is present in a production build, without preload or subdomains", async ({
    request,
  }) => {
    // `npm run test:e2e` serves a production build (`npm start`), so the
    // production-only header must be here. Browsers ignore HSTS over plain
    // HTTP, so asserting it locally is safe.
    const headers = (await request.get("/")).headers();
    const hsts = headers["strict-transport-security"];

    expect(hsts, "HSTS must be set on a production build").toBeTruthy();
    expect(hsts).toContain("max-age=");
    // Neither has been approved against the real domain; both are hard to undo.
    expect(hsts).not.toContain("preload");
    expect(hsts).not.toContain("includeSubDomains");
  });
});

test.describe("CSP does not break the running application", () => {
  for (const { path, lang } of [
    { path: "/", lang: "en" },
    { path: "/ar", lang: "ar" },
    { path: "/about", lang: "en" },
    { path: "/ar/about", lang: "ar" },
    { path: "/contact", lang: "en" },
    { path: "/ar/contact", lang: "ar" },
  ]) {
    for (const theme of ["light", "dark"] as const) {
      test(`${path} renders clean under the policy in ${theme}`, async ({
        page,
      }) => {
        const consoleErrors: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => consoleErrors.push(error.message));

        await collectCspViolations(page);
        await page.addInitScript((selected) => {
          window.localStorage.setItem("theme", selected);
        }, theme);

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);

        // The theme script is inline and runs before paint — if the policy
        // blocked it, the class would never be applied.
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        await expect(page.locator("html")).toHaveAttribute("lang", lang);

        // Hydration completed: an interactive control responds.
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("header")).toBeVisible();
        await expect(page.locator("footer")).toBeVisible();

        // JSON-LD is an inline script too.
        expect(
          await page.locator('script[type="application/ld+json"]').count(),
        ).toBeGreaterThan(0);

        const violations = (await page.evaluate(
          () => window.__cspViolations ?? [],
        )) as ViolationRecord[];

        expect(
          violations,
          `CSP violations on ${path} (${theme}): ${JSON.stringify(violations, null, 2)}`,
        ).toEqual([]);

        expect(
          consoleErrors.filter((text) => /content security policy/i.test(text)),
        ).toEqual([]);
      });
    }
  }

  test("Supabase images load under the policy", async ({ page }) => {
    await collectCspViolations(page);
    await page.goto("/properties");

    const image = page.locator("main img").first();
    if ((await image.count()) === 0) test.skip(true, "no published imagery");

    await expect(image).toBeVisible();
    // A blocked image never decodes, so naturalWidth stays 0.
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);

    const violations = (await page.evaluate(
      () => window.__cspViolations ?? [],
    )) as ViolationRecord[];
    expect(
      violations.filter((violation) => /img-src/.test(violation.directive)),
    ).toEqual([]);
  });
});
