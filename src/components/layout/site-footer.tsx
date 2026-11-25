import Link from "next/link";
import { Compass, ArrowUpRight, MapPin } from "lucide-react";

const footerLinks = [
  { label: "Explore places", href: "/explore" },
  { label: "About YeneSpot", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <Compass size={22} strokeWidth={2.5} />
            </span>
            <span className="text-[22px] font-extrabold tracking-tight">
              Yene<span className="text-brand">Spot</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-text-secondary">
            Discover your place. Find local businesses, explore new experiences,
            and connect with the places that make your city special.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary">
            <MapPin size={16} className="text-brand" />
            Starting in Jimma, Ethiopia
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-text-primary">Discover</h3>
          <ul className="mt-5 space-y-4">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-text-secondary transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-text-primary">For businesses</h3>
          <p className="mt-5 max-w-xs text-sm leading-7 text-text-secondary">
            Help more people discover your business and connect with your community.
          </p>
          <Link
            href="/business-dashboard/create"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark"
          >
            List your business <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} YeneSpot. All rights reserved.</p>
          <p>Discover Your Place.</p>
        </div>
      </div>
    </footer>
  );
}