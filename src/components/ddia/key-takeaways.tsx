import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KeyTakeawaysProps = {
  items: string[];
};

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  return (
    <Card className="mt-10 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Key Takeaways</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
