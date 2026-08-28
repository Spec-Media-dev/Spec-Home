import assert from "node:assert/strict";
import { test, describe } from "node:test";

import {
  generateReferenceCode,
  projectSlug,
  propertySlug,
  slugify,
} from "../src/lib/slug.ts";
import { enquirySchema } from "../src/lib/validations/enquiry.ts";
import { propertyImageRuleError } from "../src/lib/property-image-rules.ts";
import { projectSchema } from "../src/lib/validations/project.ts";
import { propertySchema, specsPayloadSchema } from "../src/lib/validations/property.ts";
import {
  propertyFilterQuery,
  toPropertyFilterState,
} from "../src/lib/property-filter-state.ts";

describe("slug generation", () => {
  test("normalises accents, case and punctuation", () => {
    assert.equal(slugify("Café Résidence — Tower 5!"), "cafe-residence-tower-5");
  });

  test("collapses separators and trims edges", () => {
    assert.equal(slugify("  --Marina   Heights--  "), "marina-heights");
  });

  test("falls back when the English name yields nothing", () => {
    // Arabic-only input slugifies to an empty string, which would be an
    // invalid URL, so the fallback keeps the record addressable.
    assert.equal(slugify("مارينا"), "");
    assert.equal(projectSlug("مارينا", "Marina Heights"), "marina-heights");
    assert.equal(projectSlug("", ""), "item");
  });

  test("property slug embeds the reference code for uniqueness", () => {
    assert.equal(
      propertySlug("2 Bedroom Apartment", "SHP-10235"),
      "2-bedroom-apartment-shp-10235",
    );
  });

  test("property slug degrades to the reference when the title is non-Latin", () => {
    assert.equal(propertySlug("شقة", "SHP-10235"), "shp-10235");
  });

  test("reference codes match the SHP-##### shape", () => {
    for (let i = 0; i < 50; i += 1) {
      assert.match(generateReferenceCode(), /^SHP-\d{5}$/);
    }
  });
});

describe("enquiry validation", () => {
  const valid = {
    name: "Aisha Khan",
    email: "aisha@example.com",
    phone: "+971 50 123 4567",
    message: "I would like more information about this property, please.",
    company: "",
  };

  test("accepts a well-formed enquiry", () => {
    assert.equal(enquirySchema.safeParse(valid).success, true);
  });

  test("rejects a short message", () => {
    const result = enquirySchema.safeParse({ ...valid, message: "hi" });
    assert.equal(result.success, false);
  });

  test("rejects a malformed email", () => {
    assert.equal(
      enquirySchema.safeParse({ ...valid, email: "not-an-email" }).success,
      false,
    );
  });

  test("rejects a phone containing letters", () => {
    assert.equal(
      enquirySchema.safeParse({ ...valid, phone: "call me" }).success,
      false,
    );
  });

  test("accepts a bounded honeypot value for the server-side bot trap", () => {
    assert.equal(
      enquirySchema.safeParse({ ...valid, company: "ACME" }).success,
      true,
    );
  });

  test("rejects unexpected client-controlled fields", () => {
    assert.equal(
      enquirySchema.safeParse({ ...valid, status: "closed" }).success,
      false,
    );
  });

  test("caps message length", () => {
    assert.equal(
      enquirySchema.safeParse({ ...valid, message: "x".repeat(2001) }).success,
      false,
    );
  });
});

describe("project validation", () => {
  const base = {
    name_en: "Marina Heights",
    name_ar: "مارينا هايتس",
    developer_en: "Sobha",
    developer_ar: "صوبها",
    status: "under_construction",
  };

  test("coerces blank optional text to null", () => {
    const parsed = projectSchema.parse({ ...base, location_en: "" });
    assert.equal(parsed.location_en, null);
  });

  test("coerces valid numeric strings and rejects negatives", () => {
    const parsed = projectSchema.parse({
      ...base,
      price_min: "1200000",
    });
    assert.equal(parsed.price_min, 1_200_000);
    assert.equal(
      projectSchema.safeParse({ ...base, price_max: "-5" }).success,
      false,
    );
    assert.equal(
      projectSchema.safeParse({ ...base, price_max: "abc" }).success,
      false,
    );
  });

  test("rejects reversed price and area ranges", () => {
    assert.equal(
      projectSchema.safeParse({ ...base, price_min: 2, price_max: 1 }).success,
      false,
    );
    assert.equal(
      projectSchema.safeParse({ ...base, area_min_sqft: 900, area_max_sqft: 800 })
        .success,
      false,
    );
  });

  test("uppercases the currency and defaults to AED", () => {
    assert.equal(projectSchema.parse({ ...base, currency: "usd" }).currency, "USD");
    assert.equal(projectSchema.parse(base).currency, "AED");
  });

  test("rejects an unknown status", () => {
    assert.equal(
      projectSchema.safeParse({ ...base, status: "demolished" }).success,
      false,
    );
  });

  test("requires both languages for the name", () => {
    assert.equal(
      projectSchema.safeParse({ ...base, name_ar: "" }).success,
      false,
    );
  });
});

describe("property validation", () => {
  const base = {
    project_id: "3f6f9a6e-9f0e-4a1f-8a5f-1b2c3d4e5f60",
    title_en: "2 Bedroom Apartment",
    title_ar: "شقة بغرفتي نوم",
    property_type_en: "Apartment",
    property_type_ar: "شقة",
    status: "available",
  };

  test("requires a uuid project id", () => {
    assert.equal(propertySchema.safeParse(base).success, true);
    assert.equal(
      propertySchema.safeParse({ ...base, project_id: "not-a-uuid" }).success,
      false,
    );
  });

  test("accepts valid bedroom counts and rejects invalid values", () => {
    assert.equal(propertySchema.parse({ ...base, bedrooms: "3" }).bedrooms, 3);
    assert.equal(
      propertySchema.safeParse({ ...base, bedrooms: "999" }).success,
      false,
    );
    assert.equal(
      propertySchema.safeParse({ ...base, bedrooms: "2.5" }).success,
      false,
    );
    assert.equal(
      propertySchema.safeParse({ ...base, bedrooms: "abc" }).success,
      false,
    );
  });

  test("treats an empty price as price-on-request", () => {
    assert.equal(propertySchema.parse({ ...base, price: "" }).price, null);
  });
});

describe("property filter state", () => {
  test("serializes user-facing filters without the internal sentinel", () => {
    const query = propertyFilterQuery({
      ...toPropertyFilterState({}),
      project: "project-1",
      beds: "2",
      min: " 500000 ",
    });
    const params = new URLSearchParams(query);
    assert.equal(params.get("project"), "project-1");
    assert.equal(params.get("beds"), "2");
    assert.equal(params.get("min"), "500000");
    assert.equal(query.includes("null"), false);
  });

  test("clear state produces an empty query", () => {
    assert.equal(propertyFilterQuery(toPropertyFilterState({})), "");
  });
});

describe("property image batch rules", () => {
  const image = { type: "image/jpeg", size: 1024 };

  test("allows one to four images for an empty draft", () => {
    assert.equal(propertyImageRuleError(0, [image]), null);
    assert.equal(propertyImageRuleError(0, Array(4).fill(image)), null);
  });

  test("rejects every selection that would become a fifth image", () => {
    assert.equal(propertyImageRuleError(0, Array(5).fill(image)), "imageLimit");
    assert.equal(propertyImageRuleError(3, [image, image]), "imageLimit");
    assert.equal(propertyImageRuleError(4, [image]), "imageLimit");
  });

  test("rejects invalid MIME types, empty files and files over 5 MB", () => {
    assert.equal(
      propertyImageRuleError(0, [{ type: "image/gif", size: 1024 }]),
      "invalidFile",
    );
    assert.equal(
      propertyImageRuleError(0, [{ type: "image/png", size: 0 }]),
      "invalidFile",
    );
    assert.equal(
      propertyImageRuleError(0, [{ type: "image/webp", size: 5 * 1024 * 1024 + 1 }]),
      "fileTooLarge",
    );
  });
});

describe("spec payload validation", () => {
  const propertyId = "3f6f9a6e-9f0e-4a1f-8a5f-1b2c3d4e5f60";

  test("accepts an empty set, since specs are optional", () => {
    assert.equal(
      specsPayloadSchema.safeParse({ propertyId, specs: [] }).success,
      true,
    );
  });

  test("requires all four fields on a row", () => {
    assert.equal(
      specsPayloadSchema.safeParse({
        propertyId,
        specs: [{ key_en: "View", key_ar: "", value_en: "Marina", value_ar: "المارينا" }],
      }).success,
      false,
    );
  });

  test("caps the number of rows", () => {
    const row = { key_en: "a", key_ar: "ا", value_en: "b", value_ar: "ب" };
    assert.equal(
      specsPayloadSchema.safeParse({
        propertyId,
        specs: Array.from({ length: 41 }, () => row),
      }).success,
      false,
    );
  });
});

// ── Freshness, webhook, and localization regressions ─────────────────────

import {
  DATASETS,
  PRIVATE_DATASETS,
  PUBLIC_DATASETS,
  datasetForTable,
  isDataset,
  isPublicDataset,
  tagsForDatasets,
} from "../src/lib/cache/datasets.ts";
import { parseWebhookPayload } from "../src/lib/cache/webhook-payload.ts";
import { secretMatches } from "../src/lib/cache/webhook-auth.ts";
import {
  buildRefreshMessage,
  parsePublicRefreshMessage,
  parseRefreshMessage,
  PUBLIC_REFRESH_CHANNEL,
  ADMIN_REFRESH_CHANNEL,
} from "../src/lib/realtime/channels.ts";
import {
  adminRouteNeeds,
  publicRouteNeeds,
} from "../src/lib/realtime/route-relevance.ts";
import {
  firstFieldInOrder,
  toFieldErrors,
} from "../src/lib/validations/field-errors.ts";
import {
  PROJECT_FIELD_ORDER,
  MAX_PROJECT_NUMERIC,
} from "../src/lib/validations/project.ts";
import {
  parseProjectCoverPath,
  projectCoverRuleError,
} from "../src/lib/project-cover-rules.ts";
import {
  detectImageKind,
  kindForMime,
} from "../src/lib/image-signatures.ts";

describe("dataset vocabulary", () => {
  test("the seven approved datasets are split into public and private", () => {
    assert.equal(DATASETS.length, 7);
    assert.deepEqual([...PRIVATE_DATASETS], ["admin_profiles", "enquiries"]);
    assert.equal(PUBLIC_DATASETS.length + PRIVATE_DATASETS.length, 7);
  });

  test("lead and administrator data are never public", () => {
    assert.equal(isPublicDataset("enquiries"), false);
    assert.equal(isPublicDataset("admin_profiles"), false);
    assert.equal(isPublicDataset("projects"), true);
    assert.equal(isDataset("users"), false);
  });

  test("private datasets map to no cache tags at all", () => {
    // Admin reads are uncached, so there is nothing a lead change could
    // invalidate — and nothing that could place lead data in a public cache.
    assert.deepEqual(tagsForDatasets(["enquiries"]), []);
    assert.deepEqual(tagsForDatasets(["admin_profiles"]), []);
  });

  test("a project change also expires properties, because publish state gates them", () => {
    const tags = tagsForDatasets(["projects"]);
    assert.ok(tags.includes("projects"));
    assert.ok(tags.includes("properties"));
  });

  test("every approved table maps to its dataset, and nothing else does", () => {
    for (const dataset of DATASETS) {
      assert.equal(datasetForTable(dataset), dataset);
    }
    assert.equal(datasetForTable("auth.users"), null);
    assert.equal(datasetForTable("storage.objects"), null);
    assert.equal(datasetForTable(undefined), null);
  });

  test("tags are de-duplicated across datasets", () => {
    const tags = tagsForDatasets(["properties", "property_images", "property_specs"]);
    assert.deepEqual(tags, ["properties"]);
  });
});

describe("supabase webhook allowlist", () => {
  const valid = { type: "UPDATE", table: "projects", schema: "public" };

  test("accepts an approved table and event", () => {
    const result = parseWebhookPayload(valid);
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.dataset, "projects");
  });

  test("rejects a table outside the seven approved ones", () => {
    const result = parseWebhookPayload({ ...valid, table: "auth_users" });
    assert.deepEqual(result, { ok: false, reason: "tableNotAllowed" });
  });

  test("rejects a schema other than public", () => {
    const result = parseWebhookPayload({ ...valid, schema: "auth" });
    assert.deepEqual(result, { ok: false, reason: "schemaNotAllowed" });
  });

  test("rejects unknown events", () => {
    assert.deepEqual(parseWebhookPayload({ ...valid, type: "TRUNCATE" }), {
      ok: false,
      reason: "eventNotAllowed",
    });
  });

  test("rejects malformed bodies without touching row payloads", () => {
    for (const body of [null, [], "x", 42, {}, { type: "INSERT" }]) {
      const result = parseWebhookPayload(body);
      assert.equal(result.ok, false);
    }
  });

  test("never returns any part of record or old_record", () => {
    const result = parseWebhookPayload({
      ...valid,
      table: "enquiries",
      record: { email: "lead@example.com", message: "secret" },
      old_record: { email: "old@example.com" },
    });
    assert.equal(result.ok, true);
    assert.deepEqual(Object.keys(result), ["ok", "dataset", "event", "table"]);
    assert.equal(JSON.stringify(result).includes("example.com"), false);
  });
});

describe("webhook secret comparison", () => {
  const secret = "a".repeat(48);

  test("accepts only the exact secret", () => {
    assert.equal(secretMatches(secret, secret), true);
    assert.equal(secretMatches(`${secret}b`, secret), false);
    assert.equal(secretMatches(secret.slice(0, -1), secret), false);
  });

  test("an unset or absent secret never matches", () => {
    assert.equal(secretMatches(secret, undefined), false);
    assert.equal(secretMatches(undefined, secret), false);
    assert.equal(secretMatches("", ""), false);
    assert.equal(secretMatches(null, secret), false);
  });

  test("differing lengths do not throw", () => {
    assert.doesNotThrow(() => secretMatches("short", secret));
  });
});

describe("refresh message sanitisation", () => {
  test("carries only a version and a dataset name", () => {
    const message = buildRefreshMessage("projects");
    assert.deepEqual(message, {
      type: "content-changed",
      version: 1,
      dataset: "projects",
    });
  });

  test("the two channels are distinct topics", () => {
    assert.notEqual(PUBLIC_REFRESH_CHANNEL, ADMIN_REFRESH_CHANNEL);
  });

  test("a forged public message naming a private dataset is discarded", () => {
    const forged = { type: "content-changed", version: 1, dataset: "enquiries" };
    assert.equal(parsePublicRefreshMessage(forged), null);
    // The admin channel legitimately carries it.
    assert.notEqual(parseRefreshMessage(forged), null);
  });

  test("unknown versions and shapes are dropped rather than guessed at", () => {
    assert.equal(
      parseRefreshMessage({ type: "content-changed", version: 2, dataset: "projects" }),
      null,
    );
    assert.equal(parseRefreshMessage({ dataset: "projects" }), null);
    assert.equal(parseRefreshMessage(null), null);
    assert.equal(parseRefreshMessage("content-changed"), null);
  });
});

describe("route-aware refresh", () => {
  test("the logo affects every public page", () => {
    for (const path of ["/", "/ar", "/contact", "/properties/x"]) {
      assert.equal(publicRouteNeeds("site_settings", path), true);
    }
  });

  test("specs only matter on a property detail page", () => {
    assert.equal(publicRouteNeeds("property_specs", "/properties/villa-1"), true);
    assert.equal(publicRouteNeeds("property_specs", "/properties"), false);
    assert.equal(publicRouteNeeds("property_specs", "/contact"), false);
  });

  test("the locale prefix does not change relevance", () => {
    assert.equal(publicRouteNeeds("property_specs", "/ar/properties/villa-1"), true);
    assert.equal(publicRouteNeeds("projects", "/ar/projects"), true);
  });

  test("private datasets are refused on public routes even if one arrives", () => {
    assert.equal(publicRouteNeeds("enquiries", "/"), false);
    assert.equal(publicRouteNeeds("admin_profiles", "/"), false);
  });

  test("the admin shell always cares about the profile", () => {
    assert.equal(adminRouteNeeds("admin_profiles", "/dashboard-admin/projects"), true);
    assert.equal(adminRouteNeeds("enquiries", "/dashboard-admin/projects"), false);
    assert.equal(adminRouteNeeds("enquiries", "/dashboard-admin/enquiries"), true);
  });
});

describe("field-level error mapping", () => {
  const base = {
    name_en: "Marina Heights",
    name_ar: "مارينا هايتس",
    developer_en: "Sobha",
    developer_ar: "صوبها",
    status: "under_construction",
  };

  function codesFor(input: Record<string, unknown>) {
    const result = projectSchema.safeParse(input);
    assert.equal(result.success, false);
    return toFieldErrors(result.error.issues);
  }

  test("blank and whitespace-only required text is 'required'", () => {
    assert.equal(codesFor({ ...base, name_ar: "" }).name_ar, "required");
    assert.equal(codesFor({ ...base, name_ar: "   " }).name_ar, "required");
    assert.equal(codesFor({ ...base, developer_en: "  " }).developer_en, "required");
  });

  test("a missing required field is 'required'", () => {
    const { name_en, ...withoutName } = base;
    void name_en;
    assert.equal(codesFor(withoutName).name_en, "required");
  });

  test("unparseable numbers are 'notANumber', negatives are 'negative'", () => {
    assert.equal(codesFor({ ...base, price_min: "abc" }).price_min, "notANumber");
    assert.equal(codesFor({ ...base, price_min: "-1" }).price_min, "negative");
  });

  test("unsafe and over-precise numbers are rejected with distinct codes", () => {
    assert.equal(
      codesFor({ ...base, price_min: MAX_PROJECT_NUMERIC + 1 }).price_min,
      "tooLarge",
    );
    assert.equal(codesFor({ ...base, price_min: 1.005 }).price_min, "tooPrecise");
    assert.equal(codesFor({ ...base, price_min: "1e400" }).price_min, "notANumber");
  });

  test("reversed ranges report against the maximum field", () => {
    assert.equal(
      codesFor({ ...base, price_min: 2, price_max: 1 }).price_max,
      "rangeReversed",
    );
    assert.equal(
      codesFor({ ...base, area_min_sqft: 900, area_max_sqft: 800 }).area_max_sqft,
      "rangeReversed",
    );
  });

  test("an unknown status is 'invalidStatus'", () => {
    assert.equal(codesFor({ ...base, status: "demolished" }).status, "invalidStatus");
  });

  test("no raw Zod text leaks into the codes", () => {
    const codes = codesFor({ ...base, name_ar: "", price_min: "abc" });
    for (const code of Object.values(codes)) {
      assert.match(code, /^[a-zA-Z]+$/);
      assert.equal(code.includes(" "), false);
    }
  });

  test("focus order follows the visual field order", () => {
    const errors = { is_published: "coverRequired" as const, name_ar: "required" as const };
    assert.equal(firstFieldInOrder(errors, PROJECT_FIELD_ORDER), "name_ar");
    assert.equal(firstFieldInOrder({}, PROJECT_FIELD_ORDER), null);
  });
});

describe("optional fields accept the form's own defaults", () => {
  // The form seeds every untouched nullable field with `null`, matching the
  // database column. A schema that only accepted `undefined` or "" made every
  // field labelled "optional" fail the moment it was left alone, which blocked
  // the entire create flow. These lock that shut.
  const projectBase = {
    name_en: "Marina Heights",
    name_ar: "مارينا هايتس",
    developer_en: "Sobha",
    developer_ar: "صوبها",
    status: "under_construction",
  };

  const OPTIONAL_PROJECT_TEXT = [
    "location_en", "location_ar", "type_en", "type_ar", "handover_en",
    "handover_ar", "portfolio", "installment_en", "installment_ar",
    "down_payment_en", "down_payment_ar", "monthly_installment_en",
    "monthly_installment_ar", "cash_discount_en", "cash_discount_ar",
    "notes_en", "notes_ar", "description_en", "description_ar",
  ] as const;

  test("a project with every optional text field null still validates", () => {
    const input = { ...projectBase } as Record<string, unknown>;
    for (const field of OPTIONAL_PROJECT_TEXT) input[field] = null;

    const result = projectSchema.safeParse(input);
    assert.equal(
      result.success,
      true,
      result.success ? "" : JSON.stringify(toFieldErrors(result.error.issues)),
    );
  });

  test("null, undefined, blank and whitespace all normalise to null", () => {
    for (const value of [null, undefined, "", "   ", "\t\n"]) {
      const parsed = projectSchema.parse({ ...projectBase, portfolio: value });
      assert.equal(parsed.portfolio, null, `for ${JSON.stringify(value)}`);
    }
  });

  test("a real optional value is kept and trimmed", () => {
    assert.equal(
      projectSchema.parse({ ...projectBase, portfolio: "  Growth  " }).portfolio,
      "Growth",
    );
  });

  test("optional numeric fields accept null too", () => {
    const parsed = projectSchema.parse({
      ...projectBase,
      price_min: null,
      price_max: null,
      area_min_sqft: null,
      area_max_sqft: null,
    });
    assert.equal(parsed.price_min, null);
    assert.equal(parsed.area_max_sqft, null);
  });

  test("a property with every optional field null still validates", () => {
    const result = propertySchema.safeParse({
      project_id: "3f6f9a6e-9f0e-4a1f-8a5f-1b2c3d4e5f60",
      title_en: "2 Bedroom Apartment",
      title_ar: "شقة بغرفتي نوم",
      property_type_en: "Apartment",
      property_type_ar: "شقة",
      status: "available",
      description_en: null,
      description_ar: null,
      price: null,
      bedrooms: null,
      bathrooms: null,
      size_sqft: null,
    });
    assert.equal(
      result.success,
      true,
      result.success ? "" : JSON.stringify(toFieldErrors(result.error.issues)),
    );
  });

  test("optional text still rejects genuinely over-long input", () => {
    const result = projectSchema.safeParse({
      ...projectBase,
      portfolio: "x".repeat(4001),
    });
    assert.equal(result.success, false);
    assert.equal(toFieldErrors(result.error!.issues).portfolio, "tooLong");
  });
});

describe("project cover rules", () => {
  const projectId = "3f6f9a6e-9f0e-4a1f-8a5f-1b2c3d4e5f60";

  test("accepts a supported image within the size cap", () => {
    assert.equal(projectCoverRuleError({ type: "image/webp", size: 1024 }), null);
  });

  test("rejects wrong types, empty files, and files over 5 MB", () => {
    assert.equal(projectCoverRuleError({ type: "image/gif", size: 10 }), "invalidFile");
    assert.equal(projectCoverRuleError({ type: "image/png", size: 0 }), "invalidFile");
    assert.equal(
      projectCoverRuleError({ type: "image/png", size: 5 * 1024 * 1024 + 1 }),
      "fileTooLarge",
    );
  });

  test("a storage path is accepted only inside its own project namespace", () => {
    const other = "0f6f9a6e-9f0e-4a1f-8a5f-1b2c3d4e5f61";
    assert.deepEqual(
      parseProjectCoverPath(`projects/${projectId}/${other}.webp`, projectId),
      { ext: "webp" },
    );
    // Signed for one project, finalised against another.
    assert.equal(parseProjectCoverPath(`projects/${other}/${other}.webp`, projectId), null);
    // Traversal, wrong prefix, and unsupported extensions.
    assert.equal(parseProjectCoverPath(`projects/${projectId}/../x.webp`, projectId), null);
    assert.equal(parseProjectCoverPath(`properties/${projectId}/${other}.webp`, projectId), null);
    assert.equal(parseProjectCoverPath(`projects/${projectId}/${other}.svg`, projectId), null);
    assert.equal(parseProjectCoverPath(42, projectId), null);
  });
});

describe("image signature detection", () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0]);
  const webp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ]);

  test("identifies each supported format from its magic bytes", () => {
    assert.equal(detectImageKind(jpeg)?.ext, "jpg");
    assert.equal(detectImageKind(png)?.ext, "png");
    assert.equal(detectImageKind(webp)?.ext, "webp");
  });

  test("a spoofed header is not a supported image", () => {
    // "GIF89a", and a PE executable header renamed to .png.
    assert.equal(detectImageKind(new Uint8Array([0x47, 0x49, 0x46, 0x38])), null);
    assert.equal(detectImageKind(new Uint8Array([0x4d, 0x5a, 0x90, 0x00])), null);
  });

  test("RIFF alone is not WebP", () => {
    const riffOnly = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert.equal(detectImageKind(riffOnly), null);
  });

  test("claimed MIME types map only to supported kinds", () => {
    assert.equal(kindForMime("image/png")?.ext, "png");
    assert.equal(kindForMime("image/svg+xml"), null);
  });
});

// ── Admin localization catalogue integrity ───────────────────────────────

import adminEn from "../messages/admin/en.json" with { type: "json" };
import adminAr from "../messages/admin/ar.json" with { type: "json" };
import { ADMIN_LOCALES, adminLocaleDirection, normalizeAdminLocale } from "../src/lib/admin-locale.ts";
import { ADMIN_ERROR_MESSAGES } from "../src/components/admin/action-messages.ts";

type Tree = { [key: string]: string | Tree };

function flatten(node: Tree, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : flatten(value, `${prefix}${key}.`),
  );
}

describe("admin message catalogues", () => {
  const en = flatten(adminEn as Tree).sort();
  const ar = flatten(adminAr as Tree).sort();

  test("English and Arabic have identical key sets", () => {
    // A missing Arabic key would surface as a raw key path on screen.
    assert.deepEqual(ar, en);
  });

  test("no Arabic value was left as its English source", () => {
    const shared: string[] = [];
    for (const path of en) {
      const read = (tree: Tree) =>
        path.split(".").reduce<string | Tree>((node, key) => (node as Tree)[key], tree) as string;
      const english = read(adminEn as Tree);
      const arabic = read(adminAr as Tree);
      // Codes, digits and the Arabic endonym are legitimately identical.
      if (english === arabic && /[A-Za-z]{4,}/.test(english)) shared.push(path);
    }
    assert.deepEqual(shared, [], `untranslated: ${shared.join(", ")}`);
  });

  test("every ActionErrorCode has copy in both languages", () => {
    const codes = [
      "unauthorized", "validation", "notFound", "duplicateSlug",
      "duplicateReference", "projectRequired", "projectHasProperties",
      "imageLimit", "imageRequired", "coverRequired", "invalidFile",
      "fileTooLarge", "uploadFailed", "generic",
    ];
    for (const code of codes) {
      assert.ok(en.includes(`errors.${code}`), `missing errors.${code}`);
      assert.equal(
        typeof ADMIN_ERROR_MESSAGES[code as keyof typeof ADMIN_ERROR_MESSAGES],
        "string",
        `missing typed ADMIN_ERROR_MESSAGES.${code}`,
      );
    }
  });

  test("every FieldIssueCode has copy in both languages", () => {
    const codes = [
      "required", "tooShort", "tooLong", "invalid", "notANumber", "negative",
      "tooLarge", "tooPrecise", "notInteger", "rangeReversed",
      "invalidCurrency", "invalidStatus", "duplicate", "coverRequired",
    ];
    for (const code of codes) {
      assert.ok(en.includes(`fieldErrors.${code}`), `missing fieldErrors.${code}`);
    }
  });
});

describe("admin locale", () => {
  test("English is the default and Arabic is RTL", () => {
    assert.deepEqual([...ADMIN_LOCALES], ["en", "ar"]);
    assert.equal(adminLocaleDirection.en, "ltr");
    assert.equal(adminLocaleDirection.ar, "rtl");
  });

  test("an unknown or absent cookie value falls back to English", () => {
    assert.equal(normalizeAdminLocale("fr"), "en");
    assert.equal(normalizeAdminLocale(undefined), "en");
    assert.equal(normalizeAdminLocale("ar"), "ar");
  });
});

// ── "use server" module contract ─────────────────────────────────────────

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

describe('"use server" modules', () => {
  const dir = join(import.meta.dirname, "..", "src", "lib", "actions");
  const files = readdirSync(dir).filter((name) => name.endsWith(".ts"));

  test("there are action modules to check", () => {
    assert.ok(files.length > 0);
  });

  for (const name of files) {
    const source = readFileSync(join(dir, name), "utf8");
    if (!source.startsWith('"use server"')) continue;

    test(`${name} exports only async functions and types`, () => {
      // Next refuses to evaluate a "use server" module that exports anything
      // else: "A 'use server' file can only export async functions, found
      // number." Constants shared with the browser belong in a plain module.
      const offenders = source
        .split("\n")
        .map((line, index) => [index + 1, line] as const)
        .filter(
          ([, line]) =>
            line.startsWith("export ") &&
            !line.startsWith("export async function") &&
            !line.startsWith("export type") &&
            !line.startsWith("export interface"),
        )
        .map(([lineNumber, line]) => `${name}:${lineNumber} ${line.trim()}`);

      assert.deepEqual(offenders, []);
    });
  }
});

// ── Public-site localization catalogue integrity ─────────────────────────

import siteEn from "../messages/en.json" with { type: "json" };
import siteAr from "../messages/ar.json" with { type: "json" };

describe("site message catalogues", () => {
  const en = flatten(siteEn as Tree).sort();
  const ar = flatten(siteAr as Tree).sort();

  test("English and Arabic have identical key sets", () => {
    // Regression: the property detail page once reused `properties.filterType`
    // and `properties.keyFacts` as ad-hoc labels instead of adding the keys
    // it actually needed, which is how two distinct facts (bathrooms, area)
    // both ended up rendering the property-type label. Dedicated keys for
    // both, present in each language, are the guard against that recurring.
    assert.deepEqual(ar, en);
    assert.ok(en.includes("properties.bathrooms"));
    assert.ok(en.includes("properties.area"));
  });

  // The brand name stays in Latin script in both languages by design, and the
  // email placeholder is an example address, not copy — neither is a missed
  // translation, so both are exempt from the "left untranslated" check below.
  const INTENTIONALLY_SHARED = new Set([
    "common.brandName",
    "common.brandShort",
    "enquiry.emailPlaceholder",
  ]);

  test("no Arabic value was left as its English source", () => {
    const shared: string[] = [];
    for (const path of en) {
      if (INTENTIONALLY_SHARED.has(path)) continue;
      const read = (tree: Tree) =>
        path.split(".").reduce<string | Tree>((node, key) => (node as Tree)[key], tree) as string;
      const english = read(siteEn as Tree);
      const arabic = read(siteAr as Tree);
      if (english === arabic && /[A-Za-z]{4,}/.test(english)) shared.push(path);
    }
    assert.deepEqual(shared, [], `untranslated: ${shared.join(", ")}`);
  });
});

// ── Price formatting ──────────────────────────────────────────────────────

import { formatPrice } from "../src/lib/format.ts";

describe("price formatting", () => {
  test("currency leads the amount in both languages", () => {
    // Regression: Intl's own currency style follows each locale's CLDR
    // convention, which places the symbol *after* the number in Arabic
    // ("100,000 د.إ.") but *before* it in English ("AED 100,000"). Same
    // price, opposite shape — which reads as the Arabic price having been
    // reversed when the two sit next to each other on the same site.
    const en = formatPrice(100000, "AED", "en");
    const ar = formatPrice(100000, "AED", "ar");

    assert.equal(en, "AED 100,000");
    assert.ok(ar?.startsWith("د.إ"), `expected Arabic currency prefix, got: ${ar}`);
    assert.ok(ar?.endsWith("100,000"), `expected the amount last, got: ${ar}`);
  });

  test("large amounts keep Latin-digit thousands separators in Arabic", () => {
    const ar = formatPrice(1234567, "AED", "ar");
    assert.ok(ar?.includes("1,234,567"), `expected grouped Latin digits, got: ${ar}`);
  });

  test("null and undefined amounts render as nothing to format", () => {
    assert.equal(formatPrice(null, "AED", "en"), null);
    assert.equal(formatPrice(undefined, "AED", "ar"), null);
  });
});

// ── Rate-limit keying ────────────────────────────────────────────────────

import { clientIpFromHeaders } from "../src/lib/client-ip.ts";

describe("client IP resolution", () => {
  const from = (headers: Record<string, string>) =>
    clientIpFromHeaders((name) => headers[name] ?? null);

  test("prefers the header the edge sets itself", () => {
    // Cloudflare strips any inbound copy of its own header, so when both are
    // present the CDN's value is the one that has actually been verified.
    assert.equal(
      from({
        "cf-connecting-ip": "203.0.113.7",
        "x-forwarded-for": "198.51.100.1",
      }),
      "203.0.113.7",
    );
  });

  test("takes the original client from a forwarded chain", () => {
    // Left-most entry is the client as seen by the first proxy; the rest are
    // the proxies themselves.
    assert.equal(
      from({ "x-forwarded-for": "198.51.100.1, 70.41.3.18, 150.172.238.178" }),
      "198.51.100.1",
    );
  });

  test("trims whitespace and falls through empty headers", () => {
    assert.equal(from({ "x-forwarded-for": "   " , "x-real-ip": "192.0.2.9" }), "192.0.2.9");
    assert.equal(from({ "x-forwarded-for": " 192.0.2.44 " }), "192.0.2.44");
  });

  test("unidentifiable callers share one bucket rather than escaping the limit", () => {
    // The alternative — returning null and skipping the limiter — would make
    // stripping a header a way to opt out of rate limiting entirely.
    assert.equal(from({}), "unknown");
  });
});

// ── Admin enquiry action boundary ────────────────────────────────────────

describe("admin enquiry actions", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "src", "lib", "actions", "enquiries.ts"),
    "utf8",
  );
  const updateStart = source.indexOf("export async function updateEnquiryStatus");
  const deleteStart = source.indexOf("export async function deleteEnquiry");
  const updateSource = source.slice(updateStart, deleteStart);
  const deleteSource = source.slice(deleteStart);

  test("status updates authorize and validate before writing", () => {
    assert.ok(updateStart >= 0 && deleteStart > updateStart);
    assert.match(updateSource, /await requireAdminAction\(\)/);
    assert.match(updateSource, /isUuid\(id\)/);
    assert.match(updateSource, /ENQUIRY_STATUSES\.includes/);
    assert.ok(
      updateSource.indexOf("requireAdminAction") <
        updateSource.indexOf('.from("enquiries")'),
    );
  });

  test("deletion authorizes and validates before writing", () => {
    assert.match(deleteSource, /await requireAdminAction\(\)/);
    assert.match(deleteSource, /isUuid\(id\)/);
    assert.ok(
      deleteSource.indexOf("requireAdminAction") <
        deleteSource.indexOf('.from("enquiries")'),
    );
  });
});

// ── No CAPTCHA provider integration ──────────────────────────────────────

describe("enquiry protection carries no CAPTCHA integration", () => {
  const root = join(import.meta.dirname, "..", "src");

  function sourceFiles(): string[] {
    return readdirSync(root, { recursive: true, encoding: "utf8" })
      .filter((name) => /\.(ts|tsx)$/.test(name))
      .map((name) => join(root, name));
  }

  test("there are source files to scan", () => {
    assert.ok(sourceFiles().length > 0);
  });

  test("no Turnstile or other CAPTCHA provider is referenced in src/", () => {
    // The product decision is that the public form is protected by honeypot +
    // rate limit + strict validation, with no external anti-bot account. This
    // fails if a provider is reintroduced, including as dormant optional code.
    const providers =
      /turnstile|hcaptcha|recaptcha|friendlycaptcha|friendly-challenge/i;

    const offenders = sourceFiles()
      .filter((file) => providers.test(readFileSync(file, "utf8")))
      .map((file) => file.slice(root.length + 1));

    assert.deepEqual(
      offenders,
      [],
      `CAPTCHA provider code found — delete these files or references: ${offenders.join(", ")}`,
    );
  });

  test("the enquiry schema accepts no verification token", () => {
    const rejected = enquirySchema.safeParse({
      name: "Aisha Khan",
      email: "aisha@example.com",
      message: "I would like more information about this property, please.",
      turnstileToken: "anything",
    });
    // `.strict()` means an unknown key is refused outright, not stripped.
    assert.equal(rejected.success, false);
  });
});
