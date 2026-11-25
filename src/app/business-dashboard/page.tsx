import Link from "next/link";
import {
  Building2,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type BusinessRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: string;
  is_featured: boolean;
  created_at: string;
};

export default async function BusinessDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const justCreated = params.created === "1";
  const justUpdated = params.updated === "1";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, city, status, is_featured, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const businesses = (data ?? []) as BusinessRecord[];

  const stats = [
    {
      label: "Total businesses",
      value: businesses.length,
      icon: Building2,
    },
    {
      label: "Approved",
      value: businesses.filter((item) => item.status === "approved").length,
      icon: CheckCircle2,
    },
    {
      label: "Pending review",
      value: businesses.filter((item) => item.status === "pending").length,
      icon: Clock3,
    },
    {
      label: "Rejected",
      value: businesses.filter((item) => item.status === "rejected").length,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-[#E87512]">
          Business workspace
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#171717]">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your business listings and track their approval status.
        </p>
      </div>

      {justCreated && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <h2 className="font-bold text-green-900">
                Business submitted successfully!
              </h2>
              <p className="mt-1 text-sm text-green-800">
                Your listing is awaiting admin approval.
              </p>
            </div>
          </div>
          <Link
            href="/business-dashboard/create"
            className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Add another business
          </Link>
        </div>
      )}

      {justUpdated && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div>
            <h2 className="font-bold text-green-900">
              Business information updated!
            </h2>
            <p className="mt-1 text-sm text-green-800">
              Your listing changes have been saved successfully.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load your businesses: {error.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {stat.label}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#E87512]">
                  <Icon size={20} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-[#171717]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#171717]">
              Your businesses
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your submitted business listings and their current status.
            </p>
          </div>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-[#E87512]">
            {businesses.length} listings
          </span>
        </div>

        {businesses.length > 0 ? (
          <div className="mt-6 divide-y divide-gray-100">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div>
                  <h3 className="font-bold text-[#171717]">
                    {business.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {business.city} · Submitted{" "}
                    {new Date(business.created_at).toLocaleDateString("en")}
                  </p>
                  {business.is_featured && (
                    <span className="mt-2 inline-block rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#E87512]">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold capitalize text-gray-700">
                    {business.status}
                  </span>

                  <Link
                    href={`/business-dashboard/edit/${business.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#E87512]"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  {business.status === "approved" && (
                    <Link
                      href={`/business/${business.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#E87512] hover:underline"
                    >
                      View <ArrowUpRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-gray-50 px-5 py-12 text-center">
            <Building2
              size={36}
              className="mx-auto text-gray-400"
              strokeWidth={1.5}
            />
            <h3 className="mt-4 font-bold text-[#171717]">
              No business listings yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your business listings will appear here after you submit them.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}