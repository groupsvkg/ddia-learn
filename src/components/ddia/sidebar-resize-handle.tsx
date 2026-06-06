"use client";

import { useCallback, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
} from "@/hooks/use-sidebar-width";
import { cn } from "@/lib/utils";

type SidebarResizeHandleProps = {
  width: number;
  onWidthChange: (width: number) => void;
};

function clampWidth(value: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, value));
}

function getSidebarWrapper() {
  return document.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]');
}

function getSidebarGroup() {
  return document.querySelector<HTMLElement>('[data-slot="sidebar"]');
}

function forceExpandedLayout(sidebar: HTMLElement | null) {
  if (!sidebar) return;
  sidebar.dataset.state = "expanded";
  sidebar.removeAttribute("data-collapsible");
}

export function SidebarResizeHandle({ width, onWidthChange }: SidebarResizeHandleProps) {
  const { state, setOpen, isMobile } = useSidebar();
  const [dragWidth, setDragWidth] = useState<number | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (isMobile) return;
      event.preventDefault();

      const wrapper = getSidebarWrapper();
      const sidebar = getSidebarGroup();
      if (!wrapper) return;

      const wasCollapsed = state === "collapsed";
      if (wasCollapsed) {
        setOpen(true);
        forceExpandedLayout(sidebar);
      }

      const startX = event.clientX;
      const startWidth = wasCollapsed ? SIDEBAR_MIN_WIDTH : width;

      wrapper.classList.add("sidebar-resizing");
      wrapper.style.setProperty("--sidebar-width", `${startWidth}px`);
      setDragWidth(startWidth);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const nextWidth = clampWidth(startWidth + (moveEvent.clientX - startX));
        wrapper.style.setProperty("--sidebar-width", `${nextWidth}px`);
        setDragWidth(nextWidth);
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        const finalWidth = clampWidth(startWidth + (upEvent.clientX - startX));

        wrapper.classList.remove("sidebar-resizing");
        wrapper.style.setProperty("--sidebar-width", `${finalWidth}px`);
        setDragWidth(null);
        onWidthChange(finalWidth);

        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [isMobile, onWidthChange, setOpen, state, width],
  );

  if (isMobile) return null;

  const isDragging = dragWidth !== null;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute top-0 right-0 z-20 hidden h-full w-2 -translate-x-1/2 md:block",
        "cursor-col-resize",
        "hover:bg-sidebar-border/60",
        isDragging && "bg-sidebar-border/80",
      )}
    />
  );
}