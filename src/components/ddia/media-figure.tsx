import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";

type MediaFigureProps = {
  src: string;
  alt: string;
  kind: "image" | "video";
  caption?: string;
};

export function MediaFigure({ src, alt, kind, caption }: MediaFigureProps) {
  return (
    <Card className="my-6 overflow-hidden">
      <CardContent className="p-0">
        <AspectRatio ratio={16 / 9}>
          {kind === "video" ? (
            <video
              src={src}
              controls
              preload="metadata"
              className="h-full w-full object-cover"
              aria-label={alt}
            />
          ) : (
            <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
          )}
        </AspectRatio>
        {caption ? (
          <p className="text-muted-foreground border-t px-4 py-3 text-sm">{caption}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
