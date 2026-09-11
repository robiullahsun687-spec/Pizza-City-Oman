export const SITE_URL = "https://pizzacityoman.com";
export const OG_IMAGE = "https://pizzacityoman.com/og-image.png";

export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
}

export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    title: "Pizza City Oman — Handcrafted Pizza | 30-Min Delivery",
    description:
      "Handcrafted oven-baked pizzas, sides & desserts delivered hot in ~30 minutes across Oman. Open daily 11 AM – 2 AM. Order via WhatsApp: +968 9692 8714.",
    canonical: `${SITE_URL}/`,
  },
  menu: {
    title: "Pizza Menu Oman — Prices & 30-Min Delivery | Pizza City",
    description:
      "Full Pizza City Oman menu with prices in OMR: handcrafted pizzas, combos, sides, drinks & desserts. 30-min delivery. Order via WhatsApp.",
    canonical: `${SITE_URL}/menu`,
  },
  trackOrder: {
    title: "Track Your Order | Pizza City Oman",
    description:
      "Track your Pizza City Oman order live — enter your order ID to see preparation and delivery status.",
    canonical: `${SITE_URL}/track-order`,
  },
  locations: {
    title: "Pizza Locations Oman — Find Us Near You | Pizza City",
    description:
      "Find Pizza City outlets near you: Nizwa, Samail, Sur, Quriyat, Fanja, Al Khoud, Ibri & Mabela. Addresses, hours, phone & delivery info.",
    canonical: `${SITE_URL}/locations`,
  },
  contact: {
    title: "Contact Pizza City Oman — Phone, WhatsApp & Hours",
    description:
      "Call +968 9692 8714 or WhatsApp your order. Email info@pizzacityoman.com. Open daily 11 AM – 2 AM in Muscat, Oman.",
    canonical: `${SITE_URL}/contact`,
  },
  faq: {
    title: "Pizza Delivery FAQs — Halal, Ordering & Areas | Pizza City",
    description:
      "Halal ingredients? Delivery time & areas? Payment methods? Pizza City Oman answers: 30-min delivery, custom toppings, freshness & more.",
    canonical: `${SITE_URL}/faq`,
  },
  privacy: {
    title: "Privacy Policy | Pizza City Oman",
    description:
      "How Pizza City Oman collects and uses order and contact information, and how to request deletion.",
    canonical: `${SITE_URL}/privacy`,
  },
  terms: {
    title: "Terms of Service | Pizza City Oman",
    description:
      "Ordering, pricing, delivery estimates and promo rules for Pizza City Oman online ordering.",
    canonical: `${SITE_URL}/terms`,
  },
};

/** section id (legacy hash) -> route path */
export const SECTION_TO_PATH: Record<string, string> = {
  home: "/",
  menu: "/menu",
  track: "/track-order",
  locations: "/locations",
  contact: "/contact",
  faq: "/faq",
};

/** route path -> section id (for active nav) */
export const PATH_TO_SECTION: Record<string, string> = {
  "/": "home",
  "/menu": "menu",
  "/track-order": "track",
  "/track": "track",
  "/locations": "locations",
  "/contact": "contact",
  "/faq": "faq",
};
