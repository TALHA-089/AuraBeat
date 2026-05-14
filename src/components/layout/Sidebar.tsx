import Link from "next/link";
import { Home, Library, Music2, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/create", label: "Create Music", icon: Music2 },
  { href: "/library", label: "Library", icon: Library },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[250px] bg-[#111128] px-4 py-5">
      <div className="mb-6 px-2">
        <div className="text-2xl font-bold tracking-tight text-[#7C3AED]">
          Aurabeat
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-colors hover:bg-[#7C3AED]/20"
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

