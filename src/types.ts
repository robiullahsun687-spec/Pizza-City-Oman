import { MenuItemSize } from "./lib/priceUtils";

export interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  altText?: string;
  available: boolean;
  discountPrice?: number;
  discountPercentage?: number;
  featured?: boolean;
  pinnedFeatured?: boolean;
  sizes?: MenuItemSize[];
}

export interface PromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
}

export interface CartEntry {
  item: MenuItem;
  quantity: number;
  size: string;
  unitPrice: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  customer: Customer;
  outlet: string; // Branch.name — source of truth is /api/branches (MongoDB)
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  total: number;
  timestamp: string;
}

export interface Branch {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  map?: string;
  geo?: string;
  hours?: string;
  delivery?: boolean;
  isActive?: boolean;
  image?: string;
  altText?: string;
}

// Outlet names are dynamic — the single source of truth is /api/branches (MongoDB).
// There is intentionally no hardcoded OUTLETS constant (it previously capped the
// system at 5 outlets while the database holds 8+). Use Branch.name directly.
export type OutletName = string;

export interface HeroBanner {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  altText?: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  stylePattern?: "attached" | "classic" | "modern" | "fullImage";
  type?: "hero" | "offer" | "all";
}

