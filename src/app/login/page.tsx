"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("error") === "verification_failed") {
      const timeout = window.setTimeout(() => {
        setError(
          "Email verification could not be completed. Please try registering again or request a new verification link.",
        );
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          setError("Please verify your email address before signing in.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const requestedNext = params.get("next") ?? "/";
      const next =
        requestedNext.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/";

      router.replace(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[80vh] px-4 py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-[#171717] p-10 text-white lg:flex">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8A24]">
              <MapPin className="h-5 w-5 text-white" />
            </span>
            YeneSpot
          </Link>

          <div className="py-12">
            <span className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-orange-300">
              Welcome back
            </span>
            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Your next favorite place is waiting.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-gray-400">
              Sign in to discover local businesses, save your favorite places,
              and stay connected with your community.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Discover Your Place.
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8A24]">
                <MapPin className="h-5 w-5 text-white" />
              </span>
              YeneSpot
            </Link>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-[#E87512]">
              YOUR LOCAL DISCOVERY GUIDE
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#171717]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to your YeneSpot account.
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#E87512] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
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
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#E87512] hover:underline"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 transition hover:text-[#E87512]"
            >
              Back to YeneSpot home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}