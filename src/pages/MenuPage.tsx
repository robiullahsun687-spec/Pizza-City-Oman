import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Flame, ChefHat, Wine, Cookie, Sparkles, Star } from "lucide-react";
import { MenuItem } from "../types";
import MenuCardGrid from "../components/MenuCardGrid";

interface MenuPageProps {
  menuItems: MenuItem[];
  isLoadingMenu: boolean;
  menuFilter: string;
  setMenuFilter: (f: string) => void;
  addToCart: (item: MenuItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  navHidden: boolean;
}

const FILTERS = [
  
  { id: "all", label: "All Categories", short: "All", icon: Sparkles },
  { id: "featured", label: "Featured", short: "Featured", icon: Star },
  { id: "pizza", label: "Pizzas", short: "Pizzas", icon: Flame },
  { id: "sides", label: "Sides & Appetizers", short: "Sides", icon: ChefHat },
  { id: "drinks", label: "Cold Drinks", short: "Drinks", icon: Wine },
  { id: "dessert", label: "Desserts", short: "Desserts", icon: Cookie },
];

const CATEGORY_LABELS: Record<string, string> = {
  featured: "Featured Items & Combos",
  pizza: "Wood-Fired Pizzas",
  sides: "Savoury Sides & Appetizers",
  drinks: "Ice Cold Drinks & Revivers",
  dessert: "Heavenly Sweet Finishes",
  combo: "Combo Deals",
};

const CATEGORY_ORDER = ["featured", "combo", "pizza", "sides", "drinks", "dessert"];

export default function MenuPage({ menuItems, isLoadingMenu, menuFilter, setMenuFilter, addToCart, searchQuery, onSearchChange, navHidden }: MenuPageProps) {
  const [activeTab, setActiveTab] = useState(menuFilter);

  useEffect(() => {
    setActiveTab(menuFilter);
  }, [menuFilter]);

  // Search filter — matches name, description (ingredients), and category
  const searchFilteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return menuItems;
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [menuItems, searchQuery]);

  // Refs so the rail can auto-center whichever chip is active
  const filterRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Scroll spy — automatically tracks the category in view (grouped "all" view)
  useEffect(() => {
    if (menuFilter !== "all") return;

    const sectionIds = [
      "menu-anchor-top",
      ...CATEGORY_ORDER.filter(c => c !== "featured").map(c => `menu-section-${c}`),
    ];
    const entries: Record<string, IntersectionObserverEntry> = {};

    const observer = new IntersectionObserver(
      (allEntries) => {
        allEntries.forEach(e => { entries[e.target.id] = e; });
        let bestId = "";
        let bestRatio = 0;
        for (const id of sectionIds) {
          const r = entries[id]?.intersectionRatio ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (bestId) {
          const tab = bestId === "menu-anchor-top" ? "all" : bestId.replace("menu-section-", "");
          setActiveTab(tab);
        }
      },
      { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5] }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [menuFilter, menuItems]);

  // Auto-center the active chip so it always stays visible (best UX on mobile + desktop)
  useEffect(() => {
    const key = menuFilter === "all" ? activeTab : menuFilter;
    const el = filterRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [menuFilter, activeTab]);

  const scrollToCategory = (catId: string) => {
    if (catId === "all") {
      setMenuFilter("all");
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setMenuFilter(catId);
    const el = document.getElementById(`menu-section-${catId}`) || document.getElementById("menu");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Group items by category for the "all" view
  const filteredItems = menuFilter === "all"
    ? searchFilteredItems
    : menuFilter === "featured"
    ? searchFilteredItems.filter((it) => it.pinnedFeatured)
    : searchFilteredItems.filter((it) => it.category === menuFilter);

  const featuredItems = searchFilteredItems.filter(it => it.pinnedFeatured && it.available !== false);

  const grouped = [
    ...(featuredItems.length > 0 ? [{ id: "featured", label: CATEGORY_LABELS["featured"] || "Featured Items & Combos", items: featuredItems }] : []),
    ...CATEGORY_ORDER.filter(cat => cat !== "featured").map(cat => ({
      id: cat,
      label: CATEGORY_LABELS[cat] || cat,
      items: searchFilteredItems.filter(it => it.category === cat && it.available !== false),
    })).filter(g => g.items.length > 0),
  ];

  const hasSearch = searchQuery.trim().length > 0;

  // Strictly ONE top-seller item per category section
  const bestSellerByCat: Record<string, string> = {};
  CATEGORY_ORDER.filter(c => c !== "featured" && c !== "combo").forEach(cat => {
    const catItems = menuItems.filter(it => it.category === cat && it.available !== false);
    const topSeller = catItems.find(it => it.featured) || catItems[0];
    if (topSeller) {
      bestSellerByCat[cat] = topSeller._id;
    }
  });

  const getBadgeForItem = (item: MenuItem) => {
    if (item._id && bestSellerByCat[item.category] === item._id) {
      return "Best Seller";
    }
    return undefined;
  };

  return (
    <div className="container mx-auto px-2 md:px-8 pb-2 space-y-8 animate-fadeIn overflow-x-clip">
      {/* Sticky Filter Bar */}
      <div className={`sticky z-[35] -mx-2 md:-mx-8 px-4 md:px-8 py-1.5 bg-[var(--menu-bg)]/95 backdrop-blur-md border-b border-white/10 ${navHidden ? "menu-filter-bar--flush" : "menu-filter-bar"}`}>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth overscroll-contain scroll-px-2">
          {FILTERS.map((cat) => {
            const isActiveChip = menuFilter === "all" ? activeTab === cat.id : menuFilter === cat.id;
            const Icon = cat.icon;
            const count = cat.id === "all"
              ? menuItems.filter(it => it.available !== false).length
              : cat.id === "featured"
              ? menuItems.filter(it => (it as any).pinnedFeatured && it.available !== false).length
              : menuItems.filter(it => it.category === cat.id && it.available !== false).length;
            return (
              <button
                key={cat.id}
                ref={(el) => { filterRefs.current[cat.id] = el; }}
                onClick={() => scrollToCategory(cat.id)}
                aria-current={isActiveChip ? "true" : undefined}
                className={`min-h-[40px] md:min-h-0 py-2 px-3.5 md:px-5 font-bold text-sm rounded-full border transition-all flex items-center gap-1.5 md:gap-2 shrink-0 whitespace-nowrap snap-center cursor-pointer ${
                  isActiveChip
                    ? "bg-gradient-to-r from-[var(--menu-red)] to-[var(--menu-amber)] text-white border-transparent shadow-lg shadow-[var(--menu-red)]/30"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} className={isActiveChip ? "text-white" : "text-amber-400/70"} />
                <span className="md:hidden">{cat.short}</span>
                <span className="hidden md:inline">{cat.label}</span>
                <span className={`hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActiveChip ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoadingMenu ? (
        <MenuCardGrid title="" items={[]} onOrder={addToCart} isLoading={true} showHeader={false} />
      ) : hasSearch && menuFilter === "all" && grouped.length === 0 ? (
        /* No search results */
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <Search size={28} className="text-gray-500" />
          </div>
          <p className="text-lg font-bold text-white">No items found</p>
          <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--menu-text-secondary)" }}>
            No results for "<span className="text-amber-400/80 font-medium">{searchQuery}</span>".
            Try searching by name, ingredient (mozzarella, chicken), or category (pizza, drinks).
          </p>
        </div>
      ) : menuFilter === "all" ? (
        /* Grouped view: all categories with scroll spy anchors */
        <section className="menu-section font-body">
          <div className="menu-section__inner">
            <div id="menu-anchor-top" className="text-center space-y-3 mb-12">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full"
                  style={{ color: "var(--menu-amber)", background: "rgba(245, 158, 11, 0.12)" }}
                >
                  Pizza City Menu
                </span>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white tracking-wide leading-tight">
                Our Gourmet Menu
              </h2>
              <p className="text-sm max-w-xl mx-auto font-body" style={{ color: "var(--menu-text-secondary)" }}>
                Hand-made recipes with premium components, wood-fired hot and delivered instantly.
              </p>
            </div>

            {grouped.map((group, index) => (
              <div
                key={group.id}
                id={`menu-section-${group.id}`}
                className={`scroll-mt-32 ${index > 0 ? "mt-12" : ""}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-[var(--menu-red)] to-[var(--menu-amber)] rounded-full flex-shrink-0" />
                  <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-white tracking-wide leading-tight min-w-0">
                    {group.label}
                  </h3>
                  <span className="font-body text-xs sm:text-sm self-end mb-0.5 shrink-0" style={{ color: "var(--menu-text-secondary)" }}>
                    {group.items.length} {group.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <MenuCardGrid
                  showHeader={false}
                  title=""
                  items={group.items}
                  onOrder={addToCart}
                  badge={getBadgeForItem}
                  emptyMessage="No items found in this category."
                  limit={6}
                  isLoading={isLoadingMenu}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Single category view */
        <MenuCardGrid
          title={
            menuFilter === "featured" ? "⭐ Featured Items & Combos"
            : menuFilter === "pizza" ? "Wood-Fired Pizzas"
            : menuFilter === "sides" ? "Savoury Sides & Appetizers"
            : menuFilter === "drinks" ? "Ice Cold Drinks & Revivers"
            : "Heavenly Sweet Finishes"
          }
          items={filteredItems}
          onOrder={addToCart}
          badge={getBadgeForItem}
          emptyMessage={
            hasSearch
              ? `No items match "${searchQuery}" in this category. Try a different search term or category.`
              : "No items found in this category. Try selecting a different filter."
          }
          isLoading={isLoadingMenu}
        />
      )}
    </div>
  );
}
