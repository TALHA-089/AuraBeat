import type { ReactNode } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { Sidebar } from "./Sidebar";
import { ToastViewport } from "@/components/ui/Toast";

export type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <AudioPlayer />
      <ToastViewport />
      <main className="ml-[250px] pb-[70px]">{children}</main>
    </div>
  );
}

