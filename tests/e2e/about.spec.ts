import { expect, test, type Page } from "@playwright/test";

const widths = [360, 390, 768, 1024, 1280, 1440, 1536] as const;
const locales = [
  { path: "/about", lang: "en", dir: "ltr" },
  { path: "/ar/about", lang: "ar", dir: "rtl" },
] as const;
const themes = ["light", "dark"] as const;

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const locale of locales) {
  for (const theme of themes) {
    for (const width of widths) {
      test(`${locale.lang} About is responsive at ${width}px in ${theme}`, async ({
        page,
      }) => {
        const runtimeErrors = collectRuntimeErrors(page);
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((selectedTheme) => {
          window.localStorage.setItem("theme", selectedTheme);
        }, theme);

        const response = await page.goto(locale.path);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
        await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("header")).toBeVisible();
        await expect(page.locator("footer")).toBeVisible();
        await expect(page.locator('main a[href$="/properties"]')).toBeVisible();
        await expect(page.locator('main a[href$="/projects"]')).toBeVisible();
        await expect(page.locator('main a[href$="/contact"]')).toBeVisible();

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        expect(runtimeErrors).toEqual([]);
      });
    }
  }
}

test("About metadata, JSON-LD, locale switching and theme persistence", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/about$/,
  );
  for (const hreflang of ["en", "ar", "x-default"]) {
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`),
    ).toHaveCount(1);
  }
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    /\/about$/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  const graphs = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(graphs.length).toBeGreaterThan(0);
  for (const graph of graphs) expect(() => JSON.parse(graph)).not.toThrow();

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("link", { name: "Switch language" }).click();
  await expect(page).toHaveURL(/\/ar\/about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});
