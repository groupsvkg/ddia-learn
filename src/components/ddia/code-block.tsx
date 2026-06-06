import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CodeBlockProps = {
  code: string;
  language?: string;
  caption?: string;
};

export function CodeBlock({ code, language = "typescript", caption }: CodeBlockProps) {
  return (
    <Card className="my-6 overflow-hidden border-zinc-800 bg-zinc-950">
      <CardHeader className="border-b border-zinc-800 bg-zinc-900/80 py-2">
        <CardTitle className="font-mono text-xs font-medium text-zinc-400">
          {language}
          {caption ? <span className="text-zinc-500"> — {caption}</span> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="overflow-x-auto p-4 text-[13px] leading-6">
          <code className="font-mono text-zinc-100">{code.trim()}</code>
        </pre>
      </CardContent>
    </Card>
  );
}