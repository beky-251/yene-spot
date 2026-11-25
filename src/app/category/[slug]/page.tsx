import CategoryContent, {
  type Category,
  type Business,
} from "./category-content";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("name, slug, description, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
    return {
      title: "Category not found | YeneSpot",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `/category/${data.slug}`;
  const storedDescription = data.description?.trim();
  const description =
    storedDescription && storedDescription.length >= 80
      ? storedDescription
      : `Discover ${data.name.toLowerCase()} in Jimma, Ethiopia. Browse local businesses, compare details, and find places to visit on YeneSpot.`;
  const imageUrl = data.image_url || undefined;

  return {
    title: `${data.name} in Jimma`,
    description: description.slice(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title: `${data.name} in Jimma`,
      description: description.slice(0, 160),
      url: canonicalUrl,
      siteName: "YeneSpot",
      locale: "en_ET",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: data.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} in Jimma`,
      description: description.slice(0, 160),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export const instant = false;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  let category: Category | null = categoryData;
  let businesses: Business[] = [];
  let error = "";

  if (categoryError) {
    category = null;
    error = "Unable to load this category. Please try again.";
  } else if (categoryData) {
    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, description, city, neighborhood, cover_image_url, is_featured, created_at"
      )
      .eq("category_id", categoryData.id)
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (businessError) {
      error = "Unable to load businesses in this category.";
    } else {
      businesses = businessData ?? [];
    }
  }

  return (
    <CategoryContent
      category={category}
      businesses={businesses}
      error={error}
    />
  );
}