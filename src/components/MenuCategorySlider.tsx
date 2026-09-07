import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MenuItem } from "../types";
import { isFeatured } from "../lib/menuSelectors";
import { getCategoryAltText } from "../lib/altText";

export const VISUAL_CATEGORIES = [
  {
    id: "all",
    label: "All Items",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "featured",
    label: "Featured",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "combo",
    label: "Combo",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "pizza",
    label: "Pizzas",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "sides",
    label: "Sides & Appetizers",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "drinks",
    label: "Cold Drinks",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "dessert",
    label: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
  },
];

interface MenuCategorySliderProps {
  menuItems: MenuItem[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
}

/** Visual category cards slider — shared by the menu page and the homepage. */
export default function MenuCategorySlider({ menuItems, selectedId, onSelect }: MenuCategorySliderProps) {
  const visualSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkVisualScroll = () => {
    const el = visualSliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkVisualScroll();
  }, [menuItems]);

  const scrollVisualSlider = (dir: 1 | -1) => {
    const el = visualSliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <div className="relative my-2 sm:my-3 group/vslider">
      {/* Minimal medium left-aligned header */}
      <h3 className="text-left font-medium text-sm sm:text-base tracking-wide text-gray-700 dark:text-gray-300 mb-2.5">
        Your favourite cuisines
      </h3>
      {canScrollLeft && (
        <button
          onClick={() => scrollVisualSlider(-1)}
          className="absolute -left-2 top-[40%] -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div
        ref={visualSliderRef}
        onScroll={checkVisualScroll}
        className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity py-2 px-1"
      >
        {VISUAL_CATEGORIES.map((cat) => {
          const isSelected = selectedId === cat.id;
          const catItem = menuItems.find(
            (it) => (cat.id === "all" ? true : cat.id === "featured" ? isFeatured(it) : it.category === cat.id) && it.image
          );
          const bgImg = catItem?.image || cat.image;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="flex flex-col items-center shrink-0 snap-start group/card cursor-pointer focus:outline-none"
            >
              <div
                className={`w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 transition-all duration-300 overflow-hidden relative ${isSelected
                    ? "bg-gradient-to-tr from-[var(--pc-red-500)] to-[var(--pc-amber-400)] shadow-lg shadow-[var(--pc-red-500)]/30 scale-105"
                    : "bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 hover:bg-gray-200/60 dark:hover:bg-white/10 hover:scale-[1.03]"
                  }`}
              >
                <div className="w-full h-full rounded-[12px] sm:rounded-[20px] overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <img
                      src={bgImg}
                      alt={getCategoryAltText(cat.label)}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
              </div>

              <span
                className={`mt-1.5 sm:mt-2 text-[11px] sm:text-xs md:text-sm font-black tracking-wide transition-colors ${isSelected
                    ? "text-[var(--pc-red-500)] dark:text-[var(--pc-amber-400)]"
                    : "text-gray-700 dark:text-gray-300 group-hover/card:text-[var(--pc-red-500)] dark:group-hover/card:text-amber-400"
                  }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scrollVisualSlider(1)}
          className="absolute -right-2 top-[40%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
