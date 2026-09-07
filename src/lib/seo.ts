export const SITE_URL = "https://pizzacityoman.com";
export const OG_IMAGE = "https://pizzacityoman.com/og-image.png";

export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
}

export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    title: "Pizza City Oman — Handcrafted Oven-Baked Pizza | Order Online",
    description:
      "Pizza City Oman serves authentic handcrafted oven-baked pizzas, savoury sides, drinks and desserts. Explore the menu and order online via WhatsApp.",
    canonical: `${SITE_URL}/`,
  },
  menu: {
    title: "Pizza Menu — Prices & Order Online | Pizza City Oman",
    description:
      "Browse the full Pizza City Oman menu: handcrafted pizzas, combos, sides, drinks and desserts with prices in OMR. Order online via WhatsApp.",
    canonical: `${SITE_URL}/menu`,
  },
  trackOrder: {
    title: "Track Your Order | Pizza City Oman",
    description:
      "Track your Pizza City Oman order live — enter your order ID to see preparation and delivery status.",
    canonical: `${SITE_URL}/track-order`,
  },
  locations: {
    title: "Our Locations — Nizwa, Samail, Sur, Quriyat, Fanja | Pizza City Oman",
    description:
      "Find Pizza City Oman outlets near you: Nizwa, Samail, Sur, Quriyat, Fanja and Al Khoud. Addresses, phone numbers, hours and delivery info.",
    canonical: `${SITE_URL}/locations`,
  },
  contact: {
    title: "Contact Us — Phone, WhatsApp & Directions | Pizza City Oman",
    description:
      "Contact Pizza City Oman: phone +968 9692 8714, WhatsApp ordering, email info@pizzacityoman.com. Open daily 11 AM – 2 AM in Muscat, Oman.",
    canonical: `${SITE_URL}/contact`,
  },
  faq: {
    title: "FAQs — Delivery, Ordering & Halal Info | Pizza City Oman",
    description:
      "Pizza City Oman FAQs: delivery times, how to order, delivery areas, custom toppings, payment methods and freshness. Answers in seconds.",
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
