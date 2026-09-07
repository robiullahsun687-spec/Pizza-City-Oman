import { MenuItem, HeroBanner, Branch } from "../types";

export const LOGO_ALT = "Pizza City Oman — Handcrafted Oven-Baked Pizza";

function customAlt(value?: string): string | undefined {
  const clean = (value || "").trim();
  return clean ? clean : undefined;
}

/** Collapse newlines/extra spaces and cap ingredient snippets for readable alt text. */
function snippet(text: string | undefined, maxLen: number): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Menu dish photo. Prefers admin custom text, else name + ingredients + brand. */
export function getMenuItemAltText(item: MenuItem): string {
  const custom = customAlt(item.altText);
  if (custom) return custom;
  const ingredients = snippet(item.description, 80);
  return ingredients
    ? `${item.name} with ${ingredients} — Pizza City Oman`
    : `${item.name} — Pizza City Oman`;
}

/** Marketing banner. Never the slogan alone — always anchored with brand context. */
export function getBannerAltText(banner: HeroBanner): string {
  const custom = customAlt(banner.altText);
  if (custom) return custom;
  return `${banner.title} — pizza offer at Pizza City Oman`;
}

/** Branch photo. Short geo (outlet + city), no street address. */
export function getBranchAltText(branch: Branch): string {
  const custom = customAlt(branch.altText);
  if (custom) return custom;
  const place = branch.geo || branch.name;
  return `Pizza City ${branch.name} outlet in ${place}, Oman`;
}

/** Category thumbnail (shows a dish photo, labelled by category). */
export function getCategoryAltText(label: string): string {
  return `${label} at Pizza City Oman`;
}
