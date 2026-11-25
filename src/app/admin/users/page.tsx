import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { promoteBusinessOwner } from "./actions";

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

const ROLE_OPTIONS = [
  "all",
  "customer",
  "business_owner",
  "admin",
] as const;

type RoleFilter = (typeof ROLE_OPTIONS)[number];

const ROLE_STYLES: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700",
  business_owner: "bg-orange-50 text-orange-700",
  admin: "bg-purple-50 text-purple-700",
};

function formatRole(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    promoted?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const search = (params.q ?? "").trim().toLowerCase();

  const selectedRole: RoleFilter = ROLE_OPTIONS.includes(
    params.role as RoleFilter,
  )
    ? (params.role as RoleFilter)
    : "all";

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  const profiles = (data ?? []) as Profile[];

  const filteredProfiles = profiles.filter((profile) => {
    const matchesRole =
      selectedRole === "all" || profile.role === selectedRole;

    const matchesSearch =
      !search ||
      `${profile.full_name} ${profile.email ?? ""}`
        .toLowerCase()
        .includes(search);

    return matchesRole && matchesSearch;
  });

  const counts = {
    all: profiles.length,
    customer: profiles.filter((profile) => profile.role === "customer").length,
    business_owner: profiles.filter(
      (profile) => profile.role === "business_owner",
    ).length,
    admin: profiles.filter((profile) => profile.role === "admin").length,
  };

  const filters = [
    { label: "All users", value: "all", count: counts.all },
    { label: "Customers", value: "customer", count: counts.customer },
    {
      label: "Business owners",
      value: "business_owner",
      count: counts.business_owner,
    },
    { label: "Administrators", value: "admin", count: counts.admin },
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
              User Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View registered users and manage business-owner access.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-[#E87512]">
            <Users className="h-5 w-5" />
            {counts.all} users
          </div>
        </div>
      </div>

      {params.promoted === "1" && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Business-owner access granted successfully.
        </div>
      )}

      {params.error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          {params.error === "invalid_user"
            ? "The selected user ID is invalid."
            : params.error === "permission"
              ? "You are not authorized to perform this action."
              : "Promotion failed. The user may no longer be a customer."}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          Unable to load users: {error.message}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Users className="mb-3 h-6 w-6 text-gray-500" />
          <p className="text-2xl font-bold text-[#171717]">{counts.all}</p>
          <p className="mt-1 text-xs text-gray-500">Total users</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5">
          <UserPlus className="mb-3 h-6 w-6 text-blue-600" />
          <p className="text-2xl font-bold text-[#171717]">
            {counts.customer}
          </p>
          <p className="mt-1 text-xs text-gray-500">Customers</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-5">
          <ShieldCheck className="mb-3 h-6 w-6 text-[#E87512]" />
          <p className="text-2xl font-bold text-[#171717]">
            {counts.business_owner}
          </p>
          <p className="mt-1 text-xs text-gray-500">Business owners</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <form
            action="/admin/users"
            method="GET"
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={params.q}
                placeholder="Search by name or email..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
              {selectedRole !== "all" && (
                <input type="hidden" name="role" value={selectedRole} />
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
                    ? "/admin/users"
                    : `/admin/users?role=${filter.value}`
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedRole === filter.value
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
          {filteredProfiles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <h2 className="font-bold text-[#171717]">No users found</h2>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or role filter.
              </p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <article
                key={profile.id}
                className="flex flex-col justify-between gap-5 p-5 transition hover:bg-gray-50/70 sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                                alt={profile.full_name ? `${profile.full_name} avatar` : "User avatar"}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg font-bold text-[#E87512]">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-[#171717]">
                        {profile.full_name}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          ROLE_STYLES[profile.role] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatRole(profile.role)}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {profile.email ?? "No email on profile"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {profile.role === "customer" && (
                  <form action={promoteBusinessOwner}>
                    <input
                      type="hidden"
                      name="user_id"
                      value={profile.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FF8A24] px-4 text-sm font-bold text-white transition hover:bg-[#E87512]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Make business owner
                    </button>
                  </form>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}