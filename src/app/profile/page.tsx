import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileClient, type UserProfile } from "@/app/profile/ProfileClient";

export default async function ProfilePage() {
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
    .maybeSingle<UserProfile>();

  if (error) {
    console.error("Profile fetch error:", error.message);
  }

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <AppLayout>
      <ProfileClient profile={profile} email={user.email ?? "Unknown email"} />
    </AppLayout>
  );
}
