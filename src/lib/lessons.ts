import type { LessonSection } from "@/types/content";
import { getChapter } from "@/lib/curriculum";

export async function getLesson(
  chapterSlug: string,
  sectionSlug: string,
): Promise<LessonSection | undefined> {
  const context = getChapter(chapterSlug);
  if (!context || context.chapter.status !== "published") {
    return undefined;
  }

  const section = context.chapter.sections.find((item) => item.id === sectionSlug);
  if (!section) {
    return undefined;
  }

  try {
    const mod = await import(`../../content/lessons/${sectionSlug}.json`);
    return mod.default as LessonSection;
  } catch {
    return undefined;
  }
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