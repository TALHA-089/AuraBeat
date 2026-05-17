import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-full p-8">
        <Spinner size="lg" className="text-[#7C3AED]" />
        <p className="mt-4 text-white/50 text-sm animate-pulse">Loading library...</p>
      </div>
    </AppLayout>
  );
}
