"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/users");
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

export async function promoteBusinessOwner(formData: FormData) {
  const supabase = await verifyAdmin();
  const userId = String(formData.get("user_id") ?? "");

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      userId,
    )
  ) {
    redirect("/admin/users?error=invalid_user");
  }

  const { error } = await supabase.rpc("approve_business_owner", {
    p_user_id: userId,
  });

  if (error) {
    const reason = error.code === "42501"
      ? "permission"
      : "promotion_failed";

    redirect(`/admin/users?error=${reason}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/businesses");

  redirect("/admin/users?promoted=1");
}