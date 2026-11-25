"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReviewRecord = {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
};

type ReviewFormProps = {
  businessId: string;
  slug: string;
};

export function ReviewForm({ businessId, slug }: ReviewFormProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [existingReview, setExistingReview] =
    useState<ReviewRecord | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviewData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const [profileResult, reviewResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("business_reviews")
          .select("id, rating, comment, status")
          .eq("business_id", businessId)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!active) return;

      setRole(profileResult.data?.role ?? null);

      if (reviewResult.data) {
        const review = reviewResult.data as ReviewRecord;
        setExistingReview(review);
        setRating(review.rating);
        setComment(review.comment ?? "");
      }

      setLoading(false);
    }

    void loadReviewData();

    return () => {
      active = false;
    };
  }, [businessId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!userId || role !== "customer") {
      setError("Only customer accounts can submit reviews.");
      return;
    }

    if (existingReview) {
      setError("You have already submitted a review for this business.");
      return;
    }

    if (comment.trim().length > 1000) {
      setError("Your review must be 1,000 characters or fewer.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    const { data, error: submitError } = await supabase
      .from("business_reviews")
      .insert({
        user_id: userId,
        business_id: businessId,
        rating,
        comment: comment.trim() || null,
        status: "pending",
      })
      .select("id, rating, comment, status")
      .single();

    if (submitError) {
      setError(
        submitError.code === "23505"
          ? "You have already reviewed this business."
          : submitError.message,
      );
      setSubmitting(false);
      return;
    }

    setExistingReview(data as ReviewRecord);
    setMessage("Your review was submitted and is awaiting approval.");
    setSubmitting(false);
  }

  return (
    <div className="mt-7 rounded-2xl border border-border bg-surface-muted p-5 sm:p-6">
      <h3 className="text-lg font-extrabold text-text-primary">
        Write a review
      </h3>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 size={17} className="animate-spin" />
          Checking your review status...
        </div>
      ) : !userId ? (
        <div className="mt-3">
          <p className="text-sm text-text-secondary">
            Sign in with a customer account to share your experience.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(`/business/${slug}`)}`}
            className="mt-4 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            Sign in to review
          </Link>
        </div>
      ) : role !== "customer" ? (
        <p className="mt-3 text-sm text-text-secondary">
          Reviews can only be submitted using a customer account.
        </p>
      ) : existingReview ? (
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={17}
                fill={index < existingReview.rating ? "currentColor" : "none"}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            {existingReview.comment || "No written comment."}
          </p>
          <p className="mt-3 text-sm font-semibold text-text-primary">
            Review status:{" "}
            <span className="capitalize text-brand">
              {existingReview.status}
            </span>
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            You can submit one review per business.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary">
              Your rating
            </label>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} out of 5`}
                    aria-pressed={rating === value}
                    className="rounded-lg p-1 text-amber-500 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <Star
                      size={28}
                      fill={value <= rating ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm font-semibold text-text-secondary">
                {rating}/5
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-sm font-semibold text-text-primary"
            >
              Your experience
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Share your experience with this business..."
              className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1 text-right text-xs text-text-secondary">
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm font-medium text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={17} className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit review"}
          </button>

          <p className="text-xs text-text-secondary">
            Your review will appear publicly after admin approval.
          </p>
        </form>
      )}
    </div>
  );
}