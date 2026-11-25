"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/businesses");
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

export async function updateBusiness(formData: FormData) {
  const supabase = await verifyAdmin();

  const id = String(formData.get("business_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const isFeatured = formData.get("is_featured") === "on";

  if (!id || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    throw new Error("Invalid business update.");
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      status,
      is_featured: isFeatured,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Business update failed: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath("/explore");

  redirect("/admin/businesses?updated=1");
}