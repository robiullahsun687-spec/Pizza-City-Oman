import React, { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu as MenuIcon, X, ShoppingCart, MapPin, Lock, Sun, Flame, ShoppingBag, Search, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import OutletSelector from "./components/OutletSelector";
import OrderTracker from "./components/OrderTracker";
import Loader from "./components/Loader";

// Pages
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import LocationsPage from "./pages/LocationsPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import AdminPage from "./pages/AdminPage";
import LocationDetailPage from "./pages/LocationDetailPage";

// Types & Utils
import { MenuItem, CartEntry, HeroBanner, Branch } from "./types";
import { getEffectiveBasePrice, getOptimizedUnitPrice, getSizeAdjustedPrice, getDefaultSizes } from "./lib/priceUtils";
import type { MenuItemSize } from "./lib/priceUtils";
import { SOCIAL_LINKS } from "./lib/socialLinks";

const CART_STORAGE_KEY = "pizza_city_cart";

function loadCartFromStorage(): CartEntry[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e: any) =>
        e &&
        typeof e === "object" &&
        e.item &&
        typeof e.quantity === "number" &&
        e.quantity > 0 &&
        typeof e.size === "string" &&
        typeof e.unitPrice === "number"
    );
  } catch {
    return [];
  }
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isAdminRoute = currentPath === "/admin";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [navHidden, setNavHidden] = useState(false);
  // Navbar adopts the full-width category-bar look when it's over the menu section
  const isBarAttached = activeSection === "menu";
  const prevScrollY = useRef(0);

  // Global Theme Selection
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pizza_city_theme") === "midnight_oven";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add("midnight-oven");
        localStorage.setItem("pizza_city_theme", "midnight_oven");
      } else {
        root.classList.remove("midnight-oven");
        localStorage.setItem("pizza_city_theme", "light");
      }
    } catch (e) {
      console.warn("Theme persistence safe blocked.", e);
    }
  }, [isDarkMode]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Global Cart (persisted to localStorage)
  const [cart, setCart] = useState<CartEntry[]>(loadCartFromStorage);
  const [isOutletSelectorOpen, setIsOutletSelectorOpen] = useState(false);

  const [selectedConfigureItem, setSelectedConfigureItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("Medium");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Filter state for MenuPage (kept global so it persists when returning)
  const [menuFilter, setMenuFilter] = useState<string>("all");

  // Global search (navbar search mode drives the Menu filter)
  const [siteSearch, setSiteSearch] = useState("");
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const navSearchRef = useRef<HTMLInputElement>(null);

  // Matches MenuPage's predicate: name, description (ingredients), category
  const navSearchResults = useMemo(() => {
    const q = siteSearch.toLowerCase().trim();
    if (!q) return [];
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [siteSearch, menuItems]);

  const closeNavSearch = (clearQuery = true) => {
    if (clearQuery) setSiteSearch("");
    setNavSearchOpen(false);
  };

  useEffect(() => {
    if (!navSearchOpen) return;
    const t = setTimeout(() => navSearchRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNavSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [navSearchOpen]);

  const goToMenuResults = () => {
    closeNavSearch(false);
    scrollToSection("menu");
  };

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const refreshMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        setMenuItems(await res.json());
      }
    } catch (err) {
      console.warn("Live menu sync failure", err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoadingMenu(true);
      setIsLoadingBanners(true);
      setIsLoadingBranches(true);
      try {
        const [menuRes, bannersRes, branchesRes] = await Promise.all([
          fetch("/api/menu"), fetch("/api/banners"), fetch("/api/branches")
        ]);
        if (menuRes.ok) setMenuItems(await menuRes.json());
        if (bannersRes.ok) setBanners(await bannersRes.json());
        if (branchesRes.ok) setBranches(await branchesRes.json());
      } catch (err) {
        console.warn("Error loading data from server", err);
      } finally {
        setIsLoadingMenu(false);
        setIsLoadingBanners(false);
        setIsLoadingBranches(false);
        setIsAppLoading(false);
      }
    }
    loadData();
  }, []);

  // Smooth scroll logic
  const scrollToSection = (sectionId: string) => {
    setDrawerOpen(false);
    if (currentPath !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(sectionId);
      }
    }
  };

  // Scroll Spy to detect active section
  useEffect(() => {
    if (currentPath !== "/") return;

    const sections = ["home", "menu", "track", "locations", "contact", "faq"];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160; // offset for fixed header
      
      let currentSection = "home";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);

      // Facebook-style hide-navbar-on-scroll — revealed on any upward scroll
      const y = window.scrollY;
      if (y > prevScrollY.current + 5 && y > 120 && !navSearchOpen && !drawerOpen) {
        setNavHidden(true);
      } else if (y < prevScrollY.current - 5) {
        setNavHidden(false);
      }
      prevScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  // Handle hash scrolling on path changes / page load
  useEffect(() => {
    if (currentPath === "/") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const timer = setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
          }
        }, 150);
        return () => clearTimeout(timer);
      } else {
        // Default to home if no hash
        setActiveSection("home");
      }
    }
  }, [currentPath, location.hash]);

  // Scroll to top on load (after splash) and on route change — unless a hash
  // target is present, in which case the hash handler above takes over.
  useEffect(() => {
    if (isAppLoading) return;
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [isAppLoading, currentPath]);

  // Redirect legacy routes to anchor links
  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/menu": "menu",
      "/track": "track",
      "/locations": "locations",
      "/contact": "contact",
      "/faq": "faq",
    };
    const targetSection = pathMap[currentPath];
    if (targetSection) {
      navigate(`/#${targetSection}`, { replace: true });
    }
  }, [currentPath, navigate]);

  const addToCart = (product: MenuItem) => {
    setSelectedConfigureItem(product);
    const sizes = product.sizes || getDefaultSizes(product.category);
    setSelectedSize(sizes[0]?.name || "Medium");
    setSelectedQuantity(1);
  };

  const confirmAddToCart = () => {
    if (!selectedConfigureItem) return;
    
    const basePrice = (selectedConfigureItem.discountPrice && selectedConfigureItem.discountPrice < selectedConfigureItem.price)
      ? selectedConfigureItem.discountPrice : selectedConfigureItem.price;
    const itemSizes = selectedConfigureItem.sizes || getDefaultSizes(selectedConfigureItem.category);

    const optimizedPrice = getOptimizedUnitPrice(basePrice, selectedSize, itemSizes, selectedQuantity);

    setCart((prev) => {
      const exists = prev.find((entry) => entry.item._id === selectedConfigureItem._id && entry.size === selectedSize);
      if (exists) {
        const newQty = exists.quantity + selectedQuantity;
        const reOptimizedPrice = getOptimizedUnitPrice(basePrice, selectedSize, itemSizes, newQty);
        return prev.map((entry) =>
          entry.item._id === selectedConfigureItem._id && entry.size === selectedSize
            ? { ...entry, quantity: newQty, unitPrice: reOptimizedPrice } : entry
        );
      }
      return [...prev, { item: selectedConfigureItem, quantity: selectedQuantity, size: selectedSize, unitPrice: optimizedPrice }];
    });

    displayToast(`Added ${selectedQuantity}x ${selectedConfigureItem.name} to cart.`);
    setSelectedConfigureItem(null);
    setIsOutletSelectorOpen(true);
  };

  const updateCartItem = (index: number, newQty: number, newSize: string) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((_, idx) => idx !== index));
      displayToast("Item removed from cart.");
      return;
    }

    setCart((prev) =>
      prev.map((entry, idx) => {
        if (idx !== index) return entry;
        const basePrice = (entry.item.discountPrice && entry.item.discountPrice < entry.item.price)
          ? entry.item.discountPrice : entry.item.price;
        const itemSizes = entry.item.sizes || getDefaultSizes(entry.item.category);
        const optimizedPrice = getOptimizedUnitPrice(basePrice, newSize, itemSizes, newQty);
        return {
          ...entry,
          quantity: newQty,
          size: newSize,
          unitPrice: optimizedPrice
        };
      })
    );
  };

  const cartTotalQty = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0);

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage full or unavailable — silently ignore
    }
  }, [cart]);

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const NavItem = ({ sectionId, label, isActive }: { sectionId: string, label: string, isActive: boolean }) => (
    <li className="relative">
      {isActive && (
        <motion.div
          layoutId="nav-active-pill"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--pc-red-500)] to-[var(--pc-amber-400)] shadow-md shadow-[var(--pc-red-500)]/30"
        />
      )}
      <button 
        onClick={() => scrollToSection(sectionId)} 
        className={`relative z-10 px-4 py-1.5 whitespace-nowrap transition-colors hover:text-[var(--pc-red-500)] font-extrabold text-sm cursor-pointer ${isActive ? "text-white" : "text-inherit"}`}
      >
        {label}
      </button>
    </li>
  );

  const drawerItems = [
    { id: "home", label: "Home" },
    { id: "menu", label: "Menu Catalog" },
    { id: "track", label: "Track Order" },
    { id: "locations", label: "Locations" },
    { id: "contact", label: "Contact" },
    { id: "faq", label: "FAQs" },
  ];

  return (
    <>
      {isAppLoading && <Loader fullPage text="Pre-heating the ovens..." />}
      <div className={`min-h-screen font-sans antialiased selection:bg-[var(--pc-red-500)]/20 selection:text-[var(--pc-red-500)] flex flex-col transition-colors duration-300 ${isDarkMode ? "midnight-oven bg-[var(--pc-gray-900)] text-[#ffedd4]" : "bg-[var(--pc-gray-100)] text-[var(--pc-gray-600)]"}`}>
      
{!isAdminRoute && (
<>
{/* Navbar — Glass Ember Floating Pill */}
<nav
        id="navbar"
        className={`fixed left-0 right-0 z-40 h-14 md:h-16 ${
          isBarAttached
            ? "w-full max-w-none mx-0 rounded-none top-0 navbar--attached"
            : "w-full mx-0 rounded-none top-0 md:w-[calc(100%-1.5rem)] md:max-w-5xl md:mx-auto md:rounded-full md:top-[max(0.75rem,env(safe-area-inset-top,0px))]"
        } glass-navbar transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${
          navHidden ? "-translate-y-[130px]" : ""
        }`}
      >
        {navSearchOpen && (
          <div className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-sm" onClick={() => closeNavSearch()} />
        )}

        <AnimatePresence mode="wait">
          {navSearchOpen ? (
            <motion.div
              key="nav-search"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col w-full h-full px-3 md:px-5"
            >
              <div className="flex items-center gap-2 w-full h-full">
                <button onClick={() => closeNavSearch()} className="p-2 md:p-2.5 rounded-full glass-navbar-btn active:scale-90 transition-all items-center justify-center shrink-0" aria-label="Close search">
                  <ArrowLeft size={16} />
                </button>

                <Search size={16} className="text-[var(--pc-gray-400)] shrink-0" />

                <input
                  ref={navSearchRef}
                  type="text"
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") goToMenuResults(); }}
                  placeholder="Search pizzas, sides, drinks..."
                  className="nav-search-input flex-1 min-w-0 bg-transparent text-sm md:text-base font-body outline-none placeholder:text-[var(--pc-gray-400)]"
                  aria-label="Search menu"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />

                {siteSearch && (
                  <button onClick={() => setSiteSearch("")} className="p-2 rounded-full glass-navbar-btn active:scale-90 transition-all shrink-0" aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}

                <button
                  onClick={goToMenuResults}
                  className="shrink-0 px-3.5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-[var(--menu-red)] to-[var(--menu-amber)] text-white active:scale-95 transition-transform"
                >
                  Go
                </button>
              </div>

              {navSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] rounded-3xl overflow-hidden glass-navbar nav-search-panel p-2">
                  {navSearchResults.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={goToMenuResults}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left hover:bg-white/5 active:bg-white/10 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs opacity-60 capitalize truncate">{item.category}</p>
                      </div>
                      <span className="text-sm font-bold text-[var(--menu-amber)] shrink-0">
                        {getEffectiveBasePrice(item.price, item.discountPrice)} OMR
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {navSearchOpen && siteSearch && navSearchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] rounded-2xl glass-navbar glass-navbar-btn p-4 text-center text-sm">
                  No items match "<span className="text-[var(--menu-amber)] font-semibold">{siteSearch}</span>"
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="nav-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-between w-full h-full px-3 md:px-5 gap-2"
            >
              <div className="flex items-center cursor-pointer shrink min-w-0" onClick={() => scrollToSection("home")}>
                <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" alt="Pizza City" className="h-7 min-[400px]:h-8 sm:h-9 md:h-11 object-contain shrink-0" />
              </div>

              <ul className="hidden md:flex items-center gap-1 font-extrabold text-sm text-[var(--pc-gray-600)]">
                <NavItem sectionId="home" label="Home" isActive={currentPath === "/" && activeSection === "home"} />
                <NavItem sectionId="menu" label="Menu" isActive={currentPath === "/" && activeSection === "menu"} />
                <NavItem sectionId="track" label="Track Order" isActive={currentPath === "/" && activeSection === "track"} />
                <NavItem sectionId="locations" label="Locations" isActive={currentPath === "/" && activeSection === "locations"} />
                <NavItem sectionId="contact" label="Contact" isActive={currentPath === "/" && activeSection === "contact"} />
                <NavItem sectionId="faq" label="FAQs" isActive={currentPath === "/" && activeSection === "faq"} />
              </ul>

              <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
                <button
                  onClick={() => setNavSearchOpen(true)}
                  className="p-2 md:p-2.5 rounded-full glass-navbar-btn active:scale-90 transition-all flex items-center justify-center"
                  aria-label="Search menu"
                >
                  <Search size={16} />
                </button>

                <button
                  onClick={() => { setIsDarkMode(!isDarkMode); displayToast(!isDarkMode ? "Midnight Oven dark mode enabled." : "Switched to light mode."); }}
                  className="hidden md:flex p-2 md:p-2.5 rounded-full glass-navbar-btn active:scale-90 transition-all items-center justify-center"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun size={16} className="text-amber-400 fill-amber-400/20" /> : <Flame size={16} className="text-[var(--pc-amber-400)] animate-pulse" />}
                </button>

                <button onClick={() => setIsOutletSelectorOpen(true)} className="relative p-2 md:p-2.5 rounded-full glass-navbar-btn active:scale-90 transition-all flex items-center justify-center" aria-label="Open cart">
                  <ShoppingCart size={16} />
                  {cartTotalQty > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--pc-red-500)] text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-bounce">{cartTotalQty}</span>}
                </button>

                <button onClick={() => setDrawerOpen(!drawerOpen)} className="md:hidden p-2 md:p-2.5 rounded-full glass-navbar-btn active:scale-90 transition-all flex items-center justify-center" aria-label="Open menu">
                  <MenuIcon size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      </>
      )}

      {!isAdminRoute && (
      <>
      {/* Mobile Drawer — Glass Ember Sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 bg-black md:hidden" />
            <motion.div
              initial={{ x: "115%" }}
              animate={{ x: 0 }}
              exit={{ x: "115%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed right-3 top-3 bottom-3 z-50 w-[72%] max-w-[320px] min-w-[250px] md:hidden glass-drawer rounded-[24px] p-4 flex flex-col gap-1 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--pc-red-500)]/10 mb-1">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setDrawerOpen(false); scrollToSection("home"); }}>
                  <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" alt="Pizza City" className="h-7 object-contain" />
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full glass-navbar-btn active:scale-90 transition-all flex items-center justify-center" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              {/* Theme toggle */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => { setIsDarkMode(!isDarkMode); displayToast(!isDarkMode ? "Midnight Oven dark mode enabled." : "Switched to light mode."); }}
                className="flex items-center justify-between w-full py-3 px-4 rounded-2xl font-bold text-sm glass-navbar-btn mt-1"
              >
                <span className="flex items-center gap-2.5">
                  {isDarkMode ? <Sun size={16} className="text-amber-400 fill-amber-400/20" /> : <Flame size={16} className="text-[var(--pc-amber-400)]" />}
                  {isDarkMode ? "Midnight Oven Mode" : "Light Mode"}
                </span>
                <span className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${isDarkMode ? "bg-[var(--pc-red-500)]" : "bg-[var(--pc-black)]/20"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isDarkMode ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </motion.button>

              <div className="h-px bg-[var(--pc-red-500)]/10 my-1.5" />

              {drawerItems.map((item, i) => {
                const isActive = currentPath === "/" && activeSection === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => scrollToSection(item.id)}
                    className={`py-3 px-4 font-bold rounded-2xl text-left transition-colors ${isActive ? "bg-[var(--pc-red-500)]/10 text-[var(--pc-red-500)]" : "text-[var(--pc-gray-600)] hover:bg-[var(--pc-red-500)]/5 hover:text-[var(--pc-red-500)]"}`}
                  >
                    {item.label}
                  </motion.button>
                );
              })}

              <div className="flex-1" />

            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>
      )}

      {/* Pages Router */}
      <div className={`pt-0 ${isAdminRoute ? "" : "md:pt-24"} flex-1 ${cartTotalQty > 0 ? 'pb-20 md:pb-0' : ''}`}>
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col gap-0 md:gap-16">
              <section id="home">
                <HomePage banners={banners} isLoadingBanners={isLoadingBanners} setActiveTab={(tab) => scrollToSection(tab === 'loc' ? 'locations' : tab)} displayToast={displayToast} onOpenOutletSelector={() => setIsOutletSelectorOpen(true)} />
              </section>
              <section id="menu" className="scroll-mt-24 mt-3 md:mt-0">
                <MenuPage menuItems={menuItems} isLoadingMenu={isLoadingMenu} menuFilter={menuFilter} setMenuFilter={setMenuFilter} addToCart={addToCart} searchQuery={siteSearch} onSearchChange={setSiteSearch} navHidden={navHidden} displayToast={displayToast} />
              </section>
              <section id="track" className="scroll-mt-24 mt-12 md:mt-0">
                <TrackOrderPage trackOrderId="" displayToast={displayToast} isDarkMode={isDarkMode} />
              </section>
              <section id="locations" className="scroll-mt-24 mt-12 md:mt-0">
                <LocationsPage branches={branches} />
              </section>
              <section id="contact" className="scroll-mt-24 mt-12 md:mt-0">
                <ContactPage displayToast={displayToast} />
              </section>
              <section id="faq" className="scroll-mt-24 mt-12 md:mt-0 pb-16">
                <FaqPage />
              </section>

              {/* Restored Footer */}
              <footer className="bg-[var(--pc-gray-700)] py-12 md:py-16 mt-8 rounded-t-[40px] shadow-2xl" style={{ color: "var(--pc-color-footer-text)" }}>
                <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" alt="Pizza City" className="h-10 md:h-12 object-contain brightness-0 invert opacity-90" />
                    <p className="text-sm leading-relaxed">Authentic wood-fired pizzas, hand-kneaded signature sourdough bases, and premium Omani ingredients.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-playfair font-black text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm font-bold">
                      <li><button onClick={() => scrollToSection("home")} className="hover:text-[var(--pc-amber-400)] transition-colors">Home</button></li>
                      <li><button onClick={() => scrollToSection("menu")} className="hover:text-[var(--pc-amber-400)] transition-colors">Menu Catalog</button></li>
                      <li><button onClick={() => scrollToSection("track")} className="hover:text-[var(--pc-amber-400)] transition-colors">Track Order</button></li>
                      <li><button onClick={() => scrollToSection("locations")} className="hover:text-[var(--pc-amber-400)] transition-colors">Locations</button></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-playfair font-black text-lg mb-4">Contact Info</h4>
                    <ul className="space-y-2 text-sm font-bold">
                      <li>Muscat, Oman</li>
                      <li>Phone: +968 9692 8714</li>
                      <li>Open Daily: 11 AM - 2 AM</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-playfair font-black text-lg mb-4">Newsletter</h4>
                    <p className="text-sm mb-4">Subscribe for exclusive offers and secret menu drops.</p>
                    <div className="flex bg-white/5 rounded-xl overflow-hidden p-1 focus-within:ring-2 ring-[var(--pc-amber-400)]/50 border border-white/10">
                      <input type="email" placeholder="Your email address" className="bg-transparent border-none outline-none px-4 py-2 text-white text-sm w-full" />
                      <button className="bg-[var(--pc-amber-400)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[var(--pc-red-500)] transition-colors">Join</button>
                    </div>
                  </div>
                </div>
                <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold tracking-wider">
                  <p>&copy; {new Date().getFullYear()} Pizza City Oman. All rights reserved.</p>
                  <div className="flex gap-3">
                    {SOCIAL_LINKS.map((social) => (
                      <a
                        key={social.id}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={social.label}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all hover:bg-[var(--pc-amber-400)] hover:scale-110"
                      >
                        <img src={social.icon} alt={social.label} className="w-4.5 h-4.5" />
                      </a>
                    ))}
                  </div>
                  <div className="flex gap-4 items-center">
                    <Link to="/admin" className="hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Lock size={12} /> Staff Portal
                    </Link>
                    <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-white cursor-pointer">Terms of Service</span>
                  </div>
                </div>
              </footer>
            </div>
          } />
          <Route path="/locations/:slug" element={<LocationDetailPage branches={branches} />} />
          <Route path="/admin" element={<AdminPage displayToast={displayToast} refreshMenu={refreshMenu} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />} />
        </Routes>
      </div>

      {/* Overlays & Modals */}
      {!isAdminRoute && (
      <>
      <OutletSelector 
        isOpen={isOutletSelectorOpen} 
        onClose={() => setIsOutletSelectorOpen(false)} 
        cart={cart} 
        onClearCart={clearCart} 
        onShowToast={displayToast} 
        branches={branches} 
        onUpdateCartItem={updateCartItem}
        menuItems={menuItems}
        onBrowseMenu={() => {
          setIsOutletSelectorOpen(false);
          scrollToSection("menu");
        }}
        onAddToCart={addToCart}
      />
      
      <AnimatePresence>
        {selectedConfigureItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedConfigureItem(null)} className="fixed inset-0 z-[60] bg-black" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-white rounded-3xl p-6 shadow-2xl">

              {/* Item Header */}
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={selectedConfigureItem.image || "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,fit=crop/dfZWWj1nq2KWjIwX/pizza-placeholder.jpg"}
                  alt={selectedConfigureItem.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-2xl tracking-wide text-[var(--pc-color-text-primary-light)]">Configure</h3>
                  <p className="font-body font-bold text-sm text-[var(--pc-color-text-secondary-light)] truncate">{selectedConfigureItem.name}</p>
                </div>
                <button onClick={() => setSelectedConfigureItem(null)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[var(--pc-color-text-muted-light)] flex items-center justify-center transition-colors flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Size Picker with Prices */}
              {(() => {
                const configSizes = selectedConfigureItem.sizes || getDefaultSizes(selectedConfigureItem.category);
                const basePrice = (selectedConfigureItem.discountPrice && selectedConfigureItem.discountPrice < selectedConfigureItem.price)
                  ? selectedConfigureItem.discountPrice : selectedConfigureItem.price;
                const cols = Math.min(configSizes.length, 3);
                return (
                  <>
                    <div className={`grid gap-2 mb-4`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                      {configSizes.map(s => {
                        const sizePrice = getSizeAdjustedPrice(basePrice, s.name, configSizes);
                        const isActive = selectedSize === s.name;
                        return (
                          <button key={s.name} onClick={() => setSelectedSize(s.name)}
                            className={`flex flex-col items-center py-3 px-2 rounded-xl border font-bold text-sm transition-all ${
                              isActive
                                ? "bg-[var(--pc-color-primary)] text-white border-transparent shadow-md"
                                : "bg-white text-[var(--pc-color-text-muted-light)] border-[var(--pc-color-border-light)] hover:border-[var(--pc-color-primary)] hover:text-[var(--pc-color-primary)]"
                            }`}
                          >
                            <span className="font-body">{s.label}</span>
                            <span className={`text-[10px] mt-0.5 ${isActive ? "text-white/80" : "text-[var(--pc-color-primary)]"}`}>
                              OMR {sizePrice.toFixed(3)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Size Info Strip — shown when sizes have metadata */}
                    {configSizes.some(s => s.inch || s.slices) && (
                      <div className="bg-gray-50 border border-[var(--pc-color-border-light)] rounded-xl p-2.5 mb-4 grid gap-2 text-center text-[10px] leading-tight" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                        {configSizes.map((s, i) => {
                          const parts: string[] = [];
                          if (s.inch) parts.push(`${s.inch}"`);
                          if (s.slices) parts.push(`${s.slices} slices`);
                          return (
                            <div key={s.name} className={`p-1 ${i > 0 ? 'border-l border-[var(--pc-color-border-light)]' : ''}`}>
                              <span className="font-black text-[var(--pc-color-primary)]">{s.label}</span>
                              {parts.length > 0 && <p className="text-[var(--pc-color-text-secondary-light)] mt-0.5">{parts.join(' · ')}</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quantity & Price Summary */}
                    <div className="bg-gray-50 border border-[var(--pc-color-border-light)] rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body font-bold text-xs text-[var(--pc-color-text-secondary-light)]">Quantity</span>
                        <div className="flex items-center gap-3 bg-white rounded-lg border border-[var(--pc-color-border-light)] p-1">
                          <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} className="w-8 h-8 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-sm text-[var(--pc-color-text-primary-light)] transition-colors">-</button>
                          <span className="font-body font-black text-base min-w-[24px] text-center text-[var(--pc-color-text-primary-light)]">{selectedQuantity}</span>
                          <button onClick={() => setSelectedQuantity(selectedQuantity + 1)} className="w-8 h-8 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-sm text-[var(--pc-color-text-primary-light)] transition-colors">+</button>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-[var(--pc-color-border-light)] pt-2 flex justify-between items-center">
                        <span className="font-body text-xs text-[var(--pc-color-text-secondary-light)]">Total</span>
                        <span className="font-body font-black text-[var(--pc-color-primary)]">
                          OMR {(getSizeAdjustedPrice(basePrice, selectedSize, configSizes) * selectedQuantity).toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Confirm Button */}
              <button onClick={confirmAddToCart} className="w-full py-3.5 bg-gradient-to-r from-[var(--pc-color-primary)] to-[var(--pc-color-cta)] text-white font-body font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--pc-color-primary)]/25">
                Confirm Add to Cart
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>
      )}

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => setShowToast(false)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] toast-popup px-6 py-3.5 rounded-full flex items-center gap-3 cursor-pointer select-none max-w-[90vw] text-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--pc-amber-400)] animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white leading-snug">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Cart Bar */}
      {!isAdminRoute && cartTotalQty > 0 && (
        <div className="mobile-cart-bar md:hidden">
          <div className="mobile-cart-bar__info">
            <span className="mobile-cart-bar__count">
              <ShoppingBag size={14} className="inline mr-1" />
              {cartTotalQty} {cartTotalQty === 1 ? "item" : "items"} in cart
            </span>
            <span className="mobile-cart-bar__total">
              <span className="currency">OMR</span> {cartTotalPrice.toFixed(3)}
            </span>
          </div>
          <button
            onClick={() => setIsOutletSelectorOpen(true)}
            className="mobile-cart-bar__btn"
          >
            View Cart
          </button>
        </div>
      )}
    </div>
    </>
  );
}


