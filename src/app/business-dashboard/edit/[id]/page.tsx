import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditBusinessForm } from "./edit-business-form";
import { BusinessMediaManager } from "../business-media-manager";

export const instant = false;

type Category = {
  id: string;
  name: string;
};

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    redirect("/");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "id, name, category_id, description, phone, whatsapp, email, website, address, neighborhood, city, opening_hours, logo_url, cover_image_url",
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const availableCategories = (categories ?? []) as Category[];

  const { data: businessImages } = await supabase
    .from("business_images")
    .select("id, image_url, display_order")
    .eq("business_id", business.id)
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-8">
      <BusinessMediaManager
        businessId={business.id}
        businessName={business.name}
        logoUrl={business.logo_url}
        coverImageUrl={business.cover_image_url}
        initialImages={businessImages ?? []}
      />

      <EditBusinessForm
        business={business}
        categories={availableCategories}
      />
    </div>
  );
}