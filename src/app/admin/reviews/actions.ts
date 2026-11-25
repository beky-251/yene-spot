"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["approved", "rejected"] as const;

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/reviews");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

export async function updateReviewStatus(formData: FormData) {
  const supabase = await verifyAdmin();

  const id = String(formData.get("review_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
    !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
  ) {
    redirect("/admin/reviews?error=invalid");
  }

  const { error } = await supabase
    .from("business_reviews")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    redirect("/admin/reviews?error=update_failed");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/explore");

  redirect(`/admin/reviews?updated=${status}`);
}