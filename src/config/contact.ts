/**
 * The database has no columns for public contact details, so they live here as
 * typed configuration. Centralised deliberately: if they later move into
 * `site_settings`, only this module changes.
 */
export const contact = {
  // Real phone and WhatsApp details have not been supplied. Keep them absent
  // rather than publishing placeholder values in the UI or structured data.
  phone: null,
  phoneHref: null,
  whatsapp: null,
  whatsappHref: null,
  email: "info@spechome.ae",
  emailHref: "mailto:info@spechome.ae",
  address: {
    locality: "Dubai",
    country: "AE",
  },
} as const;
