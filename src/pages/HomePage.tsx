import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, MapPin, Rocket, Star, ChefHat, Leaf, MessageCircle, ChevronLeft, ChevronRight, BadgePercent } from "lucide-react";
import BannerSlider from "../components/BannerSlider";
import { useLocation, useNavigate } from "react-router-dom";
import { itemSlug } from "../lib/itemSlug";
import HomeCategorySection from "../components/home/HomeCategorySection";
import MenuCategorySlider from "../components/MenuCategorySlider";
import HomeReviews from "../components/home/HomeReviews";
import HomeLocationChips from "../components/home/HomeLocationChips";
import { HeroBanner, MenuItem, Branch } from "../types";
import { getFeaturedItems, getCategoryItems } from "../lib/menuSelectors";
import { getBannerAltText } from "../lib/altText";
import MediaRenderer from "../components/MediaRenderer";

interface HomePageProps {
  banners: HeroBanner[];
  isLoadingBanners: boolean;
  setActiveTab: (tab: "home" | "menu" | "track" | "loc" | "contact" | "faq" | "admin") => void;
  displayToast: (msg: string) => void;
  onOpenOutletSelector?: () => void;
  menuItems?: MenuItem[];
  isLoadingMenu?: boolean;
  branches?: Branch[];
  onAddToCart?: (item: MenuItem) => void;
  setMenuFilter?: (f: string) => void;
}

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const HERO_DETAILS = {
  crust: {
    title: "🌾 48-Hour Signature Sourdough",
    description: "Our signature crust undergoes a slow cold fermentation for 48 hours for maximum bubble structure, crisp golden oven-baked crown, and perfect light digestibility.",
    stats: [{ label: "Crispiness Factor", value: 96 }, { label: "Fermentation Depth", value: 98 }, { label: "Golden Oven Bake", value: 95 }],
    emoji: "🌾",
    colorClass: "text-[var(--pc-red-500)] bg-[var(--pc-red-500)]/5 border-[var(--pc-red-500)]/10"
  },
  sauce: {
    title: "🍅 Orchard-Sweet San Marzano",
    description: "Crushed imported low-acidity sun-drenched Italian San Marzano tomatoes, premium sea salt, and a pinch of cold-pressed virgin olive oil.",
    stats: [{ label: "Natural Sweetness", value: 94 }, { label: "Umami Power", value: 90 }, { label: "Basil Infusion", value: 88 }],
    emoji: "🍅",
    colorClass: "text-[var(--pc-amber-400)] bg-[var(--pc-amber-400)]/5 border-[var(--pc-amber-400)]/10"
  },
  cheese: {
    title: "🧀 Premium Stretch Omani Milk Mozzarella",
    description: "High-moisture whole milk fior di latte, hand-shaped daily by Omani cheese-smiths for the absolute ultimate golden melt pull.",
    stats: [{ label: "Melt & Stretch Pull", value: 99 }, { label: "Buttery Dairy Depth", value: 94 }, { label: "Toasty Crust Bubble", value: 91 }],
    emoji: "🧀",
    colorClass: "text-amber-600 bg-amber-500/5 border-amber-500/10"
  }
};

export default function HomePage({ banners, isLoadingBanners, setActiveTab, displayToast, onOpenOutletSelector, menuItems = [], isLoadingMenu = false, branches = [], onAddToCart, setMenuFilter }: HomePageProps) {
  const [activeHeroTab, setActiveHeroTab] = useState<"crust" | "sauce" | "cheese">("crust");
  const [pizzaRotation, setPizzaRotation] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = onAddToCart || (() => setActiveTab("menu"));

  // Card tap → item quick-view (modal over homepage, shareable URL)
  const openQuickView = (item: MenuItem) => {
    navigate(`/menu/${itemSlug(item)}`, { state: { backgroundLocation: location } });
  };

  // Category slider is linked with the menu page: pick a category -> open /menu filtered to it.
  const handleCategorySelect = (catId: string) => {
    if (setMenuFilter) setMenuFilter(catId);
    navigate("/menu");
  };

  // Same predicates as the menu page (lib/menuSelectors) — including
  // unavailable items, so homepage teasers can never mismatch /menu.
  const itemsByCategory = useMemo(() => {
    return {
      featured: getFeaturedItems(menuItems).slice(0, 6),
      combo: getCategoryItems(menuItems, "combo").slice(0, 6),
      pizza: getCategoryItems(menuItems, "pizza").slice(0, 6),
      sides: getCategoryItems(menuItems, "sides").slice(0, 6),
      drinks: getCategoryItems(menuItems, "drinks").slice(0, 6),
      dessert: getCategoryItems(menuItems, "dessert").slice(0, 6),
    };
  }, [menuItems]);

  const showMenuTeasers = isLoadingMenu || menuItems.length > 0;

  const handleOfferClick = (offer: HeroBanner) => {
    if (offer.buttonLink) {
      // Legacy "#menu" / "#locations" banner links -> route navigation
      if (offer.buttonLink.startsWith("#")) {
        const key = offer.buttonLink.replace("#", "");
        const map: Record<string, "home" | "menu" | "track" | "loc" | "contact" | "faq"> = {
          home: "home", menu: "menu", track: "track", locations: "loc", loc: "loc", contact: "contact", faq: "faq",
        };
        setActiveTab(map[key] || "menu");
        return;
      }
      if (offer.buttonLink.startsWith("http")) {
        window.location.href = offer.buttonLink;
      } else if (offer.buttonLink.startsWith("/")) {
        window.location.href = offer.buttonLink;
      } else {
        setActiveTab("menu");
      }
    } else {
      setActiveTab("menu");
    }
  };

  const offerBanners = banners.filter(b => b.type === "offer" || b.type === "all" || !b.type);

  const offersTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = offersTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>(".offer-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("offer-card-focused", entry.isIntersecting);
        });
      },
      { root: track, threshold: 0.6 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [offerBanners, isLoadingBanners]);

  const scrollOffers = (dir: 1 | -1) => {
    const track = offersTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * (track.clientWidth * 0.43 + 16), behavior: "smooth" });
  };

  return (
    <div className="pb-3">
      {/* Primary Semantic H1 for Search Engines & Screen Readers */}
      <h1 className="sr-only">Pizza City Oman — Handcrafted Oven-Baked Pizza, Sourdough Crust &amp; Online Delivery</h1>

      {/* Dynamic Web Banners Hero Gallery */}
      {/* Mobile: full-bleed behind dark translucent navbar; Desktop: contained with rounded corners */}
      <div className="pt-14 md:pt-10 md:container md:mx-auto md:px-0 md:pt-auto">
        <div className="w-full md:rounded-3xl overflow-hidden">
          <BannerSlider 
            banners={banners.filter(b => b.type === "hero" || b.type === "all" || !b.type)}
            isLoading={isLoadingBanners}
            onOrderNow={() => setActiveTab("menu")}
          />
        </div>
      </div>

      {/* Hero section (Legacy fallback) */}
      <section className="hidden container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-12 left-10 text-3xl opacity-20">🌿</motion.div>
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-24 left-1/3 text-3xl opacity-20">🍅</motion.div>
          <motion.div animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-1/2 left-2/3 text-3xl opacity-20">🫒</motion.div>
          <motion.div animate={{ y: [0, -25, 0], rotate: [0, 12, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-24 left-1/2 text-2xl opacity-15">🍄</motion.div>
        </div>

        <motion.div variants={heroContainerVariants} initial="hidden" animate="visible" className="md:col-span-7 space-y-6">
          <motion.div variants={heroItemVariants} className="inline-flex items-center gap-2 text-xs font-black uppercase text-[var(--pc-amber-400)] bg-[var(--pc-amber-400)]/10 px-3.5 py-1.5 rounded-full">
            🍕 Handcrafted · Premium · Delivered Fast
          </motion.div>
          <motion.h2 variants={heroItemVariants} className="font-playfair font-black text-4xl sm:text-5xl lg:text-6xl text-[var(--pc-gray-700)] leading-tight">
            The Art of the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pc-red-500)] to-[var(--pc-amber-400)] hover:brightness-110 transition-all duration-300">Perfect Slice</span> <br />
            Starts Here.
          </motion.h2>
          <motion.p variants={heroItemVariants} className="text-[var(--pc-gray-500)] text-base md:text-lg leading-relaxed max-w-xl">
            Handcrafted oven-baked pizzas, hand-kneaded signature sourdough bases, and premium Omani ingredients. Place an order directly onto the database with instant WhatsApp notification routing!
          </motion.p>

          <motion.div variants={heroItemVariants} className="bg-white rounded-3xl border border-[var(--pc-red-500)]/10 p-5 shadow-sm max-w-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--pc-gray-500)]">Ingredient Spotlight</span>
              <div className="flex gap-1">
                {(["crust", "sauce", "cheese"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveHeroTab(tab);
                      displayToast(`✨ Spotlight updated: ${HERO_DETAILS[tab].title}`);
                    }}
                    className={`text-xs font-black capitalize px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeHeroTab === tab ? "bg-[var(--pc-red-500)] text-white border-transparent shadow-xs" : "bg-gray-50 text-[var(--pc-gray-500)] border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeHeroTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-playfair font-black text-base text-[var(--pc-gray-700)] flex items-center gap-1.5">{HERO_DETAILS[activeHeroTab].title}</h4>
                  <p className="text-xs text-[var(--pc-gray-500)] leading-relaxed">{HERO_DETAILS[activeHeroTab].description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {HERO_DETAILS[activeHeroTab].stats.map((stat, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-[var(--pc-gray-700)]">
                        <span className="truncate">{stat.label}</span>
                        <span className="text-[var(--pc-red-500)]">{stat.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stat.value}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[var(--pc-red-500)] to-[var(--pc-amber-400)] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
            <button onClick={() => setActiveTab("menu")} className="px-8 py-4 bg-gradient-to-r from-[var(--pc-red-500)] to-[var(--pc-amber-400)] text-white rounded-full font-bold shadow-lg shadow-[var(--pc-red-500)]/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer">
              <ShoppingCart size={18} /> View Full Menu
            </button>
            <button onClick={() => setActiveTab("loc")} className="px-8 py-4 border-2 border-[var(--pc-red-500)] text-[var(--pc-red-500)] rounded-full font-bold hover:bg-[var(--pc-red-500)] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer">
              <MapPin size={18} /> Select Outlet Location
            </button>
          </motion.div>
        </motion.div>

        <div className="md:col-span-5 relative w-full aspect-square max-w-md mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--pc-red-500)]/20 to-[var(--pc-amber-400)]/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-0 z-10 pointer-events-none">
            <motion.div animate={{ y: [0, -8, 0], x: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-6 right-6 text-3xl bg-white/90 p-2 rounded-full border border-[var(--pc-red-500)]/10 shadow-sm flex items-center justify-center">🌶️</motion.div>
            <motion.div animate={{ y: [0, 8, 0], x: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-1/3 -left-2 text-2xl bg-white/90 p-2 rounded-full border border-[var(--pc-red-500)]/10 shadow-sm flex items-center justify-center">🌿</motion.div>
            <motion.div animate={{ y: [0, -6, 0], x: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-10 right-2 text-2xl bg-white/90 p-2 rounded-full border border-[var(--pc-red-500)]/10 shadow-sm flex items-center justify-center">🧀</motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} className="relative w-[90%] h-[90%] p-3 bg-white rounded-[48px] border border-[var(--pc-red-500)]/10 shadow-2xl overflow-hidden cursor-pointer group" onClick={() => { setPizzaRotation(prev => prev + 90); displayToast("🍕 Smooth rotational spin activated!"); }}>
            <motion.img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85" alt="Tasty Italian Margherita Pizza" animate={{ rotate: pizzaRotation }} whileHover={{ rotate: pizzaRotation + 45 }} transition={{ type: "spring", stiffness: 80, damping: 14 }} className="w-full h-full object-cover rounded-[38px] select-none" />
            <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] uppercase font-black tracking-widest text-[var(--pc-gray-700)] bg-white/95 px-3 py-1.5 rounded-full shadow-sm border border-gray-100">👆 Click to spin oven base</span>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-2 -left-2 bg-white p-4 rounded-2xl flex items-center gap-3 border border-[var(--pc-red-500)]/10 shadow-xl max-w-xs z-20">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs font-black text-[var(--pc-gray-700)]">Continuous Hot Oven</p>
              <p className="text-[10px] text-[var(--pc-gray-500)]">Fresh &amp; oven-baked hot</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Teaser bar — daylight: warm cream; midnight: dark (via CSS) */}
      <section className="stats-section">
        {/* Divider line */}
        <div className="stats-divider" />

        {/* Inner wrapper */}
        <div className="stats-teaser-pad stats-section__inner">

          {/* Stats grid — single row on mobile, 2×2 on desktop */}
          <div className="stats-grid">
            {[
              { icon: Rocket, color: "var(--pc-amber-400)", number: "30", suffix: "Min", label: "Delivery Guarantee" },
              { icon: MapPin, color: "var(--pc-amber-400)", number: "9",  suffix: "",    label: "Outlets Across Oman" },
              { icon: Star,   color: "var(--pc-amber-400)", number: "150", suffix: "+",  label: "5-Star Reviews" },
              { icon: ChefHat,color: "var(--pc-red-500)",    number: "30", suffix: "+",   label: "Menu Items" },
            ].map(({ icon: IconComponent, number, suffix, label }) => (
              <div
                key={label}
                className="stats-card"
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Icon — daylight: brand red via CSS; midnight: amber/red via CSS */}
                <IconComponent className={`stats-card-icon${IconComponent === ChefHat ? " stats-card-icon--red" : ""}`} size={26} aria-hidden="true" />

                {/* Number + suffix */}
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                  <span className="stats-number">
                    {number}
                  </span>
                  {suffix && (
                    <span className="stats-suffix">
                      {suffix}
                    </span>
                  )}
                </span>

                {/* Label */}
                <p className="stats-label">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Outlet location chips — endless left-to-right marquee */}
          <div
            className="stats-marquee"
            style={{
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {(() => {
              // Dynamic outlet chips from /api/branches — no hardcoded list
              // (previously included "Baraka", which is not a real outlet).
              const chips = (branches || []).filter(b => b.isActive !== false).map(b => b.name);
              const render = (ariaHidden: boolean) =>
                chips.map((chip) => (
                  <span
                    key={chip}
                    aria-hidden={ariaHidden || undefined}
                    className="outlet-chip"
                  >
                    <MapPin size={12} style={{ color: "var(--pc-amber-400)" }} aria-hidden="true" />
                    {chip}
                  </span>
                ));
              return (
                <div className="location-marquee" style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
                  {render(false)}
                  {render(true)}
                </div>
              );
            })()}
          </div>

          {/* Bottom micro strip */}
          <div
            className="stats-strip"
          >
            <span className="stats-strip__text">
              <Leaf size={14} className="stats-strip__icon" aria-hidden="true" />
              100% Fresh Ingredients
            </span>
            <span className="stats-strip__text">
              Order via WhatsApp <MessageCircle size={14} className="stats-strip__icon" aria-hidden="true" />
            </span>
          </div>

        </div>
      </section>

      {/* Special Offers — Peek Carousel Section */}
      <section className="container mx-auto px-4 md:px-8 space-y-6 mt-12 md:mt-16">
        <div className="border-b border-gray-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--pc-amber-400)]">Limited-Time Deals</span>
              <span className="text-[10px] bg-[var(--pc-red-500)]/10 text-[var(--pc-red-500)] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Promo codes</span>
            </div>
            <h3 className="font-playfair font-black text-2xl md:text-3xl text-[var(--pc-gray-700)] flex items-center gap-2">
              <BadgePercent size={26} className="text-[var(--pc-amber-400)]" aria-hidden="true" />
              <span>Special Offers &amp; Promos</span>
            </h3>
            <p className="text-sm text-[var(--pc-gray-500)] max-w-xl font-medium">Explore our top offers below.</p>
          </div>
        </div>

        {isLoadingBanners ? (
          <div className="flex gap-4 overflow-hidden" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[85%] sm:w-[43%] h-48 sm:h-60 lg:h-[340px] shrink-0 rounded-3xl animate-pulse bg-gray-200/20" />
            ))}
          </div>
        ) : offerBanners.length === 0 ? (
          <div className="w-full text-center py-12 space-y-3">
            <span className="text-3xl block">🏷️</span>
            <p className="text-sm font-black text-[var(--pc-gray-700)]">No active offers</p>
            <p className="text-xs text-[var(--pc-gray-500)]">Check our Instagram for daily flash sales!</p>
          </div>
        ) : (
          <div className="relative -mx-4 md:-mx-8">
            <button
              type="button"
              onClick={() => scrollOffers(-1)}
              aria-label="Previous offers"
              className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollOffers(1)}
              aria-label="Next offers"
              className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>

            <div
              ref={offersTrackRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 md:px-8 scroll-px-4 md:scroll-px-8 pb-2"
            >
              {offerBanners.map((offer, i) => (
                <motion.div
                  key={offer._id ?? i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                  className="shrink-0 w-[85%] sm:w-[43%] snap-start"
                >
                  <button
                    type="button"
                    onClick={() => handleOfferClick(offer)}
                    aria-label={offer.title}
                    className="offer-card w-full h-48 sm:h-60 lg:h-[340px] rounded-3xl overflow-hidden border border-white/10 shadow-sm hover:shadow-xl hover:border-white/20 cursor-pointer relative bg-[var(--pc-gray-900)] group/card"
                  >
                    <MediaRenderer
                      src={offer.image}
                      alt={getBannerAltText(offer)}
                      className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      width={800}
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Menu category slider — same section as the menu page, linked through to /menu */}
      {showMenuTeasers && (
        <div className="container mx-auto px-4 md:px-8 mt-8 md:mt-12">
          <MenuCategorySlider
            menuItems={menuItems}
            selectedId="all"
            onSelect={handleCategorySelect}
          />
        </div>
      )}

      {/* Menu by category — 6 items on desktop (2 full rows), 3 on mobile + View All (plain /menu) */}
      {showMenuTeasers && (
        <>
          <HomeCategorySection
            id="home-cat-featured"
            title="Featured Items"
            subtitle="Our most-loved picks — limited-time favourites."
            items={itemsByCategory.featured}
            isLoading={isLoadingMenu}
            onOrder={handleAddToCart}
            onQuickView={openQuickView}
            displayToast={displayToast}
          />
          <HomeCategorySection
            id="home-cat-combo"
            title="Combo Deals"
            subtitle="More food, smarter OMR value for groups."
            items={itemsByCategory.combo}
            isLoading={isLoadingMenu}
            onOrder={handleAddToCart}
            onQuickView={openQuickView}
            displayToast={displayToast}
          />
          <HomeCategorySection
            id="home-cat-pizza"
            title="Handcrafted Pizzas"
            subtitle="48-hour sourdough, oven-baked hot."
            items={itemsByCategory.pizza}
            isLoading={isLoadingMenu}
            onOrder={handleAddToCart}
            onQuickView={openQuickView}
            displayToast={displayToast}
          />
          <HomeCategorySection
            id="home-cat-sides"
            title="Savoury Sides & Appetizers"
            subtitle="Garlic bread, wings and more to start."
            items={itemsByCategory.sides}
            isLoading={isLoadingMenu}
            onOrder={handleAddToCart}
            onQuickView={openQuickView}
            displayToast={displayToast}
          />
          <HomeCategorySection
            id="home-cat-drinks"
            title="Ice Cold Drinks & Revivers"
            subtitle="Chilled drinks to go with every slice."
            items={itemsByCategory.drinks}
            isLoading={isLoadingMenu}
            onOrder={handleAddToCart}
            onQuickView={openQuickView}
            displayToast={displayToast}
          />
          <HomeCategorySection
            id="home-cat-dessert"
            title="Heavenly Sweet Finishes"
            subtitle="Desserts to close the meal right."
            items={itemsByCategory.dessert}
            isLoading={isLoadingMenu}
            onOrder={handleAddToCart}
            onQuickView={openQuickView}
            displayToast={displayToast}
          />
        </>
      )}

      {/* Demo Omani reviews */}
      <HomeReviews id="home-reviews" />

      {/* Location chips from branches API */}
      <HomeLocationChips branches={branches} id="home-locations" />
    </div>
  );
}
