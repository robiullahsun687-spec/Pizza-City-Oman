export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 animate-fadeIn">
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold text-[var(--pc-amber-400)] uppercase tracking-widest block">Legal</span>
          <h1 className="font-playfair font-black text-3xl md:text-4xl text-[var(--pc-gray-700)]">Terms of Service</h1>
          <p className="text-xs text-[var(--pc-gray-500)]">Last updated: 2026</p>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-[var(--pc-gray-600)]">
          <p>
            Orders placed on pizzacityoman.com are confirmed via WhatsApp with the selected outlet.
            Prices are in Omani Rial (OMR) and include applicable charges shown at checkout.
          </p>
          <p>
            Delivery times (around 30 minutes in core areas) are estimates and may vary by outlet
            load, distance, and weather. An outlet may call you to confirm large, late-night, or
            far-distance orders before preparation.
          </p>
          <p>
            Promo codes are validated server-side and may carry minimum order values. Misuse,
            chargebacks, or abusive conduct may lead to order refusal. Open daily 11 AM – 2 AM
            unless an outlet page states otherwise.
          </p>
        </div>
      </div>
    </div>
  );
}
