"use client";

import { useState } from "react";
import { HeartOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  favoriteId: string;
};

export function RemoveFavoriteButton({ favoriteId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function removeFavorite() {
    if (loading) return;

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      setMessage("Unable to remove.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={removeFavorite}
        disabled={loading}
        aria-label="Remove from favorites"
        title="Remove from favorites"
        className="inline-flex items-center gap-1.5 rounded-full border border-red-100 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <HeartOff className="h-4 w-4" />
        {loading ? "Removing..." : "Remove"}
      </button>

      {message && (
        <span className="mt-1 text-xs text-red-600" role="alert">
          {message}
        </span>
      )}
    </div>
  );
}