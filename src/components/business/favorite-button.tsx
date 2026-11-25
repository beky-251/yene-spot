"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  businessId: string;
  slug: string;
};

export function FavoriteButton({ businessId, slug }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFavorite() {
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

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage("Unable to load favorite status.");
      } else {
        setIsFavorite(Boolean(data));
      }

      setLoading(false);
    }

    void loadFavorite();

    return () => {
      active = false;
    };
  }, [businessId]);

  async function toggleFavorite() {
    if (saving || loading) return;

    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(`/business/${slug}`)}`);
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("business_id", businessId);

      if (error) {
        setMessage("Could not remove this favorite. Please try again.");
      } else {
        setIsFavorite(false);
        setMessage("Removed from your favorites.");
      }
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        business_id: businessId,
      });

      if (error) {
        setMessage(
          error.code === "23505"
            ? "This business is already in your favorites."
            : "Could not save this favorite. Please try again.",
        );

        if (error.code === "23505") {
          setIsFavorite(true);
        }
      } else {
        setIsFavorite(true);
        setMessage("Added to your favorites.");
      }
    }

    setSaving(false);
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading || saving}
        aria-pressed={isFavorite}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-border bg-white text-text-primary hover:border-brand hover:text-brand"
        }`}
      >
        <Heart
          size={18}
          fill={isFavorite ? "currentColor" : "none"}
        />
        {loading
          ? "Loading..."
          : saving
            ? "Saving..."
            : isFavorite
              ? "Saved to favorites"
              : "Add to favorites"}
      </button>

      {message && (
        <p className="mt-2 text-xs text-text-secondary" role="status">
          {message}
        </p>
      )}
    </div>
  );
}