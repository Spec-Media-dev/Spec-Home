import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

function absolute(path: string) {
  return path === "/" ? siteOrigin : `${siteOrigin}${path}`;
}

async function expectValidJsonLd(page: Page) {
  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) expect(() => JSON.parse(script)).not.toThrow();
}

async function expectIndexableSeo(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  await expect
    .poll(() => page.title(), { message: `${path} must have a document title` })
    .not.toBe("");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /\S+/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    absolute(path),
  );
  for (const hreflang of ["en", "ar", "x-default"]) {
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`),
    ).toHaveCount(1);
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    absolute(path),
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    /summary/,
  );
  expect(await page.locator("main a[href]").count()).toBeGreaterThan(0);
  await expectValidJsonLd(page);
}

test("current static routes have complete EN/AR SEO", async ({ page }) => {
  for (const path of [
    "/",
    "/ar",
    "/about",
    "/ar/about",
    "/projects",
    "/ar/projects",
    "/properties",
    "/ar/properties",
    "/contact",
    "/ar/contact",
  ]) {
    await expectIndexableSeo(page, path);
  }
});

test("published entity pages have complete SEO and real HTTP status", async ({
  page,
}) => {
  await page.goto("/projects");
  const projectHref = await page
    .locator('main a[href^="/projects/"]')
    .first()
    .getAttribute("href");
  expect(projectHref, "a published Project is required for this gate").toBeTruthy();

  await page.goto("/properties");
  const propertyHref = await page
    .locator('main a[href^="/properties/"]')
    .first()
    .getAttribute("href");
  expect(propertyHref, "a published Property is required for this gate").toBeTruthy();

  for (const href of [projectHref!, propertyHref!]) {
    await expectIndexableSeo(page, href);
    await expectIndexableSeo(page, `/ar${href}`);
  }
});

test("search and properties query states are noindex with clean canonicals", async ({
  page,
}) => {
  for (const path of ["/search?q=dubai", "/ar/search?q=dubai"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex, follow/,
    );
  }

  for (const [path, canonical] of [
    ["/properties?min=1", absolute("/properties")],
    ["/ar/properties?min=1", absolute("/ar/properties")],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex, follow/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonical,
    );
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(0);
  }
});

for (const locale of [
  {
    path: "/properties",
    apply: "Apply",
    clear: "Clear filters",
  },
  {
    path: "/ar/properties",
    apply: "تطبيق",
    clear: "مسح عوامل التصفية",
  },
] as const) {
  test(`${locale.path} clears applied and draft filters deterministically`, async ({
    page,
  }) => {
    await page.goto(locale.path);
    await page.locator("#filter-min").fill("1");
    await page.getByRole("button", { name: locale.apply, exact: true }).click();
    await expect(page).toHaveURL(/\?min=1$/);
    await expect(page.locator("#filter-min")).toHaveValue("1");

    await page.getByRole("link", { name: locale.clear, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${locale.path}$`));
    await expect(page.locator("#filter-min")).toHaveValue("");

    await page.goBack();
    await expect(page).toHaveURL(/\?min=1$/);
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`${locale.path}$`));
    await page.reload();
    await expect(page.locator("#filter-min")).toHaveValue("");

    await page.locator("#filter-max").fill("500000");
    await page.getByRole("link", { name: locale.clear, exact: true }).click();
    await expect(page.locator("#filter-max")).toHaveValue("");
    await expect(page.locator("body")).not.toContainText(/_any|__any/);
  });
}

test("sitemap is valid reciprocal EN/AR XML with published URLs only", async ({
  page,
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/xml/);
  const xml = await response.text();
  expect(xml).not.toMatch(/<html/i);

  const parsed = await page.evaluate((source) => {
    const documentNode = new DOMParser().parseFromString(source, "application/xml");
    return {
      parserErrors: documentNode.querySelectorAll("parsererror").length,
      root: documentNode.documentElement.localName,
      namespace: documentNode.documentElement.namespaceURI,
      locs: Array.from(documentNode.getElementsByTagName("loc"), (node) =>
        node.textContent?.trim(),
      ).filter((value): value is string => Boolean(value)),
    };
  }, xml);

  expect(parsed.parserErrors).toBe(0);
  expect(parsed.root).toBe("urlset");
  expect(parsed.namespace).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
  expect(new Set(parsed.locs).size).toBe(parsed.locs.length);
  for (const loc of parsed.locs) {
    expect(() => new URL(loc)).not.toThrow();
    expect(new URL(loc).search).toBe("");
  }

  for (const path of [
    "/",
    "/ar",
    "/about",
    "/ar/about",
    "/projects",
    "/ar/projects",
    "/properties",
    "/ar/properties",
    "/contact",
    "/ar/contact",
  ]) {
    expect(parsed.locs).toContain(absolute(path));
  }

  expect(parsed.locs.some((url) => /search|dashboard-admin|\/api\//.test(url))).toBe(
    false,
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  expect(supabaseUrl && anonKey && serviceKey).toBeTruthy();

  const auth = { persistSession: false, autoRefreshToken: false };
  const anon = createClient(supabaseUrl!, anonKey!, { auth });
  const service = createClient(supabaseUrl!, serviceKey!, { auth });
  const [{ data: projects }, { data: properties }, { data: draftProjects }, { data: draftProperties }] =
    await Promise.all([
      anon.from("projects").select("slug").eq("is_published", true),
      anon
        .from("properties")
        .select("slug, projects!inner(is_published)")
        .eq("is_published", true)
        .eq("projects.is_published", true),
      service.from("projects").select("slug").eq("is_published", false),
      service.from("properties").select("slug").eq("is_published", false),
    ]);

  for (const project of projects ?? []) {
    expect(parsed.locs).toContain(absolute(`/projects/${project.slug}`));
    expect(parsed.locs).toContain(absolute(`/ar/projects/${project.slug}`));
  }
  for (const property of properties ?? []) {
    expect(parsed.locs).toContain(absolute(`/properties/${property.slug}`));
    expect(parsed.locs).toContain(absolute(`/ar/properties/${property.slug}`));
  }
  for (const project of draftProjects ?? []) {
    expect(parsed.locs).not.toContain(absolute(`/projects/${project.slug}`));
  }
  for (const property of draftProperties ?? []) {
    expect(parsed.locs).not.toContain(absolute(`/properties/${property.slug}`));
  }
});

test("robots allows public routes and blocks current internal surfaces", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Disallow: /dashboard-admin");
  expect(body).toContain("Disallow: /search");
  expect(body).toContain("Disallow: /ar/search");
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);
  expect(body).not.toContain("Disallow: /_next");
});

test("production responses use real 404 status for missing entities", async ({
  page,
}) => {
  const missingProject = await page.goto(
    "/projects/__e2e-project-that-does-not-exist__",
  );
  expect(missingProject?.status()).toBe(404);

  const missingProperty = await page.goto(
    "/properties/__e2e-property-that-does-not-exist__",
  );
  expect(missingProperty?.status()).toBe(404);
});
