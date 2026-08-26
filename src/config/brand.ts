/**
 * Static brand facts. Sourced from the official SPEC Home Brand Guidelines
 * (2026). Nothing here may assert a claim the guidelines do not support.
 */
export const brand = {
  name: "SPEC Home Properties",
  shortName: "SPEC Home",
  foundedYear: 2026,
  logo: {
    primary: "/images/brand/logo-primary.svg",
    light: "/images/brand/logo-light.svg",
    dark: "/images/brand/logo-dark.svg",
    mark: "/images/brand/logo-mark.svg",
  },
  hero: {
    image: "/images/brand/spec-home-hero.jpg",
    width: 1682,
    height: 943,
  },
  gradient: {
    image: "/images/brand/spec-home-gradient.jpg",
    width: 1672,
    height: 941,
  },
  colors: {
    navy: "#19314B",
    orange: "#FDA412",
    charcoal: "#262626",
    graphite: "#333333",
    mist: "#E5E5E5",
  },
} as const;
