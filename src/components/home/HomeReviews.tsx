import { useCallback, useEffect, useRef, useState } from "react";
import { Star, MapPin, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  name: string;
  outlet: string;
  rating: number;
  title: string;
  text: string;
}

const REVIEWS: Review[] = [
  {
    name: "Ahmed Al-Busaidi",
    outlet: "Nizwa",
    rating: 5,
    title: "Mashallah, best crust in Dakhiliyah!",
    text: "The 48-hour sourdough is real — crispy edges, soft centre. Ordered on WhatsApp and it arrived hot in 30 minutes. Shukran!",
  },
  {
    name: "Priya Nair",
    outlet: "Al Khoud",
    rating: 5,
    title: "Family feast favourite",
    text: "The Family Feast Combo fed all five of us. Kids loved the cheesy garlic bread. Very clean packing, very fresh cheese.",
  },
  {
    name: "Salim M.",
    outlet: "Sur",
    rating: 4.5,
    title: "Seafood pizza is a must",
    text: "Sea Food Pizza with prawns and calamari — full of flavour, not oily. Delivery took 35 minutes on a busy Friday. Worth it!",
  },
  {
    name: "Fatma Al-Riyami",
    outlet: "Quriyat",
    rating: 5,
    title: "Alhamdulillah, finally good pizza nearby",
    text: "We used to drive to Muscat for decent pizza. Now Pizza City Quriyat delivers to our door. The BBQ chicken is excellent.",
  },
  {
    name: "Kabir Shah",
    outlet: "Fanja",
    rating: 5,
    title: "Late-night saviour",
    text: "Ordered at 1 AM and they still delivered hot and fast. Respect! The Inferno Diavola is properly spicy. Mashallah!",
  },
  {
    name: "Sara L.",
    outlet: "Samail",
    rating: 4.5,
    title: "Great value combos",
    text: "Duo Pizza Deal with garlic bread — great OMR value for gatherings. WhatsApp ordering was smooth, tracking worked well.",
  },
];

const AUTOPLAY_MS = 5000;
const GAP_PX = 16;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating > i;
        return (
          <Star
            key={i}
            size={14}
            className={filled || half ? "text-[var(--pc-amber-500)] fill-[var(--pc-amber-500)]" : "text-gray-300"}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export default function HomeReviews({ id = "home-reviews" }: { id?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll-reveal for cards
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const stepWidth = useCallback(() => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return track?.clientWidth || 300;
    return first.offsetWidth + GAP_PX;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = (index + REVIEWS.length) % REVIEWS.length;
      track.scrollTo({ left: clamped * stepWidth(), behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [stepWidth]
  );

  // Track manual swipes for dot sync
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(track.scrollLeft / stepWidth());
        setActiveIndex(Math.min(Math.max(idx, 0), REVIEWS.length - 1));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [stepWidth]);

  // Smooth autoplay — pauses on hover/focus, hidden tab, or reduced motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (hoveringRef.current || document.hidden) return;
      goTo(activeIndex + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [activeIndex, goTo]);

  return (
    <section id={id} className="mt-12 md:mt-16 scroll-mt-28 md:scroll-mt-36" aria-label="Customer reviews">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-1.5 max-w-xl mx-auto pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--pc-amber-400)] block">
            Customer Reviews
          </span>
          <h2 className="font-playfair font-black text-2xl md:text-3xl text-[var(--pc-gray-700)]">
            What Oman Is Saying
          </h2>
          <p className="text-sm text-[var(--pc-gray-500)] font-medium">
            Loved across the Sultanate — from Nizwa to Sur.
          </p>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => (hoveringRef.current = true)}
        onMouseLeave={() => (hoveringRef.current = false)}
        onFocus={() => (hoveringRef.current = true)}
        onBlur={() => (hoveringRef.current = false)}
      >
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          aria-label="Previous reviews"
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg border border-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          aria-label="Next reviews"
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg border border-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews carousel"
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth px-4 md:px-8 pb-2"
        >
          {REVIEWS.map((review) => (
            <article
              key={review.name}
              aria-roledescription="slide"
              aria-label={`${review.name}, ${review.outlet}`}
              className="fade-up shrink-0 w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] snap-start rounded-[20px] p-4 space-y-3 shadow-md border border-gray-100"
              style={{ background: "var(--pc-color-surface)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <Stars rating={review.rating} />
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--pc-gray-500)]">
                  <MapPin size={12} className="text-[var(--pc-amber-400)]" aria-hidden="true" />
                  {review.outlet}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[var(--pc-color-text-primary-light)]">
                  {review.title}
                </h3>
                <p className="text-xs leading-relaxed text-[var(--pc-color-text-secondary-light)]">
                  {review.text}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--pc-red-500)] to-[var(--pc-amber-400)] text-white text-xs font-black flex items-center justify-center shrink-0">
                  {review.name.charAt(0)}
                </span>
                <span className="text-xs font-bold text-[var(--pc-color-text-primary-light)] inline-flex items-center gap-1">
                  {review.name}
                  <BadgeCheck size={14} className="text-[var(--pc-amber-500)]" aria-label="Verified outlet review" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {REVIEWS.map((review, index) => (
            <button
              key={review.name}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to review from ${review.name}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                index === activeIndex
                  ? "w-8 bg-gradient-to-r from-[var(--pc-red-500)] to-[var(--pc-amber-400)]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
