import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    { data: profile },
    { count: totalBusinesses, error: totalError },
    { count: pendingBusinesses, error: pendingError },
    { count: approvedBusinesses, error: approvedError },
    { count: totalUsers, error: usersError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("businesses")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
  ]);

  const adminName = profile?.full_name || "Administrator";

  const hasStatisticsError =
    totalError || pendingError || approvedError || usersError;

  const statistics = [
    {
      label: "Total businesses",
      value: totalBusinesses ?? 0,
      icon: Building2,
      color: "text-gray-700",
      background: "bg-gray-100",
    },
    {
      label: "Pending approvals",
      value: pendingBusinesses ?? 0,
      icon: Clock3,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      label: "Approved businesses",
      value: approvedBusinesses ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      label: "Registered users",
      value: totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
  ];

  const managementAreas = [
    {
      title: "Business management",
      description:
        "Review business listings, process approvals, manage statuses, and feature businesses.",
      icon: Building2,
      href: "/admin/businesses",
      action: "Manage businesses",
    },
    {
      title: "User management",
      description:
        "Monitor registered accounts and manage platform access.",
      icon: Users,
      href: "/admin/users",
      action: "User management",
      comingSoon: true,
    },
    {
      title: "Reviews and moderation",
      description:
        "Review customer feedback and maintain the quality of business listings.",
      icon: MessageSquare,
      href: "/admin/reviews",
      action: "Review moderation",
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold text-[#E87512]">
          YENESPOT MANAGEMENT
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back, {adminName}. Here is an overview of your platform.
        </p>
      </div>

      <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
            <ShieldCheck className="h-7 w-7 text-[#E87512]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#171717]">
              Administrator access active
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Your account has administrator privileges. This workspace is
              protected by server-side authentication and role verification.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">
              Platform overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Live statistics from your YeneSpot database.
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            Live data
          </span>
        </div>

        {hasStatisticsError && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Some statistics could not be loaded. Check the database permissions
            and refresh this page.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((statistic) => {
            const Icon = statistic.icon;

            return (
              <div
                key={statistic.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${statistic.background}`}
                >
                  <Icon className={`h-5 w-5 ${statistic.color}`} />
                </div>

                <p className="text-3xl font-bold text-[#171717]">
                  {statistic.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {statistic.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-[#171717]">
          Management areas
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          {managementAreas.map((area) => {
            const Icon = area.icon;

            return (
              <div
                key={area.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                    <Icon className="h-6 w-6 text-[#E87512]" />
                  </div>

                  {area.comingSoon ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                      Coming soon
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      Available
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-[#171717]">{area.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {area.description}
                </p>

                {area.comingSoon ? (
                  <span className="mt-5 inline-block text-sm font-semibold text-gray-400">
                    {area.action}
                  </span>
                ) : (
                  <Link
                    href={area.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#E87512] transition hover:gap-3"
                  >
                    {area.action}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Link
        href="/admin/businesses?status=pending"
        className="flex flex-col justify-between gap-4 rounded-2xl bg-[#171717] p-6 text-white transition hover:bg-[#292929] sm:flex-row sm:items-center sm:p-8"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-300">
            <Star className="h-4 w-4" />
            BUSINESS REVIEW
          </div>
          <h2 className="text-xl font-bold">Review pending businesses</h2>
          <p className="mt-2 text-sm text-gray-400">
            Check submitted listings and decide which businesses can appear
            publicly on YeneSpot.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FF8A24] px-5 py-3 text-sm font-bold text-white">
          Review listings
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}