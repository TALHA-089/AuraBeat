import type { ReactNode } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ToastViewport } from "@/components/ui/Toast";

export type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#0D0D1A] text-white font-sans overflow-hidden">
      {/* Main content area above the player */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-hidden flex relative">
            {children}
          </main>
        </div>
      </div>
      {/* Audio Player — full width below everything */}
      <AudioPlayer />
      <ToastViewport />
    </div>
  );
}
