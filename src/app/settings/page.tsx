import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsClient } from "./SettingsClient";

export type UserProfile = {
  id: string;
  display_name: string | null;
  email: string;
  gold_balance: number | null;
  plan: string | null;
  created_at: string | null;
};

export default async function SettingsPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, gold_balance, plan, created_at")
    .eq("id", user.id)
    .maybeSingle<{
      id: string;
      display_name: string | null;
      gold_balance: number | null;
      plan: string | null;
      created_at: string | null;
    }>();

  if (error || !profile) {
    redirect("/dashboard");
  }

  return (
    <AppLayout>
      <SettingsClient 
        profile={{ 
          ...profile, 
          email: user.email || "",
          is_admin: false,
        }} 
      />
    </AppLayout>
  );
}
