"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UpdateBusinessState = {
  error?: string;
};

export async function updateBusiness(
  businessId: string,
  _previousState: UpdateBusinessState,
  formData: FormData,
): Promise<UpdateBusinessState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business-dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "business_owner") {
    return { error: "Only approved business owners can edit listings." };
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
  const city = String(formData.get("city") ?? "").trim();

  const openingHours: Record<
    string,
    { open: string; close: string; closed: boolean }
  > = {};

  const groups = [
    { key: "weekdays", label: "Monday–Friday" },
    { key: "weekends", label: "Saturday–Sunday" },
  ];

  for (const group of groups) {
    const closed = formData.get(`hours_${group.key}_closed`) === "true";
    const open = String(formData.get(`hours_${group.key}_open`) ?? "");
    const close = String(formData.get(`hours_${group.key}_close`) ?? "");

    if (!closed) {
      const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

      if (!validTime.test(open) || !validTime.test(close)) {
        return { error: `Please enter valid opening hours for ${group.label}.` };
      }

      if (close <= open) {
        return {
          error: `Closing time must be later than opening time for ${group.label}.`,
        };
      }
    }

    openingHours[group.key] = { open, close, closed };
  }
  if (!name || name.length > 120) {
    return { error: "Business name is required and must be under 120 characters." };
  }

  if (!categoryId) {
    return { error: "Please select a business category." };
  }

  if (!city || city.length > 100) {
    return { error: "Please enter a valid city." };
  }

  if (
    description.length > 5000 ||
    phone.length > 40 ||
    whatsapp.length > 40 ||
    email.length > 254 ||
    website.length > 500 ||
    address.length > 300 ||
    neighborhood.length > 120
  ) {
    return { error: "One or more fields exceed their allowed length." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (website) {
    try {
      const parsed = new URL(website);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { error: "Please enter a valid website URL." };
      }
    } catch {
      return { error: "Please enter a valid website URL." };
    }
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

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    return { error: "Business listing not found or you do not have permission to edit it." };
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      category_id: category.id,
      name,
      description: description || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      email: email || null,
      website: website || null,
      address: address || null,
      neighborhood: neighborhood || null,
      city,
      opening_hours: openingHours,
    })
    .eq("id", businessId)
    .eq("owner_id", user.id);

  if (error) {
    return { error: "Unable to update your listing. Please try again." };
  }

  redirect("/business-dashboard?updated=1");
}