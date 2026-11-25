"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";


const categories = [
  "All places",
  "Restaurants",
  "Coffee Shops",
  "Hotels",
  "Shopping",
] as const;

type Category = (typeof categories)[number];
type SortOption = "recommended" | "name" | "newest";

export type ExploreBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  category: { name: string; slug: string } | null;
  is_featured: boolean;
  created_at: string;
};
export function ExploreContent({ businesses, loadError }: { businesses: ExploreBusiness[]; loadError: string }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    const initialCategory = searchParams.get("category");
    return (
      categories.find(
        (category) =>
          category.toLowerCase() === initialCategory?.toLowerCase(),
      ) ?? "All places"
    );
  });

  const [sort, setSort] = useState<SortOption>("recommended");
  const [showFilters, setShowFilters] = useState(false);


  const normalizedSearch = search.trim().toLowerCase();

  const filteredBusinesses = useMemo(() => {
    const results = businesses.filter((business) => {
      const categoryName = business.category?.name ?? "";

      const matchesSearch =
        !normalizedSearch ||
        business.name.toLowerCase().includes(normalizedSearch) ||
        (business.description ?? "").toLowerCase().includes(normalizedSearch) ||
        categoryName.toLowerCase().includes(normalizedSearch) ||
        business.city.toLowerCase().includes(normalizedSearch) ||
        (business.neighborhood ?? "").toLowerCase().includes(normalizedSearch);

      const normalizedCategory = categoryName.toLowerCase();
      const matchesCategory =
        activeCategory === "All places" ||
        normalizedCategory === activeCategory.toLowerCase() ||
        (activeCategory === "Coffee Shops" &&
          normalizedCategory.includes("coffee"));

      return matchesSearch && matchesCategory;
    });

    if (sort === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
    }

    return results;
  }, [businesses, normalizedSearch, activeCategory, sort]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (activeCategory !== "All places") {
      params.set("category", activeCategory);
    }

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `/explore?${query}` : "/explore",
    );
  }

  function clearFilters() {
    setSearch("");
    setActiveCategory("All places");
    setSort("recommended");
    window.history.replaceState(null, "", "/explore");
  }

  const hasActiveFilters =
    search.trim() !== "" || activeCategory !== "All places";

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 lg:px-10 lg:pb-14 lg:pt-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)]">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              Discover places in Jimma, Ethiopia
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
                  Find your next{" "}
                  <span className="text-[var(--primary)]">favorite spot.</span>
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
                  Explore restaurants, coffee shops, hotels, and local
                  businesses. Your next discovery starts here.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Compass className="h-5 w-5 text-[var(--primary)]" />
                <span>Starting in Jimma</span>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-9 flex max-w-4xl flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search businesses or places..."
                  aria-label="Search businesses or places"
                  className="h-12 w-full min-w-0 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="rounded-full p-1 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-7 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Search places
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Explore places
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Discover what your city has to offer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                  showFilters
                    ? "border-[var(--primary)] bg-orange-50 text-[var(--primary)]"
                    : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              <label className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--muted-foreground)]">
                <ArrowDownUp className="h-4 w-4" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  aria-label="Sort businesses"
                  className="max-w-36 bg-transparent font-medium text-[var(--foreground)] outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown className="h-3 w-3" />
              </label>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={active}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {showFilters && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  Category filters
                </h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Choose a category to narrow your discovery.
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-9 flex items-center justify-between border-b border-[var(--border)] pb-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">
                {filteredBusinesses.length}
              </span>{" "}
              {filteredBusinesses.length === 1 ? "place" : "places"} found
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {loadError ? (
            <div
              role="alert"
              className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"
            >
              {loadError}
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBusinesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/business/${business.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-gray-100">
                    {business.cover_image_url ? (
                      <Image
                        src={business.cover_image_url}
                        alt={`${business.name} cover`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--primary)]">
                        <Store className="h-14 w-14 opacity-60" />
                      </div>
                    )}

                    {business.is_featured && (
                      <span className="absolute left-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                      {business.category?.name ?? "Uncategorized"}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                      {business.name}
                    </h3>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {[business.neighborhood, business.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    {business.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        {business.description}
                      </p>
                    )}

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                      View details
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 py-16 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[var(--primary)]">
                <Store className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                {hasActiveFilters
                  ? "No matching places yet"
                  : "Your next discovery is coming"}
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                {hasActiveFilters
                  ? "We couldn't find any places matching these filters. Try another search or explore a different category."
                  : "We're getting ready to bring local businesses in Jimma together in one place. Check back soon as listings become available."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  <Check className="h-4 w-4" />
                  Clear filters
                </button>
              )}

              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
              >
                Back to homepage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

