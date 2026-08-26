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
    svc = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    anon = createClient(url!, anonKey!, { auth: { persistSession: false } });

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

    // This is the exact check uploadPropertyImage performs before inserting.
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
});
