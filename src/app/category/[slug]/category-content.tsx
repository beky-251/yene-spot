"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowDownUp,
  MapPin,
  Search,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";


export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  created_at: string;
};

type SortOption = "recommended" | "name" | "newest";

const PAGE_SIZE = 9;

export type CategoryContentProps = {
  category: Category | null;
  businesses: Business[];
  error?: string;
};

export default function CategoryPage({
  category,
  businesses,
  error = "",
}: CategoryContentProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [page, setPage] = useState(1);

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase();

    const results = businesses.filter((business) => {
      return (
        !term ||
        business.name.toLowerCase().includes(term) ||
        (business.description ?? "").toLowerCase().includes(term) ||
        business.city.toLowerCase().includes(term) ||
        (business.neighborhood ?? "").toLowerCase().includes(term)
      );
    });

    if (sort === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    } else {
      results.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
      );
    }

    return results;
  }, [businesses, search, sort]);

  const totalPages = Math.ceil(filteredBusinesses.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const visibleBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[var(--background)]">
        {error ? (
          <div className="mx-auto max-w-7xl px-5 py-24 text-center">
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
            >
              Explore all places <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : !category ? (
          <div className="mx-auto max-w-7xl px-5 py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[var(--primary)]">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
              Category not found
            </h1>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              This category may have been removed or is no longer available.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Explore places <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <section className="border-b border-[var(--border)] bg-white">
              <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
                <Link
                  href="/explore"
                  className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  All places
                </Link>

                <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
                  <div>
                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                      Explore category
                    </span>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
                      {category.name}
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                      {category.description ||
                        `Discover the best ${category.name.toLowerCase()} and local businesses in Jimma, Ethiopia.`}
                    </p>

                    <div className="mt-7 flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
                      <MapPin className="h-4 w-4 text-[var(--primary)]" />
                      Jimma, Ethiopia
                    </div>
                  </div>

                  <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-gray-100">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        priority
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--primary)]">
                        <Store className="h-20 w-20 opacity-40" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                    Explore {category.name}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Find local businesses and discover places worth visiting.
                  </p>
                </div>

                <label className="flex h-11 items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 sm:w-80">
                  <Search className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => updateSearch(event.target.value)}
                    placeholder="Search this category..."
                    aria-label="Search this category"
                    className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-bold text-[var(--foreground)]">
                    {filteredBusinesses.length}
                  </span>{" "}
                  {filteredBusinesses.length === 1 ? "place" : "places"} found
                </p>

                <label className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 text-sm">
                  <ArrowDownUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--muted-foreground)]">Sort:</span>
                  <select
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value as SortOption);
                      setPage(1);
                    }}
                    aria-label="Sort businesses"
                    className="bg-transparent font-semibold text-[var(--foreground)] outline-none"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="name">Name</option>
                    <option value="newest">Newest</option>
                  </select>
                </label>
              </div>

              {visibleBusinesses.length > 0 ? (
                <>
                  <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleBusinesses.map((business) => (
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
                              unoptimized
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[var(--primary)]">
                              <Store className="h-14 w-14 opacity-50" />
                            </div>
                          )}

                          {business.is_featured && (
                            <span className="absolute left-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
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
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav
                      aria-label="Category pagination"
                      className="mt-10 flex items-center justify-center gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <span className="text-sm text-[var(--muted-foreground)]">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPage((value) => Math.min(totalPages, value + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center px-5 py-16 text-center sm:py-20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[var(--primary)]">
                    <Store className="h-8 w-8" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                    {search
                      ? "No matching businesses"
                      : "No businesses in this category yet"}
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                    {search
                      ? "Try a different search term to find what you are looking for."
                      : "We're working to bring more local businesses in this category to YeneSpot. Check back soon."}
                  </p>

                  {search && (
                    <button
                      type="button"
                      onClick={() => updateSearch("")}
                      className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </>
  );
}