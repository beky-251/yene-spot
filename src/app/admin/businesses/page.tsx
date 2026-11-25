import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Search,
  ShieldAlert,
  Star,
  Store,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateBusiness } from "./actions";

type BusinessStatus = "pending" | "approved" | "rejected" | "suspended";

type Business = {
  id: string;
  owner_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  city: string;
  neighborhood: string | null;
  status: BusinessStatus;
  is_featured: boolean;
  created_at: string;
};

const STATUS_OPTIONS: BusinessStatus[] = [
  "pending",
  "approved",
  "rejected",
  "suspended",
];

const STATUS_STYLES: Record<BusinessStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  suspended: "bg-gray-100 text-gray-700",
};

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    updated?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const search = (params.q ?? "").trim().toLowerCase();
  const selectedStatus = STATUS_OPTIONS.includes(
    params.status as BusinessStatus,
  )
    ? (params.status as BusinessStatus)
    : "all";

  let query = supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data, error } = await query;

  const businesses = (data ?? []) as Business[];

  const filteredBusinesses = search
    ? businesses.filter((business) =>
        [
          business.name,
          business.city,
          business.neighborhood ?? "",
          business.phone ?? "",
          business.email ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
    : businesses;

  const ownerIds = [...new Set(businesses.map((business) => business.owner_id))];
  const categoryIds = [
    ...new Set(
      businesses
        .map((business) => business.category_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [{ data: owners }, { data: categories }] = await Promise.all([
    ownerIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", ownerIds)
      : Promise.resolve({ data: [] }),
    categoryIds.length
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [] }),
  ]);

  const ownerNames = new Map(
    (owners ?? []).map((owner) => [owner.id, owner.full_name]),
  );

  const categoryNames = new Map(
    (categories ?? []).map((category) => [category.id, category.name]),
  );

  const counts = {
    all: businesses.length,
    pending: businesses.filter((item) => item.status === "pending").length,
    approved: businesses.filter((item) => item.status === "approved").length,
    rejected: businesses.filter((item) => item.status === "rejected").length,
    suspended: businesses.filter((item) => item.status === "suspended").length,
  };

  const filters = [
    { label: "All", value: "all", count: counts.all },
    { label: "Pending", value: "pending", count: counts.pending },
    { label: "Approved", value: "approved", count: counts.approved },
    { label: "Rejected", value: "rejected", count: counts.rejected },
    { label: "Suspended", value: "suspended", count: counts.suspended },
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
              Business Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Review listings, manage approvals, and feature businesses.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-[#E87512]">
            <Store className="h-5 w-5" />
            {counts.all} businesses
          </div>
        </div>
      </div>

      {params.updated === "1" && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Business information updated successfully.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          Unable to load businesses: {error.message}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Building2 className="mb-3 h-6 w-6 text-gray-500" />
          <p className="text-2xl font-bold text-[#171717]">{counts.all}</p>
          <p className="mt-1 text-xs text-gray-500">Total businesses</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <Clock3 className="mb-3 h-6 w-6 text-amber-600" />
          <p className="text-2xl font-bold text-[#171717]">{counts.pending}</p>
          <p className="mt-1 text-xs text-gray-500">Pending review</p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <CheckCircle2 className="mb-3 h-6 w-6 text-green-600" />
          <p className="text-2xl font-bold text-[#171717]">{counts.approved}</p>
          <p className="mt-1 text-xs text-gray-500">Approved</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-5">
          <Star className="mb-3 h-6 w-6 text-[#E87512]" />
          <p className="text-2xl font-bold text-[#171717]">
            {businesses.filter((item) => item.is_featured).length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Featured listings</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <form
            action="/admin/businesses"
            method="GET"
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={params.q}
                placeholder="Search business, city, phone, or email..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {selectedStatus !== "all" && (
              <input type="hidden" name="status" value={selectedStatus} />
            )}

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
                    ? "/admin/businesses"
                    : `/admin/businesses?status=${filter.value}`
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
          {filteredBusinesses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Building2 className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <h2 className="font-bold text-[#171717]">
                No businesses found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            filteredBusinesses.map((business) => (
              <article
                key={business.id}
                className="p-5 transition hover:bg-gray-50/70 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[#171717]">
                        {business.name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[business.status]}`}
                      >
                        {formatStatus(business.status)}
                      </span>

                      {business.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-[#E87512]">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {categoryNames.get(business.category_id ?? "") ?? "Uncategorized"}
                      {" · "}
                      {business.city}
                      {business.neighborhood
                        ? ` · ${business.neighborhood}`
                        : ""}
                    </p>

                    <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Owner:
                        </span>{" "}
                        {ownerNames.get(business.owner_id) ?? "Unknown"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Phone:
                        </span>{" "}
                        {business.phone ?? "Not provided"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Email:
                        </span>{" "}
                        {business.email ?? "Not provided"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Submitted:
                        </span>{" "}
                        {new Date(business.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      href={`/business/${business.slug}`}
                      target="_blank"
                      className="mt-4 inline-block text-xs font-semibold text-[#E87512] hover:underline"
                    >
                      View public listing →
                    </Link>
                  </div>

                  <form
                    action={updateBusiness}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 xl:w-64"
                  >
                    <input
                      type="hidden"
                      name="business_id"
                      value={business.id}
                    />

                    <label
                      htmlFor={`status-${business.id}`}
                      className="mb-2 block text-xs font-bold text-gray-600"
                    >
                      Business status
                    </label>

                    <select
                      id={`status-${business.id}`}
                      name="status"
                      defaultValue={business.status}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#FF8A24]"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>

                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        name="is_featured"
                        defaultChecked={business.is_featured}
                        className="h-4 w-4 rounded border-gray-300 accent-[#FF8A24]"
                      />
                      Feature this business
                    </label>

                    <button
                      type="submit"
                      className="mt-4 h-10 w-full rounded-lg bg-[#FF8A24] px-4 text-sm font-bold text-white transition hover:bg-[#E87512]"
                    >
                      Save changes
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}