"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Mail,
  MapPin,
  MessageCircle,

  Send,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setSuccess(false);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !subject || !message) {
      setError("Please complete all fields before submitting.");
      setLoading(false);
      return;
    }

    if (name.length > 120 || email.length > 254 ||
        subject.length > 200 || message.length > 5000) {
      setError("One or more fields exceed the allowed length.");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error: submitError } = await supabase
        .from("contact_messages")
        .insert({
          name,
          email,
          subject,
          message,
        });

      if (submitError) {
        throw submitError;
      }

      form.reset();
      setSuccess(true);
    } catch (submitError) {
      console.error("Contact submission failed:", submitError);
      setError(
        "We couldn't send your message right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden bg-[#111111]">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-brand/20 blur-[110px]" />
          <div className="container-page relative py-20 sm:py-28">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/75">
                <MessageCircle size={15} className="text-brand" />
                Contact YeneSpot
              </span>

              <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
                We&apos;d love to
                <br />
                <span className="text-brand">hear from you.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
                Have a question, suggestion, or business inquiry? Send us a
                message and let us know how we can help.
              </p>
            </div>
          </div>
        </section>

        <section className="container-page grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
          <aside>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
              Get in touch
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary">
              Let&apos;s start a conversation.
            </h2>

            <p className="mt-5 leading-8 text-text-secondary">
              Whether you&apos;re looking for information, want to list your
              business, or have feedback about YeneSpot, we&apos;re happy to hear
              from you.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand">
                  <MapPin size={22} />
                </span>
                <div>
                  <h3 className="font-bold text-text-primary">Our starting point</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Jimma, Ethiopia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand">
                  <Mail size={22} />
                </span>
                <div>
                  <h3 className="font-bold text-text-primary">Send us a message</h3>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Use the contact form and we&apos;ll receive your inquiry.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand">
                  <Compass size={22} />
                </span>
                <div>
                  <h3 className="font-bold text-text-primary">Explore YeneSpot</h3>
                  <Link
                    href="/explore"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                  >
                    Discover local places <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-2xl bg-surface-muted p-6">
              <h3 className="font-extrabold text-text-primary">
                Are you a business owner?
              </h3>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                Help more people discover your business by joining YeneSpot.
              </p>
              <Link
                href="/business-dashboard/create"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark"
              >
                Add your business <ArrowRight size={16} />
              </Link>
            </div>
          </aside>

          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-text-primary">
                Send us a message
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Fill out the form below. All fields are required.
              </p>
            </div>

            {success && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Message sent successfully!</p>
                  <p className="mt-1">
                    Thank you for contacting YeneSpot. We have received your
                    message.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-text-primary">
                    Your name
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-text-primary">
                    Email address
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text-primary">
                  Subject
                </span>
                <input
                  type="text"
                  name="subject"
                  required
                  maxLength={200}
                  placeholder="What is your message about?"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text-primary">
                  Your message
                </span>
                <textarea
                  name="message"
                  required
                  maxLength={5000}
                  rows={6}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-7 text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                <span className="mt-2 block text-xs text-text-secondary">
                  Maximum 5,000 characters.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Sending..." : "Send message"}
                {!loading && <Send size={16} />}
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}