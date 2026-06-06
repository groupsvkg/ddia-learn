"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import type { Curriculum } from "@/types/content";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { SidebarResizeHandle } from "@/components/ddia/sidebar-resize-handle";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type AppSidebarProps = {
  curriculum: Curriculum;
  sidebarWidth: number;
  onSidebarWidthChange: (width: number) => void;
};

export function AppSidebar({ curriculum, sidebarWidth, onSidebarWidthChange }: AppSidebarProps) {
  const pathname = usePathname();
  const [openChapters, setOpenChapters] = useState<string[]>([
    "ch01-reliable-scalable-maintainable",
  ]);

  useEffect(() => {
    const activeChapter = curriculum.parts
      .flatMap((part) => part.chapters)
      .find((chapter) => pathname.startsWith(`/chapters/${chapter.id}`));

    if (!activeChapter) return;

    setOpenChapters((prev) =>
      prev.includes(activeChapter.id) ? prev : [...prev, activeChapter.id],
    );
  }, [pathname, curriculum.parts]);

  const setChapterOpen = (chapterId: string, open: boolean) => {
    setOpenChapters((prev) =>
      open ? (prev.includes(chapterId) ? prev : [...prev, chapterId]) : prev.filter((id) => id !== chapterId),
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarResizeHandle width={sidebarWidth} onWidthChange={onSidebarWidthChange} />
      <SidebarHeader className="border-b px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold group-data-[collapsible=icon]:justify-center"
        >
          <BookOpen className="size-5 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">DDIA Learn</span>
        </Link>
        <p className="text-muted-foreground mt-1 text-xs leading-5 group-data-[collapsible=icon]:hidden">
          {curriculum.subtitle}
        </p>
      </SidebarHeader>
      <SidebarContent className="gap-2 pb-8">
        {curriculum.parts.map((part) => (
          <SidebarGroup key={part.id}>
            <SidebarGroupLabel>
              Part {part.number}: {part.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {part.chapters.map((chapter) => (
                  <SidebarMenuItem key={chapter.id}>
                    {/* Collapsed sidebar: chapter number only */}
                    <SidebarMenuButton
                      render={<Link href={`/chapters/${chapter.id}`} />}
                      isActive={pathname.startsWith(`/chapters/${chapter.id}`)}
                      tooltip={`Ch. ${chapter.number}: ${chapter.title}`}
                      className="hidden group-data-[collapsible=icon]:flex"
                    >
                      <span className="text-xs font-semibold tabular-nums">{chapter.number}</span>
                    </SidebarMenuButton>

                    {/* Expanded sidebar: full tree */}
                    <Collapsible
                      open={openChapters.includes(chapter.id)}
                      onOpenChange={(open) => setChapterOpen(chapter.id, open)}
                      className="group/collapsible group-data-[collapsible=icon]:hidden"
                    >
                      <div className="flex min-w-0 items-center gap-0.5">
                        <CollapsibleTrigger className="text-muted-foreground hover:bg-sidebar-accent flex size-8 shrink-0 items-center justify-center rounded-md transition-colors">
                          <ChevronRight className="size-4 shrink-0 transition-transform group-data-[open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                        <SidebarMenuButton
                          render={<Link href={`/chapters/${chapter.id}`} />}
                          isActive={pathname.startsWith(`/chapters/${chapter.id}`)}
                          className="h-auto min-h-8 flex-1 gap-1.5 py-1.5"
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden whitespace-nowrap">
                            <span className="text-muted-foreground shrink-0">
                              Ch.{chapter.number}
                            </span>
                            <span className="truncate">{chapter.title}</span>
                          </span>
                          {chapter.status === "coming_soon" ? (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              Soon
                            </Badge>
                          ) : null}
                        </SidebarMenuButton>
                      </div>
                      <CollapsibleContent className="overflow-hidden">
                        <SidebarMenuSub className="gap-0.5 py-1">
                          {chapter.sections.map((section) => (
                            <SidebarMenuSubItem key={section.id}>
                              <SidebarMenuSubButton
                                render={<Link href={`/chapters/${chapter.id}/${section.id}`} />}
                                isActive={pathname === `/chapters/${chapter.id}/${section.id}`}
                                className="h-auto min-h-7 items-start py-1.5 leading-snug"
                              >
                                <span className="line-clamp-2">{section.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
