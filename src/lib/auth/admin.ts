type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => PromiseLike<{
          data: Record<string, unknown> | null;
          error: { code?: string; message?: string } | null;
        }>;
      };
    };
  };
};

export function isMissingAdminColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.message?.includes("profiles.is_admin") ||
    (error.message?.includes("is_admin") && error.message?.includes("profiles"))
  );
}

export async function getProfileAdminStatus(supabase: unknown, userId: string) {
  const client = supabase as SupabaseLike;
  const { data, error } = await client
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (!error) {
    return Boolean(data?.is_admin);
  }

  if (!isMissingAdminColumnError(error)) {
    return false;
  }

  const { data: fallbackProfile, error: fallbackError } = await client
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (fallbackError) return false;
  return String(fallbackProfile?.plan ?? "").toLowerCase() === "admin";
}
