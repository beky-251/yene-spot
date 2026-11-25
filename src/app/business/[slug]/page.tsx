import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Store,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { createClient } from "@/lib/supabase/server";
import { FavoriteButton } from "@/components/business/favorite-button";
import { ReviewForm } from "@/components/business/review-form";

export const instant = false;

type OpeningHours = Record<string, unknown>;

function safeWebsite(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}


type OpeningStatus = "open" | "closed" | "unknown";

function getOpeningStatus(hours: OpeningHours): OpeningStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Addis_Ababa",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value;

  const weekday = getPart("weekday");
  const hour = Number(getPart("hour"));
  const minute = Number(getPart("minute"));

  if (!weekday || !Number.isFinite(hour) || !Number.isFinite(minute)) {
    return "unknown";
  }

  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const groupKey = isWeekend ? "weekends" : "weekdays";
  const legacyDays = isWeekend
    ? ["saturday", "sunday"]
    : ["monday", "tuesday", "wednesday", "thursday", "friday"];

  let schedule = hours[groupKey];

  if (!schedule || typeof schedule !== "object") {
    schedule = legacyDays
      .map((day) => hours[day])
      .find((value) => value && typeof value === "object");
  }

  if (!schedule || typeof schedule !== "object") return "unknown";

  const entry = schedule as Record<string, unknown>;

  if (entry.closed === true || entry.is_closed === true) return "closed";

  const open = entry.open ?? entry.opening ?? entry.open_time;
  const close = entry.close ?? entry.closing ?? entry.close_time;

  if (typeof open !== "string" || typeof close !== "string") {
    return "unknown";
  }

  const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const openMatch = open.match(pattern);
  const closeMatch = close.match(pattern);

  if (!openMatch || !closeMatch) return "unknown";

  const openMinutes = Number(openMatch[1]) * 60 + Number(openMatch[2]);
  const closeMinutes = Number(closeMatch[1]) * 60 + Number(closeMatch[2]);

  if (closeMinutes <= openMinutes) return "unknown";

  const currentMinutes = hour * 60 + minute;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
    ? "open"
    : "closed";
}
function formatHours(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const entry = value as Record<string, unknown>;

    if (entry.closed === true || entry.is_closed === true) {
      return "Closed";
    }

    const open = entry.open ?? entry.opening ?? entry.open_time;
    const close = entry.close ?? entry.closing ?? entry.close_time;

    if (typeof open === "string" && typeof close === "string") {
      return `${open} â€“ ${close}`;
    }

    if (typeof entry.hours === "string") return entry.hours;
  }

  return "Hours not provided";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("businesses")
    .select("name, description, city, neighborhood, cover_image_url, logo_url")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!data) {
    return {
      title: "Business not found | YeneSpot",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `/business/${slug}`;
  const imageUrl = data.cover_image_url || data.logo_url || undefined;
  const location = [data.neighborhood, data.city]
    .filter(Boolean)
    .join(", ");
  const storedDescription = data.description?.trim();
  const description =
    storedDescription && storedDescription.length >= 80
      ? storedDescription
      : `Discover ${data.name}${location ? ` in ${location}` : " in Jimma, Ethiopia"} on YeneSpot. Explore photos, services, location, and details about this local business.`;

  return {
    title: `${data.name}`,
    description: description.slice(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title: `${data.name}`,
      description: description.slice(0, 160),
      url: canonicalUrl,
      siteName: "YeneSpot",
      locale: "en_ET",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: data.name }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: `${data.name}`,
      description: description.slice(0, 160),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
function buildOpeningHoursSpecification(hours: OpeningHours) {
  const groups = [
    {
      key: "weekdays",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      legacy: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    {
      key: "weekends",
      days: ["Saturday", "Sunday"],
      legacy: ["saturday", "sunday"],
    },
  ];

  return groups.flatMap((group) => {
    const value =
      hours[group.key] ??
      group.legacy
        .map((day) => hours[day])
        .find((entry) => entry != null);

    if (!value || typeof value !== "object") return [];

    const entry = value as Record<string, unknown>;

    if (entry.closed === true || entry.is_closed === true) return [];

    const opens = entry.open ?? entry.opening ?? entry.open_time;
    const closes = entry.close ?? entry.closing ?? entry.close_time;
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      typeof opens !== "string" ||
      typeof closes !== "string" ||
      !timePattern.test(opens) ||
      !timePattern.test(closes)
    ) {
      return [];
    }

    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: group.days.map((day) => `https://schema.org/${day}`),
        opens,
        closes,
      },
    ];
  });
}
export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      description,
      phone,
      whatsapp,
      email,
      website,
      logo_url,
      cover_image_url,
      address,
      city,
      neighborhood,
      opening_hours,
      is_featured,
      category:categories(name, slug)
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

  const [imagesResult, reviewsResult] = await Promise.all([
    supabase
      .from("business_images")
      .select("id, image_url, display_order")
      .eq("business_id", business.id)
      .order("display_order", { ascending: true }),

    supabase
      .from("business_reviews")
      .select("id, rating, comment, created_at")
      .eq("business_id", business.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
  ]);

  const images = imagesResult.data ?? [];
  const reviews = reviewsResult.data ?? [];

  const category = Array.isArray(business.category)
    ? business.category[0]
    : business.category;

  const rating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

  const gallery = [
    ...(business.cover_image_url ? [business.cover_image_url] : []),
    ...images.map((image) => image.image_url),
  ].filter((image, index, list) => list.indexOf(image) === index);

  const hours = (business.opening_hours ?? {}) as OpeningHours;
  const openingStatus = getOpeningStatus(hours);

  const canonicalUrl = `/business/${business.slug}`;
  const schemaUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${canonicalUrl}`;
  const storedSchemaDescription = business.description?.trim();
  const schemaDescription =
    storedSchemaDescription && storedSchemaDescription.length >= 80
      ? storedSchemaDescription
      : `Discover ${business.name}${business.city ? ` in ${business.city}` : " in Jimma, Ethiopia"} on YeneSpot. Explore photos, services, location, and business details.`;
  const openingHoursSpecification =
    buildOpeningHoursSpecification(hours);

  const businessStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${schemaUrl}#business`,
    name: business.name,
    description: schemaDescription,
    url: business.website ? safeWebsite(business.website) : schemaUrl,
    mainEntityOfPage: schemaUrl,
    ...(gallery.length > 0 ? { image: gallery } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.email ? { email: business.email } : {}),
    ...(business.address || business.city
      ? {
          address: {
            "@type": "PostalAddress",
            ...(business.address ? { streetAddress: business.address } : {}),
            ...(business.city ? { addressLocality: business.city } : {}),
            addressCountry: "ET",
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(rating.toFixed(1)),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(openingHoursSpecification.length > 0
      ? { openingHoursSpecification }
      : {}),
  };
  const contactLinks = [
    business.phone
      ? {
          label: business.phone,
          href: `tel:${business.phone}`,
          icon: Phone,
        }
      : null,
    business.whatsapp
      ? {
          label: "WhatsApp",
          href: `https://wa.me/${business.whatsapp.replace(/\D/g, "")}`,
          icon: MessageCircle,
        }
      : null,
    business.email
      ? {
          label: business.email,
          href: `mailto:${business.email}`,
          icon: Mail,
        }
      : null,
    business.website
      ? {
          label: "Visit website",
          href: safeWebsite(business.website),
          icon: Globe,
        }
      : null,
  ].filter((item) => item !== null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessStructuredData).replace(/</g, "\\u003c"),
        }}
      />      <SiteHeader />

      <main className="min-h-screen bg-surface-muted">
        <div className="container-page py-7 sm:py-10">
          <Link
            href="/explore"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-brand"
          >
            <ArrowLeft size={17} />
            Back to explore
          </Link>

          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="relative h-64 bg-gradient-to-br from-orange-100 via-orange-50 to-gray-100 sm:h-80 lg:h-[420px]">
              {business.cover_image_url ? (
                <Image
                  src={business.cover_image_url}
                  alt={`${business.name} cover`}
                  width={1600}
                  height={700}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-brand">
                  <Store size={58} strokeWidth={1.4} />
                  <span className="mt-3 text-sm font-semibold">
                    {business.name}
                  </span>
                </div>
              )}

              {business.is_featured && (
                <span className="absolute left-5 top-5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm">
                  Featured business
                </span>
              )}
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted">
                  {business.logo_url ? (
                    <Image
                      src={business.logo_url}
                      alt={`${business.name} logo`}
                      width={160}
                      height={160}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store size={32} className="text-brand" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {category?.name && category?.slug && (
                      <Link
                        href={`/category/${category.slug}`}
                        className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {category.name}
                      </Link>
                    )}
                    {business.is_featured && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                    {business.name}
                  </h1>
                  <div className="mt-3">
                    {openingStatus === "open" ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Open now
                      </span>
                    ) : openingStatus === "closed" ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Closed now
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                        Hours not provided
                      </span>
                    )}
                  </div>

                  <FavoriteButton
                    businessId={business.id}
                    slug={business.slug}
                  />

                  <p className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin size={17} className="shrink-0 text-brand" />
                    {[business.address, business.neighborhood, business.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={18} fill="currentColor" />
                      <span className="font-bold text-text-primary">
                        {reviews.length > 0 ? rating.toFixed(1) : "New"}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-8">
              {business.description && (
                <section className="rounded-3xl border border-border bg-white p-6 sm:p-8">
                  <h2 className="text-xl font-extrabold text-text-primary">
                    About this business
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-8 text-text-secondary">
                    {business.description}
                  </p>
                </section>
              )}

              {gallery.length > 0 && (
                <section className="rounded-3xl border border-border bg-white p-6 sm:p-8">
                  <h2 className="text-xl font-extrabold text-text-primary">
                    Photos
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted"
                      >
                        <Image
                          src={image}
                          alt={`${business.name} photo ${index + 1}`}
                          width={800}
                          height={600}
                          unoptimized
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

                            <ReviewForm
                    businessId={business.id}
                    slug={business.slug}
                  />
                  <section className="rounded-3xl border border-border bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-text-primary">
                      Customer reviews
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Feedback from people who visited this business.
                    </p>
                  </div>

                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Star
                        size={20}
                        className="text-amber-500"
                        fill="currentColor"
                      />
                      <span className="text-xl font-extrabold text-text-primary">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {reviews.length > 0 ? (
                  <div className="mt-6 divide-y divide-border">
                    {reviews.map((review) => (
                      <article key={review.id} className="py-5 first:pt-0">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star
                              key={index}
                              size={16}
                              fill={
                                index < review.rating
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>

                        {review.comment && (
                          <p className="mt-3 text-sm leading-7 text-text-secondary">
                            {review.comment}
                          </p>
                        )}

                        <p className="mt-3 text-xs text-text-secondary">
                          {new Date(review.created_at).toLocaleDateString(
                            "en",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-surface-muted px-5 py-8 text-center">
                    <Star
                      size={30}
                      className="mx-auto text-brand"
                      strokeWidth={1.5}
                    />
                    <p className="mt-3 font-bold text-text-primary">
                      No reviews yet
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      Be the first to share your experience.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-border bg-white p-6">
                <h2 className="text-lg font-extrabold text-text-primary">
                  Contact information
                </h2>

                {contactLinks.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {contactLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          target={
                            item.href.startsWith("https://") ? "_blank" : undefined
                          }
                          rel={
                            item.href.startsWith("https://")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="flex items-center gap-3 text-sm font-semibold text-text-secondary transition hover:text-brand"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                            <Icon size={18} />
                          </span>
                          <span className="min-w-0 break-all">{item.label}</span>
                          {item.href.startsWith("https://") && (
                            <ArrowUpRight size={15} className="ml-auto shrink-0" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-text-secondary">
                    Contact information has not been provided.
                  </p>
                )}
              </section>

              <section className="rounded-3xl border border-border bg-white p-6">
                <div className="flex items-center gap-2">
                  <Clock3 size={20} className="text-brand" />
                  <h2 className="text-lg font-extrabold text-text-primary">
                    Opening hours
                  </h2>
                </div>

                {(hours.weekdays ?? hours.monday ?? hours.tuesday ?? hours.wednesday ?? hours.thursday ?? hours.friday ?? hours.weekends ?? hours.saturday ?? hours.sunday) ? (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="font-semibold text-text-primary">
                        Monday â€“ Friday
                      </span>
                      <span className="text-right text-text-secondary">
                        {formatHours(hours.weekdays ?? hours.monday ?? hours.tuesday ?? hours.wednesday ?? hours.thursday ?? hours.friday)}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="font-semibold text-text-primary">
                        Saturday â€“ Sunday
                      </span>
                      <span className="text-right text-text-secondary">
                        {formatHours(hours.weekends ?? hours.saturday ?? hours.sunday)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-text-secondary">
                    Opening hours have not been provided.
                  </p>
                )}              </section>

              <Link
                href="/explore"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                Explore more places
                <ArrowUpRight size={17} />
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
