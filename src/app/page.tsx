import Link from "next/link";
import { curriculum, getAllChapters } from "@/lib/curriculum";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const chapters = getAllChapters();
  const published = chapters.filter(({ chapter }) => chapter.status === "published");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="space-y-4">
        <Badge>Study Companion</Badge>
        <h1 className="text-4xl font-bold tracking-tight">{curriculum.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-7">{curriculum.subtitle}</p>
        {published[0] ? (
          <Link
            href={`/chapters/${published[0].chapter.id}/${published[0].chapter.sections[0].id}`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Start with Chapter {published[0].chapter.number}
          </Link>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {curriculum.parts.map((part) => (
          <Card key={part.id}>
            <CardHeader>
              <CardTitle className="text-lg">Part {part.number}</CardTitle>
              <CardDescription>{part.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">{part.chapters.length} chapters</p>
              <Link href={`/parts/${part.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Explore part
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Curriculum</h2>
        <div className="grid gap-3">
          {chapters.map(({ chapter, part }) => (
            <Card key={chapter.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Ch. {chapter.number}: {chapter.title}
                  </CardTitle>
                  <Badge variant={chapter.status === "published" ? "default" : "outline"}>
                    {chapter.status === "published" ? "Available" : "Coming Soon"}
                  </Badge>
                </div>
                <CardDescription>
                  Part {part.number}: {part.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3 text-sm">{chapter.summary}</p>
                <Link href={`/chapters/${chapter.id}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                  Open chapter
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
