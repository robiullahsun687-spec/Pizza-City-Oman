import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { MenuItem } from "../types";
import { getDefaultSizes } from "../lib/priceUtils";

interface MenuCardProps {
  item: MenuItem;
  onOrder: (item: MenuItem) => void;
  badge?: string;
  index?: number;
}

export default function MenuCard({ item, onOrder, badge, index = 0 }: MenuCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => setCanExpand(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.description]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = button.getElementsByClassName("ripple")[0];
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  const handleOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleRipple(e);
    onOrder(item);
  };

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOrder(item);
  };

  const badgeLabel = badge ? (badge.startsWith("🔥") ? badge : `🔥 ${badge}`) : null;

  const effectivePrice = (item.discountPrice && item.discountPrice < item.price) ? item.discountPrice : item.price;

  return (
    <article
      ref={cardRef}
      className="menu-card fade-up flex flex-col p-0 shadow-lg shadow-black/40 border border-white/[0.06] rounded-2xl hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 ease-out select-none overflow-hidden"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Image Container with Quick-Add */}
      <div className="relative overflow-hidden group">
        {badgeLabel && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg inline-flex items-center gap-1 leading-none">
              {badgeLabel}
            </span>
          </div>
        )}
        <button
          onClick={handleQuickAdd}
          type="button"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 text-white flex items-center justify-center transition-all shadow-lg active:scale-90 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Quick add ${item.name} to cart`}
          title={`Quick add ${item.name}`}
        >
          <Plus size={18} />
        </button>
        <div className="overflow-hidden">
          <img
            src={item.image || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={item.name}
            className="w-full aspect-[4/3] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col p-4 pt-3.5 flex-1">
        <h2 className="font-playfair font-bold text-xl tracking-wide text-white leading-tight">
          {item.name}
        </h2>

        <p
          ref={descRef}
          className={`text-xs text-gray-400 mt-1 leading-snug whitespace-pre-line ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {item.description || "A delicious handcrafted item from Pizza City."}
        </p>

        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[11px] font-semibold text-amber-400/80 hover:text-amber-400 transition-colors cursor-pointer self-start"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}

        {/* Size Indicator Pills */}
        <div className="flex items-center gap-1.5 mt-2">
          {(item.sizes || getDefaultSizes(item.category)).map((s, i) => (
            <span
              key={s.name}
              className={`inline-flex items-center justify-center w-6 h-5 rounded text-[9px] font-black uppercase tracking-wide border ${
                i === Math.floor((item.sizes || getDefaultSizes(item.category)).length / 2)
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-white/5 text-gray-400 border-white/10"
              }`}
              title={s.label}
            >
              {s.name === "Regular" ? "R" : s.name.charAt(0)}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3.5">
          <div className="flex items-baseline gap-2">
            <span className="font-body text-lg font-bold text-amber-400">
              OMR {effectivePrice.toFixed(2)}
            </span>
            {item.discountPrice !== undefined && item.discountPrice > 0 && item.discountPrice < item.price && (
              <span className="font-body text-[11px] text-gray-500 line-through">
                OMR {item.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleOrder}
            data-ripple
            className="menu-btn menu-btn-primary px-4 py-2 text-[11px] md:text-xs font-bold uppercase tracking-wider cursor-pointer gap-1.5"
            aria-label={`Order ${item.name}`}
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  );
}
