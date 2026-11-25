"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password must not exceed 128 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const errors: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);

        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            full_name: result.data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-text-primary outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/10";

  return (
    <main className="flex min-h-screen flex-1 bg-white">
      <section className="relative hidden overflow-hidden bg-[#111111] lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px]" />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
            <Compass size={25} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Yene<span className="text-brand">Spot</span>
          </span>
        </Link>

        <div className="relative max-w-lg py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70">
            <span className="h-2 w-2 rounded-full bg-brand" />
            DISCOVER YOUR PLACE
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-[1.12] tracking-tight text-white xl:text-6xl">
            Your next
            <br />
            discovery
            <br />
            <span className="text-brand">starts here.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-8 text-white/60">
            Join YeneSpot and discover restaurants, coffee shops, hotels, and
            the local businesses that make your city special.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm font-medium text-white/60">
            <CheckCircle2 size={19} className="text-brand" />
            Discover local places in Jimma, Ethiopia.
          </div>
        </div>

        <p className="relative text-xs text-white/35">
          © 2026 YeneSpot. Discover Your Place.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-text-primary lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <Compass size={21} />
            </span>
            Yene<span className="text-brand">Spot</span>
          </Link>

          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <Mail size={30} />
              </div>

              <h2 className="mt-7 text-3xl font-extrabold tracking-tight text-text-primary">
                Check your email
              </h2>

              <p className="mt-4 text-sm leading-7 text-text-secondary">
                We sent a verification link to{" "}
                <strong className="break-all text-text-primary">
                  {form.email}
                </strong>
                . Open the email and follow the link to activate your account.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
              >
                Continue to login <ArrowRight size={17} />
              </Link>

              <p className="mt-5 text-xs leading-6 text-text-secondary">
                If you do not see the email, check your spam folder.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
                  Create your account
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                  Join YeneSpot
                </h2>

                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  Create an account to save favorites and discover more local
                  places.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-bold text-text-primary"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      required
                      value={form.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Enter your full name"
                      className={`${inputClass} pl-11`}
                    />
                  </div>

                  {fieldErrors.fullName && (
                    <p className="mt-2 text-xs text-error">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-text-primary"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="you@example.com"
                      className={`${inputClass} pl-11`}
                    />
                  </div>

                  {fieldErrors.email && (
                    <p className="mt-2 text-xs text-error">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-text-primary"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="At least 8 characters"
                      className={`${inputClass} pl-11 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {fieldErrors.password && (
                    <p className="mt-2 text-xs text-error">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-text-primary"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={form.confirmPassword}
                      onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                      }
                      placeholder="Enter your password again"
                      className={`${inputClass} pl-11 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:text-text-primary"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {fieldErrors.confirmPassword && (
                    <p className="mt-2 text-xs text-error">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-text-secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-extrabold text-brand hover:text-brand-dark"
                >
                  Log in
                </Link>
              </p>

              <p className="mt-8 text-center text-xs leading-6 text-text-secondary">
                By creating an account, you agree to use YeneSpot responsibly
                and provide accurate account information.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}