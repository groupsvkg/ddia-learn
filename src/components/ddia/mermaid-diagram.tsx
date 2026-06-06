"use client";

import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MermaidKind = "architecture" | "sequence" | "diagram";

type MermaidDiagramProps = {
  source: string;
  kind?: MermaidKind;
  caption?: string;
};

const KIND_TITLES: Record<MermaidKind, string> = {
  architecture: "Architecture diagram",
  sequence: "Sequence diagram",
  diagram: "Diagram",
};

let mermaidReady = false;

function ensureMermaid() {
  if (mermaidReady) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "loose",
    fontFamily: "inherit",
    flowchart: {
      curve: "basis",
      htmlLabels: true,
      nodeSpacing: 50,
      rankSpacing: 60,
      padding: 16,
      useMaxWidth: true,
    },
    sequence: { mirrorActors: true, useMaxWidth: true },
  });
  mermaidReady = true;
}

export function MermaidDiagram({ source, kind = "diagram", caption }: MermaidDiagramProps) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    const renderId = `mermaid-${reactId.replace(/:/g, "")}`;

    async function render() {
      ensureMermaid();
      setError(null);
      try {
        const { svg } = await mermaid.render(renderId, source.trim());
        if (!cancelled && el) {
          el.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [source, reactId]);

  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{KIND_TITLES[kind]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="overflow-x-auto rounded-md border bg-card p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
          aria-label={KIND_TITLES[kind]}
        />
        {error ? (
          <details className="mt-3 text-sm text-destructive">
            <summary>Diagram render error</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">{error}</pre>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs text-muted-foreground">{source}</pre>
          </details>
        ) : null}
        {caption ? <p className="text-muted-foreground mt-3 text-sm">{caption}</p> : null}
      </CardContent>
    </Card>
  );
}