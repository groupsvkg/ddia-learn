"use client";

import type { Curriculum } from "@/types/content";
import { AppSidebar } from "@/components/ddia/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useSidebarWidth } from "@/hooks/use-sidebar-width";

type SiteShellProps = {
  curriculum: Curriculum;
  children: React.ReactNode;
};

export function SiteShell({ curriculum, children }: SiteShellProps) {
  const { width: sidebarWidth, setSidebarWidth } = useSidebarWidth();

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      <AppSidebar
        curriculum={curriculum}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-muted-foreground hidden text-xs lg:inline">Toggle sidebar</span>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <span className="text-muted-foreground text-sm">Designing Data-Intensive Applications</span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <main className="p-4 md:p-8">{children}</main>
          <footer className="text-muted-foreground border-t px-4 py-6 text-center text-xs">
            Inspired by DDIA by Martin Kleppmann. Independent study companion — not affiliated with O&apos;Reilly.
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
