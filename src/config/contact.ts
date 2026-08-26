/**
 * The database has no columns for public contact details, so they live here as
 * typed configuration. Centralised deliberately: if they later move into
 * `site_settings`, only this module changes.
 */
export const contact = {
  phone: "+971 4 000 0000",
  phoneHref: "tel:+97140000000",
  whatsapp: "+971 50 000 0000",
  whatsappHref: "https://wa.me/971500000000",
  email: "info@spechome.ae",
  emailHref: "mailto:info@spechome.ae",
  address: {
    locality: "Dubai",
    country: "AE",
  },
} as const;
