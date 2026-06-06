import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

type LessonHeaderProps = {
  partTitle: string;
  partSlug: string;
  chapterLabel: string;
  chapterTitle: string;
  chapterSlug: string;
  sectionTitle: string;
  summary: string;
};

export function LessonHeader({
  partTitle,
  partSlug,
  chapterLabel,
  chapterTitle,
  chapterSlug,
  sectionTitle,
  summary,
}: LessonHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/parts/${partSlug}`} />}>{partTitle}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/chapters/${chapterSlug}`} />}>
              {chapterLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{sectionTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-2">
        <Badge variant="secondary">{chapterLabel}</Badge>
        <h1 className="text-3xl font-bold tracking-tight">{sectionTitle}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{summary}</p>
      </div>
    </div>
  );
}
