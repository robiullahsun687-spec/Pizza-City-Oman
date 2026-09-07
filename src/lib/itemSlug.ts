import { MenuItem } from "../types";

function toSlug(name: string): string {
  return (name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function idSuffix(id: unknown): string {
  return String(id ?? "")
    .slice(-6)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Shareable slug for a menu item: name + short id suffix.
 * Names alone can collide; raw ids are unshareable — this gives both.
 * Example: "sea-food-pizza-a1b2c3"
 */
export function itemSlug(item: MenuItem): string {
  const base = toSlug(item.name) || "item";
  const suffix = idSuffix((item as { _id?: unknown })._id);
  return suffix ? `${base}-${suffix}` : base;
}

/** Find an item by full slug, with tolerance for bare name-slug or raw id. */
export function findItemBySlug(items: MenuItem[], slug: string): MenuItem | null {
  if (!slug) return null;
  const clean = slug.toLowerCase();
  return (
    items.find((item) => itemSlug(item) === clean) ||
    items.find((item) => toSlug(item.name) === clean) ||
    items.find((item) => String((item as { _id?: unknown })._id || "").toLowerCase() === clean) ||
    null
  );
}

/** Item + related items for detail views (same category first, then the rest). */
export function getItemDetailData(items: MenuItem[], slug: string): {
  item: MenuItem | null;
  related: MenuItem[];
} {
  const item = findItemBySlug(items, slug);
  if (!item) return { item: null, related: [] };
  const sameCat = items.filter((it) => it._id !== item._id && it.category === item.category);
  const others = items.filter((it) => it._id !== item._id && it.category !== item.category);
  return { item, related: [...sameCat, ...others] };
}
