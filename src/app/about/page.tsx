import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const values = [
  {
    icon: Compass,
    title: "Local discovery",
    description:
      "Explore restaurants, coffee shops, hotels, shops, and other businesses in your city.",
  },
  {
    icon: ShieldCheck,
    title: "Useful information",
    description:
      "Find business details that help you make informed decisions about where to go.",
  },
  {
    icon: Heart,
    title: "Your favorite places",
    description:
      "Save the businesses you love and make it easier to find them again.",
  },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description:
      "Search for businesses or browse categories to find places that interest you.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Explore",
    description:
      "View business details, locations, and other useful information before visiting.",
  },
  {
    number: "03",
    icon: Heart,
    title: "Connect",
    description:
      "Save your favorite places and discover more of what your community offers.",
  },
];

export const metadata = {
  title: "About YeneSpot: Local Discovery in Jimma",
  description:
    "Learn about YeneSpot, a local discovery platform helping people find businesses and explore places in Jimma, Ethiopia.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About YeneSpot: Local Discovery in Jimma",
    description:
      "Learn about YeneSpot, a local discovery platform helping people find businesses and explore places in Jimma, Ethiopia.",
    url: "/about",
    type: "website",
    images: ["/images/og-image.png"],
  },
};
export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden bg-[#111111]">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand/20 blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-48 -left-32 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[100px]" />

          <div className="container-page relative py-24 sm:py-32">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/75">
                <Compass size={15} className="text-brand" />
                About YeneSpot
              </span>

              <h1 className="mt-8 text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Discover the places
                <br />
                that make your city
                <br />
                <span className="text-brand">special.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                YeneSpot is a local discovery platform that helps people find
                businesses, explore new places, and connect with their
                communities. We are starting in Jimma, Ethiopia, with a vision
                to make local discovery easier.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/explore"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
                >
                  Explore places <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-28">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
              Our purpose
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-4xl">
              Bringing local businesses and people closer.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-text-secondary">
            <p>
              Finding the right place should be simple. Whether you are looking
              for somewhere to eat, a coffee shop to visit, a place to stay, or
              a local shop, discovering your options should not be difficult.
            </p>
            <p>
              YeneSpot brings local business information together in one
              accessible place. We want to help people discover what their
              communities offer while giving local businesses another way to
              be found.
            </p>
          </div>
        </section>

        <section className="bg-surface-muted py-20 sm:py-24">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
                What matters to us
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                Discovery made more meaningful.
              </h2>
              <p className="mt-5 leading-7 text-text-secondary">
                We focus on making local discovery useful, accessible, and
                convenient for everyone.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.title}
                    className="rounded-3xl border border-border bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-brand">
                      <Icon size={27} />
                    </div>
                    <h3 className="mt-7 text-xl font-extrabold text-text-primary">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container-page py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
                How it works
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-4xl">
                A simpler way to find your next place.
              </h2>
              <p className="mt-5 leading-7 text-text-secondary">
                From searching to saving your favorites, YeneSpot makes it
                easier to explore the businesses around you.
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.number}
                    className="flex gap-5 rounded-2xl border border-border p-6 sm:gap-7 sm:p-7"
                  >
                    <span className="pt-1 text-sm font-extrabold text-brand">
                      {step.number}
                    </span>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand">
                      <Icon size={23} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#111111] py-20 sm:py-24">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
                  Built for local communities
                </span>
                <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  Great places deserve to be discovered.
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-white/60">
                  Local businesses are an important part of every community.
                  YeneSpot aims to make it easier for people to find them and
                  for businesses to reach new customers.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                  <Users size={27} className="text-brand" />
                  <h3 className="mt-5 text-lg font-extrabold text-white">
                    For everyone
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/55">
                    Find places, explore options, and save your favorites.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                  <Store size={27} className="text-brand" />
                  <h3 className="mt-5 text-lg font-extrabold text-white">
                    For businesses
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/55">
                    Give more people an opportunity to discover your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-20 sm:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand px-7 py-14 text-center sm:px-14 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-white/15" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to discover your place?
              </h2>
              <p className="mt-5 leading-7 text-white/80">
                Start exploring local businesses and find somewhere new to
                experience.
              </p>
              <Link
                href="/explore"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-extrabold text-brand transition-transform hover:-translate-y-0.5"
              >
                Start exploring <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}