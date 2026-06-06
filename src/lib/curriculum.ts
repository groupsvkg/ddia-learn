import curriculumData from "../../content/curriculum.json";
import type { ChapterMeta, Curriculum, PartMeta } from "@/types/content";

export const curriculum = curriculumData as Curriculum;

export function getParts(): PartMeta[] {
  return curriculum.parts;
}

export function getPart(partSlug: string): PartMeta | undefined {
  return curriculum.parts.find((part) => part.id === partSlug);
}

export function getChapter(chapterSlug: string): {
  chapter: ChapterMeta;
  part: PartMeta;
} | undefined {
  for (const part of curriculum.parts) {
    const chapter = part.chapters.find((item) => item.id === chapterSlug);
    if (chapter) {
      return { chapter, part };
    }
  }
  return undefined;
}

export function getAllChapters(): Array<{ chapter: ChapterMeta; part: PartMeta }> {
  return curriculum.parts.flatMap((part) =>
    part.chapters.map((chapter) => ({ chapter, part })),
  );
}

export function getPublishedSectionParams(): Array<{
  chapterSlug: string;
  sectionSlug: string;
}> {
  return curriculum.parts.flatMap((part) =>
    part.chapters.flatMap((chapter) =>
      chapter.status === "published"
        ? chapter.sections.map((section) => ({
            chapterSlug: chapter.id,
            sectionSlug: section.id,
          }))
        : [],
    ),
  );
}
