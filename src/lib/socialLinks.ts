export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  icon: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@_pizza.city_",
    icon: "https://cdn-icons-png.flaticon.com/512/2190/2190408.png",
    href: "https://www.instagram.com/_pizza.city_/",
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "Pizza City Oman",
    icon: "https://cdn-icons-png.flaticon.com/512/2190/2190396.png",
    href: "https://www.facebook.com/pizzacityoman",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    handle: "+968 9402 2343",
    icon: "https://cdn-icons-png.flaticon.com/512/2190/2190470.png",
    href: "https://wa.me/96894022343",
  },
  {
    id: "email",
    label: "Email",
    handle: "info@pizzacityoman.com",
    icon: "https://cdn-icons-png.flaticon.com/512/646/646094.png",
    href: "mailto:info@pizzacityoman.com",
  },
];
