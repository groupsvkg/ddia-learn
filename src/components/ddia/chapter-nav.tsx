import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavSection = {
  id: string;
  title: string;
};

type ChapterNavProps = {
  chapterSlug: string;
  previous?: NavSection;
  next?: NavSection;
};

export function ChapterNav({ chapterSlug, previous, next }: ChapterNavProps) {
  return (
    <Card className="mt-10">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:justify-between">
        {previous ? (
          <Link
            href={`/chapters/${chapterSlug}/${previous.id}`}
            className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
          >
            ← {previous.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/chapters/${chapterSlug}/${next.id}`}
            className={cn(buttonVariants(), "justify-end")}
          >
            {next.title} →
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
