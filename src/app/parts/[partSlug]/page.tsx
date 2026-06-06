import Link from "next/link";
import { notFound } from "next/navigation";
import { formatChapterLabel, getPart, getParts } from "@/lib/curriculum";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PartPageProps = {
  params: Promise<{ partSlug: string }>;
};

export function generateStaticParams() {
  return getParts().map((part) => ({ partSlug: part.id }));
}

export default async function PartPage({ params }: PartPageProps) {
  const { partSlug } = await params;
  const part = getPart(partSlug);
  if (!part) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge className="mb-2">
          {part.track === "system-design" ? "System Design" : `Part ${part.number}`}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">{part.title}</h1>
      </div>
      <div className="grid gap-4">
        {part.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>
                  {formatChapterLabel(chapter, part)}: {chapter.title}
                </CardTitle>
                <Badge variant={chapter.status === "published" ? "default" : "outline"}>
                  {chapter.status === "published" ? "Available" : "Coming Soon"}
                </Badge>
              </div>
              <CardDescription>{chapter.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/chapters/${chapter.id}`} className={cn(buttonVariants())}>
                Open chapter
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
