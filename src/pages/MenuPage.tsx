import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Flame, ChefHat, Wine, Cookie, Sparkles, Star, Layers } from "lucide-react";
import { MenuItem } from "../types";
import { useLocation, useNavigate } from "react-router-dom";
import MenuCardGrid from "../components/MenuCardGrid";
import MenuCategorySlider from "../components/MenuCategorySlider";
import { getFeaturedItems, getCategoryItems } from "../lib/menuSelectors";
import { itemSlug } from "../lib/itemSlug";

interface MenuPageProps {
  menuItems: MenuItem[];
  isLoadingMenu: boolean;
  menuFilter: string;
  setMenuFilter: (f: string) => void;
  addToCart: (item: MenuItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  navHidden: boolean;
  displayToast?: (msg: string) => void;
}

const FILTERS = [
  { id: "all", label: "All Categories", short: "All", icon: Sparkles },
  { id: "featured", label: "Featured", short: "Featured", icon: Star },
  { id: "combo", label: "Combo", short: "Combo", icon: Layers },
  { id: "pizza", label: "Pizzas", short: "Pizzas", icon: Flame },
  { id: "sides", label: "Sides & Appetizers", short: "Sides", icon: ChefHat },
  { id: "drinks", label: "Cold Drinks", short: "Drinks", icon: Wine },
  { id: "dessert", label: "Desserts", short: "Desserts", icon: Cookie },
];

const CATEGORY_LABELS: Record<string, string> = {
  featured: "Featured Items & Combos",
  pizza: "Handcrafted Pizzas",
  sides: "Savoury Sides & Appetizers",
  drinks: "Ice Cold Drinks & Revivers",
  dessert: "Heavenly Sweet Finishes",
  combo: "Combo Deals",
};

const CATEGORY_ORDER = ["featured", "combo", "pizza", "sides", "drinks", "dessert"];

export default function MenuPage({ menuItems, isLoadingMenu, menuFilter, setMenuFilter, addToCart, searchQuery, onSearchChange, navHidden, displayToast }: MenuPageProps) {
  const [activeTab, setActiveTab] = useState(menuFilter);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Card tap → item quick-view (modal over menu, shareable URL)
  const openQuickView = (item: MenuItem) => {
    navigate(`/menu/${itemSlug(item)}`, { state: { backgroundLocation: location } });
  };

  useEffect(() => {
    setActiveTab(menuFilter);
  }, [menuFilter]);

  // Show sticky filter bar only when scrolling down into menu items
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("menu-anchor-top") || document.getElementById("menu");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 120) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const railRef = useRef<HTMLDivElement>(null);

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
      // Offset for sticky bar (bar ~64px + navbar) so spy doesn't flicker under it
      { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5], rootMargin: "-140px 0px -60% 0px" }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [menuFilter, menuItems]);

  // Memoized per-category counts (was 7xN filter on every render)
  const countsByCat = useMemo(() => {
    const counts: Record<string, number> = {};
    const available = menuItems.filter(it => it.available !== false);
    counts.all = available.length;
    counts.featured = getFeaturedItems(available).length;
    for (const c of CATEGORY_ORDER) {
      if (c === "featured") continue;
      counts[c] = available.filter(it => it.category === c).length;
    }
    return counts;
  }, [menuItems]);

  // Auto-center the active chip — skip when chip already fully visible
  // so scroll-spy doesn't fight the user's own swipe (smooth -> no jank)
  useEffect(() => {
    const key = menuFilter === "all" ? activeTab : menuFilter;
    const el = filterRefs.current[key];
    const rail = railRef.current;
    if (!el || !rail) return;
    const railRect = rail.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const fullyVisible = elRect.left >= railRect.left && elRect.right <= railRect.right;
    if (fullyVisible) return;
    rail.scrollTo({
      left: rail.scrollLeft + (elRect.left - railRect.left) - (railRect.width / 2) + (elRect.width / 2),
      behavior: "smooth",
    });
  }, [menuFilter, activeTab]);

  const scrollToCategory = (catId: string) => {
    setShowStickyBar(true);
    setMenuFilter("all");
    setTimeout(() => {
      if (catId === "all") {
        const target = document.getElementById("menu-anchor-top") || document.getElementById("menu");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const el = document.getElementById(`menu-section-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 30);
  };

  // Group items by category for the "all" view (including unavailable items).
  // Predicates live in lib/menuSelectors so the homepage can never drift.
  const filteredItems = menuFilter === "all"
    ? searchFilteredItems
    : menuFilter === "featured"
      ? getFeaturedItems(searchFilteredItems)
      : getCategoryItems(searchFilteredItems, menuFilter);

  const featuredItems = getFeaturedItems(searchFilteredItems);

  const grouped = [
    ...(featuredItems.length > 0 ? [{ id: "featured", label: CATEGORY_LABELS["featured"] || "Featured Items & Combos", items: featuredItems }] : []),
    ...CATEGORY_ORDER.filter(cat => cat !== "featured").map(cat => ({
      id: cat,
      label: CATEGORY_LABELS[cat] || cat,
      items: getCategoryItems(searchFilteredItems, cat),
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
    <div className="container mx-auto px-2 md:px-8 pb-2 animate-fadeIn overflow-x-clip">
      {/* Sticky Filter Bar — hidden until user scrolls down into menu items */}
      <div
        className={`sticky z-[35] -mx-2 md:-mx-8 transition-all duration-300 ease-out ${navHidden ? "menu-filter-bar--flush" : "menu-filter-bar"
          } ${showStickyBar
            ? "px-3 md:px-8 py-2 opacity-100 pointer-events-auto translate-y-0 max-h-24 mb-3"
            : "px-0 py-0 opacity-0 pointer-events-none -translate-y-4 max-h-0 overflow-hidden border-none shadow-none mb-0"
          }`}
      >
        <div ref={railRef} className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-smooth overscroll-contain py-1 px-1">
          {FILTERS.map((cat) => {
            const isActiveChip = menuFilter === "all" ? activeTab === cat.id : menuFilter === cat.id;
            const Icon = cat.icon;
            const count = countsByCat[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                ref={(el) => { filterRefs.current[cat.id] = el; }}
                onClick={() => scrollToCategory(cat.id)}
                aria-current={isActiveChip ? true : undefined}
                aria-pressed={isActiveChip}
                title={cat.label}
                className={`menu-chip${isActiveChip ? " menu-chip--active" : ""}`}
              >
                <span className="menu-chip__icon" aria-hidden="true">
                  <Icon size={15} />
                </span>
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.short}</span>
                <span className="menu-chip__count">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Static Visual Category Cards Slider (Screenshot Style) */}
      <MenuCategorySlider menuItems={menuItems} selectedId={menuFilter} onSelect={scrollToCategory} />

      {isLoadingMenu ? (
        <MenuCardGrid title="" items={[]} onOrder={addToCart} isLoading={true} showHeader={false} />
      ) : hasSearch && menuFilter === "all" && grouped.length === 0 ? (
        /* No search results — outside dark .menu-section, so use light-theme tokens */
        <div className="menu-empty text-center py-20 space-y-4">
          <div className="menu-empty__icon w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Search size={28} />
          </div>
          <p className="menu-empty__title text-lg font-bold">No items found</p>
          <p className="menu-empty__desc text-sm max-w-xs mx-auto">
            No results for "<span className="font-medium">{searchQuery}</span>".
            Try searching by name, ingredient (mozzarella, chicken), or category (pizza, drinks).
          </p>
        </div>
      ) : menuFilter === "all" ? (
        /* Grouped view: all categories with scroll spy anchors */
        <section className="menu-section font-body">
          <div className="menu-section__inner">
            <div id="menu-anchor-top" className="text-center space-y-2 mb-6 md:mb-8 pt-1">
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
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-wide leading-tight">
                Our Gourmet Menu
              </h2>
              <p className="text-xs sm:text-sm max-w-xl mx-auto font-body opacity-80" style={{ color: "var(--menu-text-secondary)" }}>
                Hand-made recipes with premium components, oven-baked hot and delivered instantly.
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
                  displayToast={displayToast}
                  onQuickView={openQuickView}
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
              : menuFilter === "pizza" ? "Handcrafted Pizzas"
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
          displayToast={displayToast}
          onQuickView={openQuickView}
        />
      )}
    </div>
  );
}
