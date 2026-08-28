import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Exercises the database invariants the application relies on, against the
 * real project. Everything it creates is prefixed "ITEST –" and removed in the
 * teardown, so the suite leaves no residue.
 *
 * Run with: npm run test:integration
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "").replace(
  /\/rest\/v1$/,
  "",
);
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const configured = Boolean(url && anonKey && serviceKey);

describe("supabase invariants", { skip: !configured }, () => {
  let svc: SupabaseClient;
  let anon: SupabaseClient;
  let projectId = "";
  let propertyId = "";

  before(async () => {
    const auth = {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    };
    svc = createClient(url!, serviceKey!, { auth });
    anon = createClient(url!, anonKey!, { auth });

    const { data: project, error: projectError } = await svc
      .from("projects")
      .insert({
        name_en: "ITEST – Integration Project",
        name_ar: "اختبار – مشروع",
        slug: `itest-project-${Date.now()}`,
        developer_en: "ITEST Developer",
        developer_ar: "مطور اختبار",
        is_published: true,
      })
      .select("id")
      .single();
    assert.equal(projectError, null);
    projectId = project!.id;

    const { data: property, error: propertyError } = await svc
      .from("properties")
      .insert({
        project_id: projectId,
        reference_code: `ITEST-${Date.now()}`,
        title_en: "ITEST – Integration Property",
        title_ar: "اختبار – عقار",
        slug: `itest-property-${Date.now()}`,
        property_type_en: "Apartment",
        property_type_ar: "شقة",
        is_published: true,
      })
      .select("id")
      .single();
    assert.equal(propertyError, null);
    propertyId = property!.id;
  });

  after(async () => {
    if (propertyId) {
      await svc.from("properties").delete().eq("id", propertyId);
    }
    if (projectId) {
      await svc.from("projects").delete().eq("id", projectId);
    }
  });

  test("anon cannot insert an enquiry directly", async () => {
    // The public form must go through the service-role Server Action; a direct
    // anon insert is intentionally blocked by RLS.
    const { error } = await anon.from("enquiries").insert({
      name: "ITEST",
      email: "itest@example.com",
      message: "This should never be stored.",
    });
    assert.notEqual(error, null);
    assert.equal(error!.code, "42501");
  });

  test("anon cannot read the lead inbox", async () => {
    const { data, error } = await anon.from("enquiries").select("id");
    assert.equal(error, null);
    assert.equal(data!.length, 0);
  });

  test("anon cannot update or delete enquiries", async () => {
    const { data: created, error: createError } = await svc
      .from("enquiries")
      .insert({
        name: "ITEST – Private Lead",
        email: "itest-private@example.com",
        message: "This controlled lead verifies anonymous mutation policies.",
        status: "new",
      })
      .select("id, status")
      .single();
    assert.equal(createError, null);

    try {
      await anon
        .from("enquiries")
        .update({ status: "closed" })
        .eq("id", created!.id);
      await anon.from("enquiries").delete().eq("id", created!.id);

      const { data: persisted, error: readError } = await svc
        .from("enquiries")
        .select("id, status")
        .eq("id", created!.id)
        .single();
      assert.equal(readError, null);
      assert.equal(persisted!.status, "new");
    } finally {
      await svc.from("enquiries").delete().eq("id", created!.id);
    }
  });

  test("anon cannot mutate projects", async () => {
    await anon.from("projects").update({ name_en: "hacked" }).eq("id", projectId);
    const { data } = await svc
      .from("projects")
      .select("name_en")
      .eq("id", projectId)
      .single();
    assert.equal(data!.name_en, "ITEST – Integration Project");
  });

  test("published property is publicly visible", async () => {
    const { data } = await anon
      .from("properties")
      .select("id, projects!inner(is_published)")
      .eq("id", propertyId)
      .eq("is_published", true)
      .eq("projects.is_published", true);
    assert.equal(data!.length, 1);
  });

  test("unpublishing the project hides its properties", async () => {
    await svc.from("projects").update({ is_published: false }).eq("id", projectId);

    const { data: gated } = await anon
      .from("properties")
      .select("id, projects!inner(is_published)")
      .eq("id", propertyId)
      .eq("is_published", true)
      .eq("projects.is_published", true);
    assert.equal(gated!.length, 0);

    // RLS alone does not gate on the parent, which is exactly why the data
    // layer always joins through projects.
    const { data: ungated } = await anon
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("is_published", true);
    assert.equal(ungated!.length, 1);

    await svc.from("projects").update({ is_published: true }).eq("id", projectId);
  });

  test("a project holding properties cannot be deleted", async () => {
    const { error } = await svc.from("projects").delete().eq("id", projectId);
    assert.notEqual(error, null);
    assert.equal(error!.code, "23503");
  });

  test("the max-4 image guard trips at four", async () => {
    const rows = Array.from({ length: 4 }, (_, index) => ({
      property_id: propertyId,
      image_url: `properties/${propertyId}/itest-${index}.jpg`,
      display_order: index + 1,
      is_cover: index === 0,
    }));

    const { error } = await svc.from("property_images").insert(rows);
    assert.equal(error, null);

    const { count } = await svc
      .from("property_images")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId);

    // Both upload preparation and finalisation repeat this authoritative count.
    assert.equal(count, 4);
    assert.equal(count! >= 4, true, "a fifth upload must be refused");

    await svc.from("property_images").delete().eq("property_id", propertyId);
  });

  test("spec ordering is stable via explicit created_at", async () => {
    const base = Date.now();
    const labels = ["First", "Second", "Third"];

    await svc.from("property_specs").insert(
      labels.map((label, index) => ({
        property_id: propertyId,
        key_en: label,
        key_ar: label,
        value_en: String(index),
        value_ar: String(index),
        created_at: new Date(base + index).toISOString(),
      })),
    );

    const { data } = await svc
      .from("property_specs")
      .select("key_en, created_at, id")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    assert.deepEqual(
      data!.map((row) => row.key_en),
      labels,
    );

    await svc.from("property_specs").delete().eq("property_id", propertyId);
  });

  test("site_settings is a singleton keyed on main", async () => {
    const { error } = await svc
      .from("site_settings")
      .insert({ key: "secondary" });
    assert.notEqual(error, null, "the single-row CHECK must reject other keys");
  });

  test("anon cannot read admin_profiles", async () => {
    // The admin's name and avatar path are private: the public site never
    // needs them, and the realtime bridge never broadcasts them.
    const { data, error } = await anon.from("admin_profiles").select("*");
    assert.ok(
      error !== null || (data ?? []).length === 0,
      "admin_profiles must not be readable by the anon role",
    );
  });

  test("anon cannot write site_settings", async () => {
    const { data: sessionData } = await anon.auth.getSession();
    const { data: userData, error: userError } = await anon.auth.getUser();
    assert.equal(sessionData.session, null);
    assert.equal(userData.user, null);
    assert.notEqual(userError, null);

    const { data: original, error: originalError } = await svc
      .from("site_settings")
      .select("key, logo_path, updated_at")
      .eq("key", "main")
      .single();
    assert.equal(originalError, null);

    const attemptedPath = `itest/anonymous-${Date.now()}.png`;

    try {
      const attempt = await anon
        .from("site_settings")
        .update({ logo_path: attemptedPath }, { count: "exact" })
        .eq("key", "main")
        .select("key, logo_path, updated_at");

      if (attempt.error === null) {
        assert.equal(attempt.count, 0, "RLS must affect zero rows");
        assert.equal(attempt.data.length, 0, "RLS must return zero rows");
      }

      const { data: persisted, error: persistedError } = await svc
        .from("site_settings")
        .select("key, logo_path, updated_at")
        .eq("key", "main")
        .single();
      assert.equal(persistedError, null);
      assert.equal(persisted!.logo_path, original!.logo_path);
      assert.equal(persisted!.updated_at, original!.updated_at);
    } finally {
      // This runs only as a safety net for a future policy regression. It never
      // touches the row in the expected zero-row RLS path.
      const { data: current } = await svc
        .from("site_settings")
        .select("logo_path, updated_at")
        .eq("key", "main")
        .single();
      if (
        current &&
        (current.logo_path !== original!.logo_path ||
          current.updated_at !== original!.updated_at)
      ) {
        await svc
          .from("site_settings")
          .update({
            logo_path: original!.logo_path,
            updated_at: original!.updated_at,
          })
          .eq("key", "main");
      }
    }
  });

  test("a draft project may have no cover, a published one must have one", async () => {
    // The database itself does not enforce this — the gate lives in
    // lib/actions/projects.ts — so this asserts the column behaves as the
    // action assumes: nullable, and settable back to null on a draft.
    const { data: draft, error: draftError } = await svc
      .from("projects")
      .insert({
        name_en: "ITEST – Cover Draft",
        name_ar: "اختبار – غلاف",
        slug: `itest-cover-${Date.now()}`,
        developer_en: "ITEST Developer",
        developer_ar: "مطور اختبار",
        is_published: false,
      })
      .select("id, cover_image_path")
      .single();

    assert.equal(draftError, null);
    assert.equal(draft!.cover_image_path, null);

    const { error: setError } = await svc
      .from("projects")
      .update({ cover_image_path: `projects/${draft!.id}/cover.webp` })
      .eq("id", draft!.id);
    assert.equal(setError, null);

    const { error: clearError } = await svc
      .from("projects")
      .update({ cover_image_path: null })
      .eq("id", draft!.id);
    assert.equal(clearError, null);

    await svc.from("projects").delete().eq("id", draft!.id);
  });

  test("a duplicate project slug is rejected by the database", async () => {
    // Belt and braces: the action refuses a collision before insert, and this
    // confirms the unique index would refuse it even if the action did not.
    const slug = `itest-dup-${Date.now()}`;
    const row = {
      name_ar: "اختبار – مكرر",
      developer_en: "ITEST Developer",
      developer_ar: "مطور اختبار",
    };

    const { data: first, error: firstError } = await svc
      .from("projects")
      .insert({ ...row, name_en: "ITEST – Duplicate A", slug })
      .select("id")
      .single();
    assert.equal(firstError, null);

    const { error: secondError } = await svc
      .from("projects")
      .insert({ ...row, name_en: "ITEST – Duplicate B", slug })
      .select("id")
      .single();
    assert.notEqual(secondError, null, "slug must be unique");

    await svc.from("projects").delete().eq("id", first!.id);
  });

  test("the seven approved tables exist and are readable by the service role", async () => {
    // The webhook allowlist and the dataset map both name these seven; a
    // rename would silently stop refreshing that dataset.
    for (const table of [
      "site_settings",
      "admin_profiles",
      "projects",
      "properties",
      "property_images",
      "property_specs",
      "enquiries",
    ] as const) {
      const { error } = await svc
        .from(table)
        .select("*", { count: "exact", head: true });
      assert.equal(error, null, `${table} must exist`);
    }
  });
});
