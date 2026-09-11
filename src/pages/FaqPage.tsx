import React, { useState, useEffect } from "react";
import { Search, HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FaqPage() {
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const FAQS = [
    { q: "How long does delivery take?", a: "We aim for 30 minutes or less from all our outlets across Oman. If we exceed that, your next order is on us!" },
    { q: "How can I place an order?", a: "Tap 'Order Now' or 'Add to Cart' to build your order, pick your outlet, and check out in one tap — we confirm on WhatsApp right away." },
    { q: "What active areas do you offer delivery?", a: "We offer hot and fast delivery from all our outlets across Oman — see the Locations page for addresses and hours. Follow us on Instagram @_pizza.city_ to get updates when we open near you." },
    { q: "Am I able to configure custom toppings?", a: "Absolutely. When placing your automated WhatsApp text checkout, you can append any custom configurations, extra toppings, or instructions like 'make it extra hot'!" },
    { q: "What payment systems are available?", a: "We currently accept cash-on-delivery, local bank transfer, or card systems. Integrated Oman payment gateways like Thawani are currently under active development." },
    { q: "Are all components of the pizza clean and fresh?", a: "Yes, 100%! We source premium whole-milk mozzarella and hand-stretch our dough daily. No frozen crusts or canned shortcuts are ever permitted." },
    { q: "Is Pizza City halal?", a: "Yes — 100% halal. All meats are halal-certified and our kitchens follow strict halal preparation standards across every Oman outlet." },
    { q: "Do you deliver to Ibri and Mabela?", a: "Yes! Our Ibri and Al Mabela (Seeb) outlets serve their surrounding areas with fast delivery. Check the Locations page for hours and phone numbers." },
    { q: "What is the 30-minute guarantee?", a: "If your order takes longer than 30 minutes from confirmation to your door, contact us with your order ID and your next order is on us." },
    { q: "Do you cater birthdays and bulk office orders?", a: "Yes — for parties of 10+ or office lunches, message us on WhatsApp at +968 9692 8714 at least a day ahead and we'll prepare a bulk quote." },
    { q: "Which outlet is open the latest?", a: "Most outlets serve until 1–2 AM daily. Hours vary by branch (Al Khoud closes 11 PM) — see each location page for today's exact hours." },
    { q: "Can I pay online with Thawani?", a: "Online card payment via Oman gateways is under active development. Today you can pay cash on delivery, by bank transfer, or by card at the outlet." },
  ];

  // Inject FAQPage Schema.org JSON-LD for rich snippet search results
  useEffect(() => {
    const existing = document.getElementById("faq-schema");
    if (existing) existing.remove();

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };

    const script = document.createElement("script");
    script.id = "faq-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("faq-schema");
      if (el) el.remove();
    };
  }, []);

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8 animate-fadeIn">
      <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
        <span className="text-xs font-bold text-[var(--pc-amber-400)] uppercase tracking-widest block font-sans">Support</span>
        <h1 className="font-playfair font-black text-3xl md:text-4xl text-[var(--pc-gray-700)]">Pizza Delivery FAQs — Ordering, Halal & Areas</h1>
        <p className="text-xs text-[var(--pc-gray-500)] leading-relaxed">
          Search questions or look at the accordion blocks below to resolve your inquiries instantly.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* FAQs Text Search Bar */}
        <div className="flex items-center gap-2.5 bg-white border border-[#D72B2B]/10 rounded-full px-4 py-3 shadow-xs">
          <Search size={16} className="text-[var(--pc-gray-500)]" />
          <input 
            type="text" 
            placeholder="Search questions or keywords..."
            value={faqSearchQuery}
            onChange={(e) => setFaqSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[var(--pc-gray-600)] focus:outline-none"
          />
        </div>

        {/* Accordion list */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-xs transition-shadow"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left p-5 font-bold text-xs md:text-sm text-[var(--pc-gray-700)] hover:text-[var(--pc-red-500)] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-[var(--pc-amber-400)]" />
                      {faq.q}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--pc-gray-500)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-50 bg-[var(--pc-amber-400)]/2"
                      >
                        <p className="p-5 text-xs text-[var(--pc-gray-500)] leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-[var(--pc-gray-500)] py-8">No matching FAQs resolved.</p>
          )}
        </div>
      </div>
    </div>
  );
}
