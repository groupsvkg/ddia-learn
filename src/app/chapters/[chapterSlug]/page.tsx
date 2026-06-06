import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllChapters, getChapter } from "@/lib/curriculum";
import { ComingSoon } from "@/components/ddia/coming-soon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export function generateStaticParams() {
  return getAllChapters().map(({ chapter }) => ({ chapterSlug: chapter.id }));
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;
  const context = getChapter(chapterSlug);
  if (!context) notFound();

  const { chapter, part } = context;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary">Part {part.number}: {part.title}</Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Chapter {chapter.number}: {chapter.title}
        </h1>
        <p className="text-muted-foreground text-lg">{chapter.summary}</p>
      </div>

      {chapter.status === "coming_soon" ? (
        <ComingSoon chapterTitle={chapter.title} chapterNumber={chapter.number} />
      ) : (
        <div className="grid gap-3">
          {chapter.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>Section lesson</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/chapters/${chapter.id}/${section.id}`}
                  className={cn(buttonVariants())}
                >
                  Read lesson
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
