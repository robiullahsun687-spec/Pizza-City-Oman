export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 animate-fadeIn">
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold text-[var(--pc-amber-400)] uppercase tracking-widest block">Legal</span>
          <h1 className="font-playfair font-black text-3xl md:text-4xl text-[var(--pc-gray-700)]">Privacy Policy</h1>
          <p className="text-xs text-[var(--pc-gray-500)]">Last updated: 2026</p>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-[var(--pc-gray-600)]">
          <p>
            Pizza City Oman ("we") respects your privacy. When you place an order through this site,
            we collect your name, phone number, and order details so the outlet can confirm and
            deliver your food via WhatsApp.
          </p>
          <p>
            We do not sell your data. Order information is shared only with the outlet fulfilling
            your order and, where enabled, our order-logging sheet. Contact details submitted via
            forms are used solely to respond to your message.
          </p>
          <p>
            Your cart is stored locally in your browser. You can clear it at any time from the cart
            panel. For questions or deletion requests, email{" "}
            <a href="mailto:info@pizzacityoman.com" className="font-bold text-[var(--pc-red-500)] hover:underline">
              info@pizzacityoman.com
            </a>{" "}
            or call{" "}
            <a href="tel:+96896928714" className="font-bold text-[var(--pc-red-500)] hover:underline">
              +968 9692 8714
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
