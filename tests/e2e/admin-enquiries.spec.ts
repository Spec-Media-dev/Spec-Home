import { expect, test } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  /\/+$/,
  "",
).replace(/\/rest\/v1$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const runId = Date.now();
const leadPrefix = `E2E Admin Lead - ${runId}`;
const appUrl = "http://localhost:3100";

type AuthCookie = { name: string; value: string; url: string };

function serviceClient() {
  expect(supabaseUrl && serviceKey).toBeTruthy();
  return createClient(supabaseUrl!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createAdminSessionCookies(): Promise<AuthCookie[]> {
  expect(supabaseUrl && anonKey && serviceKey).toBeTruthy();
  const service = serviceClient();
  const { data: profile, error: profileError } = await service
    .from("admin_profiles")
    .select("id")
    .limit(1)
    .maybeSingle();
  expect(profileError).toBeNull();
  expect(profile?.id).toBeTruthy();

  const { data: userData, error: userError } =
    await service.auth.admin.getUserById(profile!.id);
  expect(userError).toBeNull();
  expect(userData.user?.email).toBeTruthy();

  const { data: linkData, error: linkError } =
    await service.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user!.email!,
    });
  expect(linkError).toBeNull();
  expect(linkData.properties.hashed_token).toBeTruthy();

  const cookieJar = new Map<string, string>();
  const sessionClient = createServerClient(supabaseUrl!, anonKey!, {
    cookies: {
      getAll: () =>
        [...cookieJar].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => {
        for (const cookie of cookies) cookieJar.set(cookie.name, cookie.value);
      },
    },
  });
  const { error: verifyError } = await sessionClient.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });
  expect(verifyError).toBeNull();

  return [...cookieJar].map(([name, value]) => ({ name, value, url: appUrl }));
}

async function createLead(suffix: string, status: "new" | "contacted" = "new") {
  const name = `${leadPrefix} ${suffix}`;
  const { data, error } = await serviceClient()
    .from("enquiries")
    .insert({
      name,
      email: `e2e-admin-${runId}-${suffix.toLowerCase()}@example.com`,
      phone: null,
      message: `Isolated Admin inbox E2E lead ${suffix}.`,
      status,
    })
    .select("id, name")
    .single();
  expect(error).toBeNull();
  return data!;
}

async function persistedStatus(id: string) {
  const { data, error } = await serviceClient()
    .from("enquiries")
    .select("status")
    .eq("id", id)
    .single();
  expect(error).toBeNull();
  return data!.status;
}

async function rowCount(id: string) {
  const { count, error } = await serviceClient()
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("id", id);
  expect(error).toBeNull();
  return count ?? 0;
}

test.describe.serial("Admin lead inbox actions", () => {
  let authCookies: AuthCookie[];

  test.beforeAll(async () => {
    authCookies = await createAdminSessionCookies();
  });

  test.beforeEach(async ({ context }) => {
    await context.addCookies(authCookies);
  });

  test.afterAll(async () => {
    if (!supabaseUrl || !serviceKey) return;
    await serviceClient()
      .from("enquiries")
      .delete()
      .like("name", `${leadPrefix}%`);
  });

  test("row menu changes status, respects filters, and confirms deletion", async ({
    page,
  }) => {
    const lead = await createLead("List");
    const row = page.getByRole("row").filter({ hasText: lead.name });

    await page.goto("/dashboard-admin/enquiries?status=new");
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: `Actions for ${lead.name}` }).click();
    await page.getByRole("menuitem", { name: "Mark as Contacted" }).click();
    await expect(page.getByText("Status updated to Contacted.")).toBeVisible();
    await expect(row).toHaveCount(0);
    expect(await persistedStatus(lead.id)).toBe("contacted");

    await page.goto("/dashboard-admin/enquiries?status=contacted");
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: `Actions for ${lead.name}` }).click();
    await page.getByRole("menuitem", { name: "Mark as Closed" }).click();
    await expect(row).toHaveCount(0);
    expect(await persistedStatus(lead.id)).toBe("closed");

    await page.goto("/dashboard-admin/enquiries?status=closed");
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: `Actions for ${lead.name}` }).click();
    await page.getByRole("menuitem", { name: "Mark as New" }).click();
    await expect(row).toHaveCount(0);
    expect(await persistedStatus(lead.id)).toBe("new");

    await page.goto("/dashboard-admin/enquiries?status=new");
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: `Actions for ${lead.name}` }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    const dialog = page.getByRole("dialog", { name: "Delete enquiry?" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(row).toBeVisible();
    expect(await rowCount(lead.id)).toBe(1);

    await row.getByRole("button", { name: `Actions for ${lead.name}` }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await dialog.getByRole("button", { name: "Delete enquiry" }).click();
    await expect(page.getByText("Enquiry deleted.")).toBeVisible();
    await expect(row).toHaveCount(0);
    expect(await rowCount(lead.id)).toBe(0);
  });

  test("detail page changes status and deletes back to the inbox", async ({ page }) => {
    const lead = await createLead("Detail");
    await page.goto(`/dashboard-admin/enquiries/${lead.id}`);

    await expect(page.getByRole("heading", { name: lead.name })).toBeVisible();
    await page.getByRole("button", { name: "Mark as Contacted" }).click();
    await expect(page.getByText("Status updated to Contacted.")).toBeVisible();
    await expect(page.getByText("Contacted", { exact: true })).toBeVisible();
    expect(await persistedStatus(lead.id)).toBe("contacted");

    await page.getByRole("button", { name: "Delete", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Delete enquiry?" });
    await dialog.getByRole("button", { name: "Delete enquiry" }).click();
    await expect(page).toHaveURL(/\/dashboard-admin\/enquiries$/);
    expect(await rowCount(lead.id)).toBe(0);
  });

  test("Arabic actions keep RTL direction and localized accessible labels", async ({
    context,
    page,
  }) => {
    const lead = await createLead("Arabic", "contacted");
    await context.addCookies([
      { name: "spec_admin_locale", value: "ar", url: appUrl },
    ]);
    await page.goto("/dashboard-admin/enquiries?status=contacted");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const row = page.getByRole("row").filter({ hasText: lead.name });
    await row.getByRole("button", { name: `إجراءات ${lead.name}` }).click();
    await expect(page.getByRole("menuitem", { name: "عرض التفاصيل" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "تعيين كجديد" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "تعيين كمغلق" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "حذف" })).toBeVisible();
  });
});

test("an unauthenticated visitor cannot access enquiry actions", async ({ page }) => {
  await page.goto("/dashboard-admin/enquiries");
  await expect(page).toHaveURL(/\/dashboard-admin\/login/);
  await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
});
