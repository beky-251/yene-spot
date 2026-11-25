import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  MapPin,
  Coffee,
  Utensils,
  BedDouble,
  ShoppingBag,
  Heart,
  Sparkles,
  Store,
  Compass,
  ShieldCheck,
  Users,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const categories = [
  {
    name: "Restaurants",
    slug: "restaurants",
    description: "Discover places to eat",
    icon: Utensils,
    color: "bg-orange-50 text-orange-600",
  },
  {
    name: "Coffee Shops",
    slug: "cafes-coffee-shops",
    description: "Find your coffee spot",
    icon: Coffee,
    color: "bg-amber-50 text-amber-700",
  },
  {
    name: "Hotels",
    slug: "hotels",
    description: "Places to stay",
    icon: BedDouble,
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Shopping",
    slug: "shopping",
    description: "Explore local shops",
    icon: ShoppingBag,
    color: "bg-purple-50 text-purple-600",
  },
];

const benefits = [
  {
    icon: Search,
    title: "Find what you need",
    description: "Explore local businesses and discover places that match what you are looking for.",
  },
  {
    icon: ShieldCheck,
    title: "Discover with confidence",
    description: "Find business information and make informed decisions before you visit.",
  },
  {
    icon: Heart,
    title: "Save your favorites",
    description: "Keep the places you love close and make your next discovery easier.",
  },
];

export const metadata = {
  title: "YeneSpot | Discover Local Businesses in Jimma",
  description:
    "Discover restaurants, coffee shops, hotels, shops, and local businesses in Jimma, Ethiopia with YeneSpot.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "YeneSpot | Discover Local Businesses in Jimma",
    description:
      "Discover restaurants, coffee shops, hotels, shops, and local businesses in Jimma, Ethiopia with YeneSpot.",
    url: "/",
    type: "website",
    images: ["/images/og-image.png"],
  },
};
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden bg-[#111111]">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-64 -left-32 h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[100px]" />

          <div className="container-page relative grid min-h-[610px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                <MapPin size={14} className="text-brand" />
                Starting in Jimma, Ethiopia
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[68px]">
                Your city.
                <br />
                Your places.
                <br />
                <span className="text-brand">Your discovery.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
                Find restaurants, coffee shops, hotels, and local businesses.
                Discover the places around you with YeneSpot.
              </p>

              <form
                action="/explore"
                method="GET"
                className="mt-9 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/20 sm:flex-row"
              >
                <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Search size={20} className="shrink-0 text-brand" />
                  <input
                    type="search"
                    name="q"
                    placeholder="What are you looking for?"
                    aria-label="Search for businesses"
                    className="h-12 w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-gray-400"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
                >
                  Search places <ArrowRight size={17} />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} /> Local discovery
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Compass size={13} /> Explore your city
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Heart size={13} /> Save your favorites
                </span>
              </div>
            </div>

            <div className="relative hidden min-h-[430px] items-center justify-center lg:flex">
              <div className="absolute h-[360px] w-[360px] rounded-full border border-white/10" />
              <div className="absolute h-[280px] w-[280px] rounded-full border border-white/10" />
              <div className="absolute h-[200px] w-[200px] rounded-full bg-brand/10 blur-2xl" />

              <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-[42px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand text-white shadow-lg shadow-brand/20">
                  <Compass size={46} strokeWidth={1.7} />
                </div>
                <span className="mt-5 text-2xl font-extrabold tracking-tight text-white">
                  Yene<span className="text-brand">Spot</span>
                </span>
                <span className="mt-1 text-xs font-medium tracking-widest text-white/50">
                  DISCOVER YOUR PLACE
                </span>
              </div>

              <div className="absolute left-0 top-16 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400/20 text-orange-300">
                  <Coffee size={22} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Coffee shops</p>
                  <p className="mt-1 text-xs text-white/50">Find your next spot</p>
                </div>
              </div>

              <div className="absolute bottom-16 right-0 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/20 text-blue-300">
                  <MapPin size={22} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Explore locally</p>
                  <p className="mt-1 text-xs text-white/50">Discover nearby places</p>
                </div>
              </div>

              <div className="absolute right-7 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-brand">
                <Sparkles size={23} />
              </div>
            </div>
          </div>
        </section>

        <section className="section-spacing bg-white">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
                  Explore by category
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                  What are you looking for?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
                  Start with a category and discover the businesses and places
                  that make your city unique.
                </p>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark"
              >
                Explore all <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.name}
                    href={`/category/${category.slug}`}
                    className="group rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-black/5"
                  >
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.color}`}>
                      <Icon size={26} strokeWidth={1.8} />
                    </span>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-text-primary">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs text-text-secondary">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={19}
                        className="text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-brand"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-spacing">
          <div className="container-page">
            <div className="grid items-center gap-10 overflow-hidden rounded-[28px] bg-[#FFF1E4] p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:p-16">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-dark">
                  <Compass size={14} /> Discover something new
                </span>
                <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-4xl">
                  The best places are closer than you think.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">
                  Search local businesses, explore categories, and find the
                  information you need to choose your next destination.
                </p>
                <Link
                  href="/explore"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
                >
                  Start exploring <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hidden h-48 w-48 items-center justify-center rounded-full border border-brand/20 bg-white/70 text-brand lg:flex">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-brand/20">
                  <Search size={58} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-spacing bg-white">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
                Simple discovery
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                A better way to find local places
              </h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                Everything starts with what you need. YeneSpot helps you take
                the next step.
              </p>
            </div>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="text-center">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
                      <Icon size={28} strokeWidth={1.8} />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand text-xs font-extrabold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-extrabold text-text-primary">
                      {benefit.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-text-secondary">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-spacing">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-[28px] bg-[#111111] px-8 py-12 sm:px-12 lg:px-16">
              <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-brand/20 blur-[90px]" />
              <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    <Store size={15} /> For local businesses
                  </div>
                  <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Help more people discover your business.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                    Bring your business online, share what you offer, and help
                    customers find you through YeneSpot.
                  </p>
                </div>
                <Link
                  href="/business-dashboard/create"
                  className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 text-sm font-extrabold text-white transition-colors hover:bg-brand-dark"
                >
                  List your business <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white py-8">
          <div className="container-page flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Users size={20} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-text-primary">Built for local discovery</p>
                <p className="mt-1 text-xs text-text-secondary">Connecting people with places.</p>
              </div>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark"
            >
              Discover your place <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}