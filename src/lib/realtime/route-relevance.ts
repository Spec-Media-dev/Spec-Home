import type { Dataset } from "@/lib/cache/datasets";

/**
 * Which datasets a given route actually renders.
 *
 * Without this, every property-image change would refresh the contact page.
 * Kept as pure data so it can be unit tested and so both bridges agree.
 */

/** Strips the optional `/ar` locale prefix; `as-needed` leaves English bare. */
function normalizePublicPath(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * The site logo lives in the header and footer of every page, so a
 * `site_settings` change is relevant everywhere. Everything else is scoped.
 */
export function publicRouteNeeds(
  dataset: Dataset,
  pathname: string,
): boolean {
  const path = normalizePublicPath(pathname);

  switch (dataset) {
    case "site_settings":
      return true;

    // A project's publish state gates its properties, and project cards appear
    // on the home page, the listing, search, and each property detail page.
    case "projects":
      return (
        path === "/" ||
        path.startsWith("/projects") ||
        path.startsWith("/properties") ||
        path.startsWith("/search")
      );

    case "properties":
      return (
        path === "/" ||
        path.startsWith("/properties") ||
        path.startsWith("/search") ||
        path.startsWith("/projects")
      );

    // Gallery images surface on cards as well as detail pages.
    case "property_images":
      return (
        path === "/" ||
        path.startsWith("/properties") ||
        path.startsWith("/search")
      );

    // Specs only ever render on a property detail page.
    case "property_specs":
      return /^\/properties\/[^/]+$/.test(path);

    // Never announced publicly; refuse defensively even if one arrives.
    case "admin_profiles":
    case "enquiries":
      return false;
  }
}

/**
 * Admin routes are narrower than public ones because every admin list is
 * uncached and already re-read on each request — the bridge only needs to
 * trigger that re-read on the screens that display the changed dataset.
 */
export function adminRouteNeeds(dataset: Dataset, pathname: string): boolean {
  const isOverview = pathname === "/dashboard-admin";

  switch (dataset) {
    // Name and avatar render in the shell on every admin screen.
    case "admin_profiles":
      return true;

    case "site_settings":
      return pathname.startsWith("/dashboard-admin/settings") || isOverview;

    case "projects":
      return (
        isOverview ||
        pathname.startsWith("/dashboard-admin/projects") ||
        pathname.startsWith("/dashboard-admin/properties")
      );

    case "properties":
    case "property_images":
    case "property_specs":
      return isOverview || pathname.startsWith("/dashboard-admin/properties");

    case "enquiries":
      return isOverview || pathname.startsWith("/dashboard-admin/enquiries");
  }
}
