import { AppLayout } from "@/components/layout/AppLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApiPlatformClient } from "./ApiPlatformClient";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
};

export default async function ApiPlatformPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, name, prefix, created_at, last_used_at, is_active")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ApiKeyRow[]>();

  return (
    <AppLayout>
      <ApiPlatformClient keys={keys ?? []} />
    </AppLayout>
  );
}
