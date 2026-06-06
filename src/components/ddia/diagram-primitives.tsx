export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)" />
      </marker>
      <marker id="arrow-muted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--muted-foreground)" />
      </marker>
      <marker id="arrow-left" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
        <path d="M8,0 L0,4 L8,8 Z" fill="var(--primary)" />
      </marker>
    </defs>
  );
}

export function SysBox({
  x,
  y,
  w,
  h,
  label,
  sub,
  highlight,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        fill={highlight ? "var(--primary)" : "var(--muted)"}
        fillOpacity={highlight ? 0.15 : 1}
        stroke={highlight ? "var(--primary)" : "var(--border)"}
        strokeWidth={highlight ? 2 : 1}
      />
      <text x={x + w / 2} y={y + (sub ? 22 : 28)} textAnchor="middle" className="fill-foreground text-xs font-medium">
        {label}
      </text>
      {sub ? (
        <text x={x + w / 2} y={y + 38} textAnchor="middle" className="fill-muted-foreground text-xs">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export type ArchEdge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  dashed?: boolean;
  muted?: boolean;
};

export function ArchEdgeArrow({ x1, y1, x2, y2, label, dashed, muted }: ArchEdge) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const stroke = muted ? "var(--muted-foreground)" : "var(--primary)";
  const marker = muted ? "url(#arrow-muted)" : "url(#arrow)";

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray={dashed ? "5 3" : undefined}
        markerEnd={marker}
      />
      <rect x={midX - 36} y={midY - 18} width={72} height={16} rx="3" fill="var(--background)" fillOpacity={0.9} />
      <text x={midX} y={midY - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {label}
      </text>
    </g>
  );
}