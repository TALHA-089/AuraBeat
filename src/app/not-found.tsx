import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0D0D1A] text-white p-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-16 h-16 bg-[#7C3AED]/10 rounded-full flex items-center justify-center mb-6 border border-[#7C3AED]/20">
          <FileQuestion className="w-8 h-8 text-[#7C3AED]" />
        </div>
        <h2 className="text-4xl font-bold mb-2 tracking-tight">404</h2>
        <h3 className="text-xl font-semibold mb-3">Page Not Found</h3>
        <p className="text-white/50 mb-8 text-sm">
          The page you are looking for doesn&apos;t exist or has been moved. Check the URL and try again.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors text-sm font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
