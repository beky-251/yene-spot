import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Store,
} from "lucide-react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export default async function BusinessDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?next=/business-dashboard");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "business_owner") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/business-dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8A24]">
              <MapPin className="h-5 w-5 text-white" />
            </span>
            <span>
              <span className="block text-lg font-bold text-[#171717]">
                YeneSpot
              </span>
              <span className="block text-xs text-gray-500">
                Business workspace
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-[#E87512]">
            <Store className="h-4 w-4" />
            Business owner
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              Business workspace
            </p>

            <Link
              href="/business-dashboard"
              className="flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-3 text-sm font-semibold text-[#E87512]"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/business-dashboard/create"
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-orange-50 hover:text-[#E87512]"
            >
              <PlusCircle className="h-5 w-5" />
              Add business
            </Link>

            <Link
              href="/"
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-[#E87512]"
            >
              <MapPin className="h-5 w-5" />
              View public website
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}