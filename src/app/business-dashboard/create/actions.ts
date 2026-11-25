"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateBusinessState = {
  error?: string;
};

export async function createBusiness(
  _previousState: CreateBusinessState,
  formData: FormData,
): Promise<CreateBusinessState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business-dashboard/create");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "business_owner") {
    return { error: "Only approved business owners can submit listings." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const city = String(formData.get("city") ?? "Jimma").trim();

  if (!name || name.length > 120) {
    return { error: "Business name is required and must be under 120 characters." };
  }

  if (!categoryId) {
    return { error: "Please select a business category." };
  }

  if (!city || city.length > 100) {
    return { error: "Please enter a valid city." };
  }

  if (description.length > 5000) {
    return { error: "Description must be 5,000 characters or fewer." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError || !category) {
    return { error: "Please select a valid active category." };
  }

  const slugBase =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "business";

  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    category_id: category.id,
    name,
    slug,
    description: description || null,
    phone: phone || null,
    whatsapp: whatsapp || null,
    email: email || null,
    website: website || null,
    address: address || null,
    neighborhood: neighborhood || null,
    city,
    status: "pending",
    is_featured: false,
  });

  if (error) {
    return { error: `Unable to submit your listing: ${error.message}` };
  }

  redirect("/business-dashboard?created=1");
}