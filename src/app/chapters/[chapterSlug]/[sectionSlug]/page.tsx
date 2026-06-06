import { notFound } from "next/navigation";
import { formatChapterLabel, getChapter, getPublishedSectionParams } from "@/lib/curriculum";
import { getAdjacentSections, getLesson } from "@/lib/lessons";
import { LessonHeader } from "@/components/ddia/lesson-header";
import { LessonBody } from "@/components/ddia/lesson-body";
import { KeyTakeaways } from "@/components/ddia/key-takeaways";
import { ChapterNav } from "@/components/ddia/chapter-nav";
import { Badge } from "@/components/ui/badge";

type SectionPageProps = {
  params: Promise<{ chapterSlug: string; sectionSlug: string }>;
};

export function generateStaticParams() {
  return getPublishedSectionParams();
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { chapterSlug, sectionSlug } = await params;
  const context = getChapter(chapterSlug);
  const lesson = getLesson(chapterSlug, sectionSlug);

  if (!context || !lesson) notFound();

  const { chapter, part } = context;
  const { previous, next } = getAdjacentSections(chapterSlug, sectionSlug);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <LessonHeader
        partTitle={part.title}
        partSlug={part.id}
        chapterLabel={formatChapterLabel(chapter, part)}
        chapterTitle={chapter.title}
        chapterSlug={chapter.id}
        sectionTitle={lesson.title}
        summary={lesson.summary}
      />
      <LessonBody blocks={lesson.body} />
      <KeyTakeaways items={lesson.keyTakeaways} />
      {lesson.relatedConcepts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {lesson.relatedConcepts.map((concept) => (
            <Badge key={concept} variant="outline">{concept}</Badge>
          ))}
        </div>
      ) : null}
      <ChapterNav chapterSlug={chapter.id} previous={previous} next={next} />
    </article>
  );
}
