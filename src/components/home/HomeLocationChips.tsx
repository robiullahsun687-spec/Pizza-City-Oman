import { Link } from "react-router-dom";
import { MapPin, Clock, Phone, ArrowRight } from "lucide-react";
import { Branch } from "../../types";

interface HomeLocationChipsProps {
  branches: Branch[];
  id?: string;
}

function toSlug(name: string): string {
  return (name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function HomeLocationChips({ branches, id = "home-locations" }: HomeLocationChipsProps) {
  const active = (branches || []).filter((b) => b.isActive !== false);

  return (
    <section id={id} className="container mx-auto px-4 md:px-8 mt-12 md:mt-16 scroll-mt-28 md:scroll-mt-36" aria-label="Our locations">
      <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-3 mb-6">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--pc-amber-400)]">
            Find Us
          </span>
          <h2 className="font-playfair font-black text-2xl md:text-3xl text-[var(--pc-gray-700)]">
            Outlets Across Oman
          </h2>
          <p className="text-sm text-[var(--pc-gray-500)] max-w-xl font-medium">
            Tap your city for address, hours and phone.
          </p>
        </div>
        <Link
          to="/locations"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-black text-[var(--pc-red-500)] hover:text-[var(--pc-amber-400)] transition-colors"
        >
          All Locations <ArrowRight size={16} />
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="rounded-[20px] border border-gray-100 p-6 text-center text-sm font-bold text-[var(--pc-gray-500)]">
          Outlet locations are loading. Please check back in a moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((branch) => (
            <Link
              key={branch._id || branch.name}
              to={`/locations/${toSlug(branch.name)}`}
              className="group rounded-[20px] p-4 shadow-md border border-gray-100 hover:shadow-lg hover:border-[var(--pc-red-500)]/30 transition-all"
              style={{ background: "var(--pc-color-surface)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-[var(--pc-red-500)]/10 text-[var(--pc-red-500)] flex items-center justify-center shrink-0">
                  <MapPin size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[var(--pc-color-text-primary-light)] truncate">
                    {branch.name}
                  </h3>
                  <p className="text-[11px] text-[var(--pc-color-text-muted-light)] truncate">
                    {branch.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-[var(--pc-color-text-secondary-light)]">
                {branch.hours && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" /> {branch.hours}
                  </span>
                )}
                {branch.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} aria-hidden="true" /> {branch.phone}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
