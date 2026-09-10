/**
 * CategoryIcon — centralized category → artwork mapping.
 *
 * Playful premium 3D-cartoon food icons in the Pizza City orange/red/yellow
 * language. Pure inline SVG (zero dependencies, no WebGL, no image downloads):
 * gradients + highlight ellipses fake the 3D depth, so it stays fast on
 * lower-end Android devices. transform/opacity-only animation via CSS.
 *
 * Usage: <CategoryIcon category={cat.id} className="..." />
 * The parent button already carries the text label, so art is aria-hidden.
 */

interface CategoryIconProps {
  category: string;
  className?: string;
}

const STAR =
  "M0,-10 L2.9,-3.1 10,-3.1 4.5,1.6 6.5,8.6 0,4.6 -6.5,8.6 -4.5,1.6 -10,-3.1 -2.9,-3.1 Z";

function GroundShadow() {
  return <ellipse cx="32" cy="56" rx="15" ry="3.5" fill="#2A1400" opacity="0.12" />;
}

function AllIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catAllDish" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE9D6" />
        </linearGradient>
        <linearGradient id="catAllCheese" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC93C" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <circle cx="30" cy="30" r="19" fill="url(#catAllDish)" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M30 14 L19 40 Q30 46 41 40 Z" fill="url(#catAllCheese)" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 40 Q30 46 41 40" stroke="#D98A3D" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="27" cy="30" r="2.6" fill="#D72B2B" />
      <circle cx="34" cy="33" r="2.6" fill="#D72B2B" />
      <circle cx="30" cy="37" r="2.2" fill="#D72B2B" />
      <ellipse cx="25" cy="22" rx="3" ry="5" fill="#fff" opacity="0.5" transform="rotate(-20 25 22)" />
      <g transform="translate(47,15)">
        <circle r="8.5" fill="#F59E0B" stroke="#fff" strokeWidth="2" />
        <g transform="scale(0.55)" fill="#fff">
          <path d={STAR} />
        </g>
      </g>
    </svg>
  );
}

function FeaturedIcon() {
  // Crowned signature pizza — "premium pick" without the star shape.
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catFeatGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD968" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="catFeatCheese" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD968" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <circle cx="32" cy="37" r="13" fill="#E8A15C" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="32" cy="37" r="9.5" fill="url(#catFeatCheese)" />
      <circle cx="27.5" cy="34.5" r="2" fill="#D72B2B" />
      <circle cx="34" cy="33.5" r="2" fill="#D72B2B" />
      <circle cx="37" cy="39" r="2" fill="#D72B2B" />
      <circle cx="29.5" cy="40.5" r="2" fill="#D72B2B" />
      <ellipse cx="26.5" cy="31" rx="3" ry="1.8" fill="#fff" opacity="0.45" transform="rotate(-25 26.5 31)" />
      <g transform="translate(32,15) rotate(-8)">
        <path d="M-13 3 L-10 -7 L-5 3 Z" fill="url(#catFeatGold)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M-5 3 L0 -9 L5 3 Z" fill="url(#catFeatGold)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5 3 L10 -7 L13 3 Z" fill="url(#catFeatGold)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="-13" y="3" width="26" height="7" rx="2.5" fill="url(#catFeatGold)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" />
        <circle cx="-10" cy="-7" r="2" fill="#FFD968" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="0" cy="-9" r="2" fill="#FFD968" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="10" cy="-7" r="2" fill="#FFD968" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="0" cy="6.5" r="2.2" fill="#D72B2B" stroke="#fff" strokeWidth="1" />
        <rect x="-9" y="4.5" width="5" height="2" rx="1" fill="#fff" opacity="0.5" />
      </g>
      <path d="M11 16 h5 M13.5 13.5 v5" stroke="#FFE0B2" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 44 h4.5 M52.2 41.8 v4.5" stroke="#FFE0B2" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function ComboIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catComboBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E63939" />
          <stop offset="1" stopColor="#B71F1F" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <rect x="23" y="12" width="5" height="20" rx="2.5" fill="#FFC93C" stroke="#D98A3D" strokeWidth="1.5" transform="rotate(-8 25.5 22)" />
      <rect x="29.5" y="10" width="5" height="22" rx="2.5" fill="#FFD968" stroke="#D98A3D" strokeWidth="1.5" />
      <rect x="36" y="12" width="5" height="20" rx="2.5" fill="#FFC93C" stroke="#D98A3D" strokeWidth="1.5" transform="rotate(8 38.5 22)" />
      <rect x="16" y="30" width="32" height="8" rx="2" fill="#7A1A00" />
      <path d="M16 34 L9 29 L16 28 Z" fill="#E63939" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M48 34 L55 29 L48 28 Z" fill="#E63939" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M41 30 h9 l-1.5 12 h-6 Z" fill="#FFF8F2" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="40" y="27.5" width="11" height="3" rx="1.5" fill="#F26522" />
      <line x1="47" y1="28" x2="49" y2="20" stroke="#D72B2B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 34 h32 v12 a3 3 0 0 1 -3 3 h-26 a3 3 0 0 1 -3 -3 Z" fill="url(#catComboBox)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" />
      <rect x="29" y="34" width="6" height="15" fill="#fff" opacity="0.9" />
      <circle cx="32" cy="41.5" r="3" fill="#FFC93C" />
      <rect x="19" y="36" width="4" height="10" rx="2" fill="#fff" opacity="0.25" />
    </svg>
  );
}

function PizzaIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catPizzaCrust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2C078" />
          <stop offset="1" stopColor="#D98A3D" />
        </linearGradient>
        <linearGradient id="catPizzaCheese" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD968" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <circle cx="32" cy="31" r="19" fill="url(#catPizzaCrust)" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="32" cy="31" r="14" fill="url(#catPizzaCheese)" />
      <circle cx="24" cy="26" r="3" fill="#D72B2B" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="33" cy="23" r="3" fill="#D72B2B" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="40" cy="28" r="3" fill="#D72B2B" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="27" cy="35" r="3" fill="#D72B2B" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="36" cy="36" r="3" fill="#D72B2B" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
      <ellipse cx="30" cy="30" rx="2" ry="1.2" fill="#57A773" transform="rotate(30 30 30)" />
      <ellipse cx="35" cy="31" rx="2" ry="1.2" fill="#57A773" transform="rotate(-20 35 31)" />
      <ellipse cx="24" cy="20" rx="4" ry="2.5" fill="#fff" opacity="0.45" transform="rotate(-25 24 20)" />
    </svg>
  );
}

function SidesIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catSideBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E63939" />
          <stop offset="1" stopColor="#B71F1F" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <rect x="22" y="11" width="4.5" height="22" rx="2.2" fill="#FFC93C" stroke="#D98A3D" strokeWidth="1.25" transform="rotate(-6 24.2 22)" />
      <rect x="27" y="9" width="4.5" height="24" rx="2.2" fill="#FFD968" stroke="#D98A3D" strokeWidth="1.25" />
      <rect x="32" y="9" width="4.5" height="24" rx="2.2" fill="#FFC93C" stroke="#D98A3D" strokeWidth="1.25" transform="rotate(4 34.2 21)" />
      <rect x="37" y="11" width="4.5" height="22" rx="2.2" fill="#FFD968" stroke="#D98A3D" strokeWidth="1.25" transform="rotate(9 39.2 22)" />
      <path d="M21 30 h22 l-2.5 19 a2 2 0 0 1 -2 1.7 h-13 a2 2 0 0 1 -2 -1.7 Z" fill="url(#catSideBox)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="21" y="28" width="22" height="5" rx="2.5" fill="#F26522" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="1.5" />
      <rect x="29.5" y="33" width="5" height="17" fill="#fff" opacity="0.92" />
      <circle cx="32" cy="41.5" r="3.5" fill="#FFC93C" stroke="#fff" strokeWidth="1.2" />
      <circle cx="19" cy="15" r="1.2" fill="#fff" opacity="0.8" />
      <circle cx="45" cy="19" r="1.2" fill="#fff" opacity="0.8" />
    </svg>
  );
}

function DrinksIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catDrinkCup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFD9AE" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <line x1="38" y1="24" x2="43" y2="10" stroke="#D72B2B" strokeWidth="4" strokeLinecap="round" />
      <rect x="22" y="23" width="20" height="4.5" rx="2.25" fill="#F26522" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M23 27.5 h18 l-2 21 a2.5 2.5 0 0 1 -2.5 2.2 h-9 a2.5 2.5 0 0 1 -2.5 -2.2 Z" fill="url(#catDrinkCup)" stroke="#7A1A00" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24.6 34 h14.8 l-.7 8 H25.3 Z" fill="#F59E0B" opacity="0.85" />
      <circle cx="32" cy="38" r="4.5" fill="#7A1A00" />
      <circle cx="32" cy="38" r="1.8" fill="#FFC93C" />
      <circle cx="29" cy="31.5" r="1.3" fill="#fff" opacity="0.7" />
      <circle cx="35" cy="30.5" r="1" fill="#fff" opacity="0.7" />
      <rect x="25.3" y="29" width="2.5" height="14" rx="1.25" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function DessertIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="catDesCup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F26522" />
          <stop offset="1" stopColor="#C24E12" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <path d="M23 34 h18 l-2.2 15 a2 2 0 0 1 -2 1.8 h-9.6 a2 2 0 0 1 -2 -1.8 Z" fill="url(#catDesCup)" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="28.5" y1="36" x2="27.5" y2="49" stroke="#7A1A00" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="35.5" y1="36" x2="36.5" y2="49" stroke="#7A1A00" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="32" cy="34" rx="12" ry="6" fill="#FFF3E8" stroke="#7A1A00" strokeOpacity="0.2" strokeWidth="1.5" />
      <ellipse cx="32" cy="29" rx="9" ry="5" fill="#FFE0C2" stroke="#7A1A00" strokeOpacity="0.2" strokeWidth="1.5" />
      <ellipse cx="32" cy="24.5" rx="6" ry="4" fill="#FFF3E8" stroke="#7A1A00" strokeOpacity="0.2" strokeWidth="1.5" />
      <rect x="26" y="31" width="4" height="1.8" rx="0.9" fill="#F26522" transform="rotate(-20 28 32)" />
      <rect x="34" y="32" width="4" height="1.8" rx="0.9" fill="#57A773" transform="rotate(15 36 33)" />
      <rect x="30" y="26.5" width="4" height="1.8" rx="0.9" fill="#D72B2B" transform="rotate(10 32 27.4)" />
      <line x1="32" y1="20.5" x2="33.5" y2="16" stroke="#57A773" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="32" cy="18.5" r="3.5" fill="#D72B2B" stroke="#7A1A00" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="30.8" cy="17.3" r="1.1" fill="#fff" opacity="0.7" />
      <ellipse cx="27" cy="32" rx="2.5" ry="1.5" fill="#fff" opacity="0.5" />
    </svg>
  );
}

export default function CategoryIcon({ category, className }: CategoryIconProps) {
  const art = (() => {
    switch (category) {
      case "all":
        return <AllIcon />;
      case "featured":
        return <FeaturedIcon />;
      case "combo":
        return <ComboIcon />;
      case "pizza":
        return <PizzaIcon />;
      case "sides":
        return <SidesIcon />;
      case "drinks":
        return <DrinksIcon />;
      case "dessert":
        return <DessertIcon />;
      default:
        return <PizzaIcon />;
    }
  })();

  return (
    <span className={className} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%" }}>
      {art}
    </span>
  );
}
