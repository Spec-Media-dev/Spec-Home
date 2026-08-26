import assert from "node:assert/strict";
import { test, describe } from "node:test";

import {
  generateReferenceCode,
  projectSlug,
  propertySlug,
  slugify,
} from "../src/lib/slug.ts";
import { enquirySchema } from "../src/lib/validations/enquiry.ts";
import { projectSchema } from "../src/lib/validations/project.ts";
import { propertySchema, specsPayloadSchema } from "../src/lib/validations/property.ts";

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

  test("honeypot must stay empty", () => {
    assert.equal(
      enquirySchema.safeParse({ ...valid, company: "ACME" }).success,
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

  test("coerces numeric strings and rejects negatives", () => {
    const parsed = projectSchema.parse({
      ...base,
      price_min: "1200000",
      price_max: "-5",
    });
    assert.equal(parsed.price_min, 1_200_000);
    assert.equal(parsed.price_max, null);
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

  test("clamps out-of-range bedroom counts to null", () => {
    assert.equal(propertySchema.parse({ ...base, bedrooms: "3" }).bedrooms, 3);
    assert.equal(propertySchema.parse({ ...base, bedrooms: "999" }).bedrooms, null);
    assert.equal(propertySchema.parse({ ...base, bedrooms: "2.5" }).bedrooms, null);
  });

  test("treats an empty price as price-on-request", () => {
    assert.equal(propertySchema.parse({ ...base, price: "" }).price, null);
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
