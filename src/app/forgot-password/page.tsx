"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

      if (resetError) {
        throw resetError;
      }

      setSubmitted(true);
    } catch {
      setError(
        "We couldn't process your request right now. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xl font-bold text-[#171717]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8A24]">
            <MapPin className="h-5 w-5 text-white" />
          </span>
          YeneSpot
        </Link>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-[#171717]">
              Check your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              If an account exists for{" "}
              <span className="font-semibold text-gray-700">{email.trim()}</span>,
              you&apos;ll receive a password reset link shortly.
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Check your inbox and spam folder. Follow the link to choose a new
              password.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A24] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#E87512]"
            >
              Back to sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-[#E87512]">
                ACCOUNT RECOVERY
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
                Forgot your password?
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                No worries. Enter the email address associated with your
                account, and we&apos;ll send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A24] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#E87512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending reset link..." : "Send reset link"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#E87512]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}