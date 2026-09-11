import React, { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Share2, Check } from "lucide-react";
import { MenuItem } from "../types";
import {
  getDefaultSizes,
  getSizeAdjustedPrice,
  getOptimizedUnitPrice,
  getEffectiveBasePrice,
} from "../lib/priceUtils";
import { getMenuItemAltText } from "../lib/altText";
import MediaRenderer from "./MediaRenderer";
import MenuCard from "./MenuCard";

interface ItemDetailContentProps {
  item: MenuItem;
  related: MenuItem[];
  onAdd: (item: MenuItem, size: string, quantity: number) => void;
  /** Card buttons inside "related" keep the standard configure-modal flow. */
  onConfigure: (item: MenuItem) => void;
  onQuickView?: (item: MenuItem) => void;
  displayToast?: (msg: string) => void;
}

export default function ItemDetailContent({
  item,
  related,
  onAdd,
  onConfigure,
  onQuickView,
  displayToast,
}: ItemDetailContentProps) {
  const isUnavailable = item.available === false;
  const sizes = useMemo(
    () => item.sizes || getDefaultSizes(item.category),
    [item.sizes, item.category]
  );
  const basePrice = getEffectiveBasePrice(item.price, item.discountPrice);
  const [size, setSize] = useState(sizes[0]?.name || "Medium");
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);

  const activeSize = sizes.find((s) => s.name === size) ? size : sizes[0]?.name || "Medium";
  const unitPrice = getOptimizedUnitPrice(basePrice, activeSize, sizes, qty);
  const total = unitPrice * qty;

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    displayToast?.("Link copied — share this dish!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-[20px] overflow-hidden bg-gray-100">
          <MediaRenderer
            src={item.image}
            alt={getMenuItemAltText(item)}
            className="w-full aspect-[4/3] object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--pc-amber-400)]">
                {item.category}
              </span>
              <h2 className="font-playfair font-black text-2xl md:text-3xl text-[var(--pc-color-text-primary-light)]">
                {item.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={share}
              aria-label="Copy link to this dish"
              className="shrink-0 p-2.5 rounded-full border border-gray-200 hover:border-[var(--pc-red-500)] hover:text-[var(--pc-red-500)] transition-colors cursor-pointer"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
            </button>
          </div>

          {isUnavailable ? (
            <span className="inline-block bg-red-600/95 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
              🚫 Out of Stock
            </span>
          ) : (
            item.discountPrice !== undefined &&
            item.discountPrice > 0 &&
            item.discountPrice < item.price && (
              <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-400 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                Save OMR {(item.price - item.discountPrice).toFixed(2)}
              </span>
            )
          )}

          <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--pc-color-text-secondary-light)]">
            {item.description || "A delicious handcrafted item from Pizza City."}
          </p>

          {!isUnavailable && (
            <>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-[var(--pc-color-text-muted-light)]">
                  Size
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((s) => {
                    const price = getSizeAdjustedPrice(basePrice, s.name, sizes);
                    const selected = s.name === activeSize;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setSize(s.name)}
                        className={`min-w-0 px-2 py-2.5 rounded-xl border text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selected
                            ? "bg-[var(--pc-color-primary)] text-white border-transparent shadow-md"
                            : "bg-white border-gray-200 hover:border-[var(--pc-color-primary)] hover:text-[var(--pc-color-primary)]"
                        }`}
                      >
                        {s.label}
                        <span className={`block text-[10px] ${selected ? "text-white/80" : "text-[var(--pc-color-primary)]"}`}>
                          OMR {price.toFixed(3)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-1">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="font-black min-w-[24px] text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    aria-label="Increase quantity"
                    className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--pc-color-text-muted-light)]">Total</p>
                  <p className="font-black text-xl text-[var(--pc-color-primary)]">
                    OMR {total.toFixed(3)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAdd(item, activeSize, qty)}
                className="menu-btn menu-btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={17} /> Add to Cart
              </button>
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-playfair font-black text-xl text-[var(--pc-color-text-primary-light)]">
            You may also like
          </h3>
          <div className="menu-grid">
            {related.slice(0, 3).map((rel, index) => (
              <React.Fragment key={rel._id}>
                <MenuCard
                  item={rel}
                  onOrder={onConfigure}
                  index={index}
                  displayToast={displayToast}
                  onQuickView={onQuickView}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
