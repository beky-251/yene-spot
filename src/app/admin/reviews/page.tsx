import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Search,
  ShieldAlert,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateReviewStatus } from "./actions";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "approved",
  "rejected",
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];

type Review = {
  id: string;
  user_id: string;
  business_id: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string | null;
  } | null;
  businesses: {
    name: string;
    slug: string;
    city: string;
  } | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const search = (params.q ?? "").trim().toLowerCase();

  const selectedStatus: StatusFilter = STATUS_OPTIONS.includes(
    params.status as StatusFilter,
  )
    ? (params.status as StatusFilter)
    : "all";

  const { data, error } = await supabase
    .from("business_reviews")
    .select(`
      id,
      user_id,
      business_id,
      rating,
      comment,
      status,
      created_at,
      profiles:user_id (
        full_name,
        email
      ),
      businesses:business_id (
        name,
        slug,
        city
      )
    `)
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as unknown as Review[];

  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      selectedStatus === "all" || review.status === selectedStatus;

    const matchesSearch =
      !search ||
      `${review.profiles?.full_name ?? ""} ${
        review.profiles?.email ?? ""
      } ${review.businesses?.name ?? ""} ${
        review.comment ?? ""
      }`
        .toLowerCase()
        .includes(search);

    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: reviews.length,
    pending: reviews.filter((review) => review.status === "pending").length,
    approved: reviews.filter((review) => review.status === "approved").length,
    rejected: reviews.filter((review) => review.status === "rejected").length,
  };

  const filters = [
    { label: "All reviews", value: "all", count: counts.all },
    { label: "Pending", value: "pending", count: counts.pending },
    { label: "Approved", value: "approved", count: counts.approved },
    { label: "Rejected", value: "rejected", count: counts.rejected },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#E87512]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <p className="mb-2 text-sm font-semibold text-[#E87512]">
          PLATFORM MANAGEMENT
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
              Review Moderation
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Review customer feedback and manage publication status.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-[#E87512]">
            <MessageSquare className="h-5 w-5" />
            {counts.all} reviews
          </div>
        </div>
      </div>

      {params.updated && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Review {params.updated === "approved" ? "approved" : "rejected"} successfully.
        </div>
      )}

      {params.error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          {params.error === "invalid"
            ? "Invalid review update request."
            : "Unable to update the review. It may have already been moderated."}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          Unable to load reviews: {error.message}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <MessageSquare className="mb-3 h-6 w-6 text-gray-500" />
          <p className="text-2xl font-bold text-[#171717]">{counts.all}</p>
          <p className="mt-1 text-xs text-gray-500">Total reviews</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <Star className="mb-3 h-6 w-6 text-amber-500" />
          <p className="text-2xl font-bold text-[#171717]">{counts.pending}</p>
          <p className="mt-1 text-xs text-gray-500">Pending</p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <ThumbsUp className="mb-3 h-6 w-6 text-green-600" />
          <p className="text-2xl font-bold text-[#171717]">{counts.approved}</p>
          <p className="mt-1 text-xs text-gray-500">Approved</p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5">
          <ThumbsDown className="mb-3 h-6 w-6 text-red-500" />
          <p className="text-2xl font-bold text-[#171717]">{counts.rejected}</p>
          <p className="mt-1 text-xs text-gray-500">Rejected</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <form
            action="/admin/reviews"
            method="GET"
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={params.q}
                placeholder="Search reviewer, business, or comment..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
              {selectedStatus !== "all" && (
                <input
                  type="hidden"
                  name="status"
                  value={selectedStatus}
                />
              )}
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#171717] px-6 text-sm font-semibold text-white transition hover:bg-[#333]"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Link
                key={filter.value}
                href={
                  filter.value === "all"
                    ? "/admin/reviews"
                    : `/admin/reviews?status=${filter.value}`
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedStatus === filter.value
                    ? "bg-[#FF8A24] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#E87512]"
                }`}
              >
                {filter.label} ({filter.count})
              </Link>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredReviews.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <MessageSquare className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <h2 className="font-bold text-[#171717]">No reviews found</h2>
              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try another search term or status filter."
                  : "Customer reviews will appear here when submitted."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <article
                key={review.id}
                className="space-y-4 p-5 transition hover:bg-gray-50/70 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-[#171717]">
                        {review.profiles?.full_name ?? "Unknown reviewer"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          STATUS_STYLES[review.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatus(review.status)}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {review.profiles?.email ?? "No email available"}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Business:{" "}
                      {review.businesses ? (
                        <Link
                          href={`/business/${review.businesses.slug}`}
                          className="font-semibold text-[#E87512] hover:underline"
                        >
                          {review.businesses.name}
                        </Link>
                      ) : (
                        "Unknown business"
                      )}
                      {review.businesses?.city
                        ? ` · ${review.businesses.city}`
                        : ""}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Submitted {formatDate(review.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-current"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-bold text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {review.comment || "No written comment provided."}
                  </p>
                </div>

                {review.status === "pending" && (
                  <div className="flex flex-wrap gap-3">
                    <form action={updateReviewStatus}>
                      <input
                        type="hidden"
                        name="review_id"
                        value={review.id}
                      />
                      <input
                        type="hidden"
                        name="status"
                        value="approved"
                      />
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-bold text-white transition hover:bg-green-700"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Approve review
                      </button>
                    </form>

                    <form action={updateReviewStatus}>
                      <input
                        type="hidden"
                        name="review_id"
                        value={review.id}
                      />
                      <input
                        type="hidden"
                        name="status"
                        value="rejected"
                      />
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reject review
                      </button>
                    </form>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}