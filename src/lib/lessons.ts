import type { LessonSection } from "@/types/content";
import { getChapter } from "@/lib/curriculum";
import lessonsIndex from "../../content/lessons/index.json";

const lessonsBySection = lessonsIndex as Record<string, LessonSection>;

export function getLesson(
  chapterSlug: string,
  sectionSlug: string,
): LessonSection | undefined {
  const context = getChapter(chapterSlug);
  if (!context || context.chapter.status !== "published") {
    return undefined;
  }

  const section = context.chapter.sections.find((item) => item.id === sectionSlug);
  if (!section) {
    return undefined;
  }

  return lessonsBySection[sectionSlug];
}

export function getAdjacentSections(chapterSlug: string, sectionSlug: string) {
  const context = getChapter(chapterSlug);
  if (!context) {
    return { previous: undefined, next: undefined };
  }

  const index = context.chapter.sections.findIndex((item) => item.id === sectionSlug);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: context.chapter.sections[index - 1],
    next: context.chapter.sections[index + 1],
  };
}