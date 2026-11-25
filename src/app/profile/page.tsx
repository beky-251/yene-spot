import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, UserCircle } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

import type { Metadata } from "next";

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

export default async function ProfilePage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?next=/profile");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex min-h-[60vh] items-center justify-center py-20">
          <div className="max-w-md text-center">
            <UserCircle className="mx-auto h-14 w-14 text-brand" />
            <h1 className="mt-5 text-2xl font-extrabold text-text-primary">
              Profile unavailable
            </h1>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              We couldn&apos;t load your profile. Please try again later.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const displayEmail = user.email ?? profile.email ?? "";
  const roleLabels: Record<string, string> = {
    customer: "Customer",
    business_owner: "Business owner",
    admin: "Administrator",
  };

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-surface-muted/40">
        <section className="border-b border-border bg-[#111111]">
          <div className="container-page py-14 sm:py-20">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Your account
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              My profile
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              Manage your personal information and profile photo.
            </p>
          </div>
        </section>

        <section className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-brand"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-6 py-6 sm:px-9">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-text-primary">
                      Personal information
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Update the details associated with your account.
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-brand">
                    {roleLabels[profile.role] ?? "Member"}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                <ProfileForm
                  userId={user.id}
                  initialName={profile.full_name}
                  email={displayEmail}
                  initialAvatar={profile.avatar_url}
                  role={profile.role}
                />
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-border bg-white p-6">
              <h3 className="font-bold text-text-primary">Account security</h3>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                Your email address and account permissions cannot be changed
                from this profile form.
              </p>
              <Link
                href="/forgot-password"
                className="mt-3 inline-flex text-sm font-bold text-brand hover:underline"
              >
                Change your password
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}