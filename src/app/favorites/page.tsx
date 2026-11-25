import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Heart,
  MapPin,
  Store,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { createClient } from "@/lib/supabase/server";
import { RemoveFavoriteButton } from "./remove-favorite-button";

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const instant = false;

type FavoriteBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  category: { name: string } | null;
};

type FavoriteRecord = {
  id: string;
  created_at: string;
  businesses: FavoriteBusiness;
};

export default async function FavoritesPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/favorites");
  }

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      businesses!inner (
        id,
        name,
        slug,
        description,
        city,
        neighborhood,
        cover_image_url,
        category:categories (name)
      )
    `)
    .eq("user_id", user.id)
    .eq("businesses.status", "approved")
    .order("created_at", { ascending: false });

  const favorites = (data ?? []) as unknown as FavoriteRecord[];

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:gap-3"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Explore businesses
            </Link>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[var(--primary)]">
                <Heart className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Your collection
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  My Favorites
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Keep the local places you love close. Find your saved
              businesses whenever you need them.
            </p>

            {!error && (
              <p className="mt-5 text-sm font-medium text-[var(--muted-foreground)]">
                {favorites.length}{" "}
                {favorites.length === 1 ? "business saved" : "businesses saved"}
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
            >
              We could not load your favorites. Please refresh the page and
              try again.
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => {
                const business = favorite.businesses;

                return (
                  <article
                    key={favorite.id}
                    className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
                  >
                    <Link
                      href={`/business/${business.slug}`}
                      className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-gray-100"
                    >
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
                        <div className="flex h-full items-center justify-center text-orange-300">
                          <Store className="h-14 w-14" />
                        </div>
                      )}

                      <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-md">
                        <Heart className="h-5 w-5" fill="currentColor" />
                      </span>
                    </Link>

                    <div className="p-5">
                      {business.category?.name && (
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                          {business.category.name}
                        </p>
                      )}

                      <Link href={`/business/${business.slug}`}>
                        <h2 className="mt-2 text-xl font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                          {business.name}
                        </h2>
                      </Link>

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

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                        <Link
                          href={`/business/${business.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] transition hover:gap-3"
                        >
                          View business
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <RemoveFavoriteButton favoriteId={favorite.id} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center sm:py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-[var(--primary)]">
                <Heart className="h-9 w-9" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
                Your favorites are waiting
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted-foreground)]">
                You have not saved any businesses yet. Explore local places
                around Jimma and tap the heart button on businesses you love.
              </p>

              <Link
                href="/explore"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Discover businesses
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