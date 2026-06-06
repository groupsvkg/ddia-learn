import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ComingSoonProps = {
  chapterTitle: string;
  chapterNumber: number;
};

export function ComingSoon({ chapterTitle, chapterNumber }: ComingSoonProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <Badge variant="outline" className="w-fit">Coming Soon</Badge>
        <CardTitle className="mt-2">Chapter {chapterNumber}: {chapterTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-6">
          This chapter is scaffolded in the curriculum but lesson content is still being authored.
          Chapter 1 is available now — explore reliability, scalability, and maintainability to get started.
        </p>
      </CardContent>
    </Card>
  );
}
