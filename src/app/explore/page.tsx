import { Suspense } from "react";
import { ExploreContent, type ExploreBusiness } from "./explore-content";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata = {
  title: "Explore Local Businesses in Jimma",
  description:
    "Explore restaurants, coffee shops, hotels, shops, and other local businesses in Jimma, Ethiopia. Search and discover places on YeneSpot.",
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore Local Businesses in Jimma",
    description:
      "Find restaurants, cafes, hotels, shops, and local businesses in Jimma, Ethiopia.",
    url: "/explore",
    siteName: "YeneSpot",
    type: "website",
    locale: "en_ET",
    images: ["/images/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Local Businesses in Jimma",
    description:
      "Discover restaurants, cafes, hotels, shops, and local businesses in Jimma, Ethiopia.",
  },
};

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      description,
      city,
      neighborhood,
      cover_image_url,
      is_featured,
      created_at,
      category:categories(name, slug)
    `)
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  let businesses: ExploreBusiness[] = [];

  if (!error) {
    businesses = (data ?? []).map((business) => ({
      ...business,
      category: Array.isArray(business.category)
        ? business.category[0] ?? null
        : business.category,
    })) as ExploreBusiness[];
  }

  const loadError = error
    ? "Unable to load businesses. Please try again."
    : "";

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[var(--background)]" />}
    >
      <ExploreContent
        businesses={businesses}
        loadError={loadError}
      />
    </Suspense>
  );
}