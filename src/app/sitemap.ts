import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";


function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const supabase = createPublicSupabaseClient();
  const lastModified = new Date();

  const pageSize = 1000;

  const categories: { slug: string }[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("categories")
      .select("slug")
      .eq("is_active", true)
      .order("slug")
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(
        `Failed to load sitemap categories: ${error.message}`,
      );
    }

    categories.push(...(data ?? []));

    if (!data || data.length < pageSize) break;
  }

  const businesses: { slug: string }[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug")
      .eq("status", "approved")
      .order("slug")
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(
        `Failed to load sitemap businesses: ${error.message}`,
      );
    }

    businesses.push(...(data ?? []));

    if (!data || data.length < pageSize) break;
  }
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map(({ slug }) => ({
    url: `${siteUrl}/category/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const businessPages: MetadataRoute.Sitemap = businesses.map(({ slug }) => ({
    url: `${siteUrl}/business/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...businessPages];
}