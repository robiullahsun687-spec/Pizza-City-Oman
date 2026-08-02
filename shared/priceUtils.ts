export interface MenuItemSize {
  name: string;
  label: string;
  multiplier: number;
  price?: number;
  inch?: number;
  slices?: number;
}

export function getDefaultSizes(category: string): MenuItemSize[] {
  if (category === "pizza") {
    return [
      { name: "Small", label: 'Small (8")', multiplier: 0.8, inch: 8, slices: 4 },
      { name: "Medium", label: 'Medium (11")', multiplier: 1.0, inch: 11, slices: 6 },
      { name: "Large", label: 'Large (14")', multiplier: 1.35, inch: 14, slices: 8 },
    ];
  }
  return [
    { name: "Regular", label: "Regular", multiplier: 1.0 },
    { name: "Large", label: "Large", multiplier: 1.2 },
  ];
}

export function getEffectiveBasePrice(menuPrice: number, discountPrice?: number): number {
  return discountPrice && discountPrice > 0 && discountPrice < menuPrice ? discountPrice : menuPrice;
}

export function getSizeAdjustedPrice(price: number, size: string, sizes: MenuItemSize[]): number {
  const found = sizes.find((s) => s.name === size);
  if (found) {
    if (found.price !== undefined && found.price !== null) {
      return Number(found.price.toFixed(3));
    }
    return Number((price * found.multiplier).toFixed(3));
  }
  return Number(price.toFixed(3));
}

export function getVolumeDiscountPercentage(quantity: number): number {
  if (quantity >= 5) {
    return 12;
  } else if (quantity >= 3) {
    return 8;
  } else if (quantity === 2) {
    return 5;
  }
  return 0;
}

export function getOptimizedUnitPrice(
  basePrice: number,
  size: string,
  sizes: MenuItemSize[],
  quantity: number
): number {
  const sizeAdjusted = getSizeAdjustedPrice(basePrice, size, sizes);
  const discountPercent = getVolumeDiscountPercentage(quantity);
  const finalPrice = sizeAdjusted * (1 - discountPercent / 100);
  return Number(finalPrice.toFixed(3));
}

export interface PriceBreakdown {
  originalMenuPrice: number;
  sizeAdjustedPrice: number;
  quantityDiscountPercent: number;
  savingsPerUnit: number;
  finalOptimizedUnitPrice: number;
  totalPrice: number;
}

export function getPriceBreakdown(
  item: { price: number; discountPrice?: number; sizes: MenuItemSize[] },
  size: string,
  quantity: number
): PriceBreakdown {
  const effectiveBasePrice = getEffectiveBasePrice(item.price, item.discountPrice);
  const sizePrice = getSizeAdjustedPrice(effectiveBasePrice, size, item.sizes);
  const discountPercent = getVolumeDiscountPercentage(quantity);
  const finalUnitPrice = getOptimizedUnitPrice(effectiveBasePrice, size, item.sizes, quantity);
  const savings = Math.max(0, sizePrice - finalUnitPrice);
  const total = Number((finalUnitPrice * quantity).toFixed(3));

  return {
    originalMenuPrice: item.price,
    sizeAdjustedPrice: sizePrice,
    quantityDiscountPercent: discountPercent,
    savingsPerUnit: Number(savings.toFixed(3)),
    finalOptimizedUnitPrice: finalUnitPrice,
    totalPrice: total,
  };
}