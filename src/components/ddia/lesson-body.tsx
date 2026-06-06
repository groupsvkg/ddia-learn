import type { ContentBlock } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFigure } from "@/components/ddia/media-figure";
import { TechnicalDiagram } from "@/components/ddia/technical-diagram";

type LessonBodyProps = {
  blocks: ContentBlock[];
};

export function LessonBody({ blocks }: LessonBodyProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={index} className="text-base leading-7 text-foreground/90">
                {block.text}
              </p>
            );
          case "heading":
            if (block.level === 3) {
              return (
                <h3 key={index} className="mt-8 text-lg font-semibold tracking-tight">
                  {block.text}
                </h3>
              );
            }
            return (
              <h2 key={index} className="mt-10 text-xl font-semibold tracking-tight">
                {block.text}
              </h2>
            );
          case "list":
            return (
              <ul key={index} className="list-disc space-y-2 pl-6 text-foreground/90">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <Card
                key={index}
                className={
                  block.variant === "warning"
                    ? "border-amber-500/40 bg-amber-500/5"
                    : block.variant === "tip"
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-sky-500/40 bg-sky-500/5"
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{block.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-foreground/90">{block.text}</p>
                </CardContent>
              </Card>
            );
          case "diagram":
            return (
              <TechnicalDiagram
                key={index}
                diagramId={block.diagramId}
                caption={block.caption}
              />
            );
          case "media":
            return (
              <MediaFigure
                key={index}
                src={block.src}
                alt={block.alt}
                kind={block.kind}
                caption={block.caption}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
