import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionBillingClient } from "@/app/subscription-billing/SubscriptionBillingClient";

export default async function SubscriptionBillingPage() {
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
    .select("id, plan, gold_balance")
    .eq("id", user.id)
    .maybeSingle<{
      id: string;
      plan: string | null;
      gold_balance: number | null;
    }>();

  if (error || !profile) {
    redirect("/dashboard");
  }

  return (
    <AppLayout>
      <SubscriptionBillingClient profile={profile} />
    </AppLayout>
  );
}
