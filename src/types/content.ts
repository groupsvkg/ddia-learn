export type ChapterStatus = "published" | "coming_soon";

export type SectionMeta = {
  id: string;
  title: string;
};

export type ChapterMeta = {
  id: string;
  number: number;
  title: string;
  status: ChapterStatus;
  summary: string;
  sections: SectionMeta[];
};

export type PartMeta = {
  id: string;
  number: number;
  title: string;
  chapters: ChapterMeta[];
};

export type Curriculum = {
  title: string;
  subtitle: string;
  parts: PartMeta[];
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "list"; items: string[] }
  | { type: "callout"; title: string; text: string; variant?: "info" | "warning" | "tip" }
  | { type: "diagram"; diagramId: string; caption?: string }
  | { type: "media"; src: string; alt: string; kind: "image" | "video"; caption?: string };

export type LessonSection = {
  id: string;
  chapterId: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  body: ContentBlock[];
  relatedConcepts: string[];
  media: {
    heroImage?: string;
    conceptVideo?: string;
    diagrams?: string[];
  };
};
