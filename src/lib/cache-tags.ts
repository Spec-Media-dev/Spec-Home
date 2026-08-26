/** Central tag vocabulary so reads and mutations can never drift apart. */
export const cacheTags = {
  siteSettings: "site-settings",
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  properties: "properties",
  property: (slug: string) => `property:${slug}`,
} as const;
