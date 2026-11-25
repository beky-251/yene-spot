import { createClient } from "@/lib/supabase/server";
import { CreateBusinessForm } from "./create-business-form";

export const instant = false;

type Category = {
  id: string;
  name: string;
};

export default async function CreateBusinessPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories = (data ?? []) as Category[];

  return <CreateBusinessForm categories={categories} />;
}