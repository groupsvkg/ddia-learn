"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MermaidKind = "architecture" | "sequence" | "diagram";

type MermaidDiagramLazyProps = {
  source: string;
  kind?: MermaidKind;
  caption?: string;
};

const MermaidDiagram = dynamic(
  () => import("@/components/ddia/mermaid-diagram").then((mod) => mod.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <Card className="my-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded-md border bg-muted/40" />
        </CardContent>
      </Card>
    ),
  },
);

export function MermaidDiagramLazy({ source, kind, caption }: MermaidDiagramLazyProps) {
  return <MermaidDiagram source={source} kind={kind} caption={caption} />;
}