import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TechnicalDiagramProps = {
  diagramId: string;
  caption?: string;
};

function FaultTreeDiagram() {
  return (
    <svg viewBox="0 0 720 360" className="h-auto w-full" role="img" aria-label="Fault tree diagram">
      <rect width="720" height="360" fill="transparent" />
      <rect x="260" y="20" width="200" height="44" rx="8" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" />
      <text x="360" y="48" textAnchor="middle" className="fill-foreground text-sm font-semibold">System Failure</text>
      {[
        { x: 80, label: "Hardware", items: ["Disk crash", "Power loss", "Network partition"] },
        { x: 300, label: "Software", items: ["Logic bugs", "Memory leaks", "Cascades"] },
        { x: 520, label: "Human", items: ["Config typo", "Bad deploy", "Expired cert"] },
      ].map((col) => (
        <g key={col.label}>
          <line x1="360" y1="64" x2={col.x + 80} y2="110" stroke="var(--muted-foreground)" strokeWidth="2" />
          <rect x={col.x} y="110" width="160" height="36" rx="8" fill="var(--muted)" stroke="var(--border)" />
          <text x={col.x + 80} y="133" textAnchor="middle" className="fill-foreground text-sm font-medium">{col.label}</text>
          {col.items.map((item, i) => (
            <g key={item}>
              <line x1={col.x + 80} y1="146" x2={col.x + 80} y2={170 + i * 52} stroke="var(--muted-foreground)" strokeWidth="1.5" />
              <rect x={col.x + 10} y={170 + i * 52} width="140" height="34" rx="6" fill="var(--card)" stroke="var(--border)" />
              <text x={col.x + 80} y={192 + i * 52} textAnchor="middle" className="fill-muted-foreground text-xs">{item}</text>
            </g>
          ))}
        </g>
      ))}
      <rect x="40" y="310" width="640" height="36" rx="8" fill="var(--accent)" opacity="0.2" stroke="var(--accent)" />
      <text x="360" y="333" textAnchor="middle" className="fill-foreground text-xs">Mitigations: redundancy, testing, staged rollouts, monitoring, runbooks</text>
    </svg>
  );
}

function LatencyPercentilesDiagram() {
  const bars = [
    { label: "p50", value: 45, color: "hsl(142 76% 36%)" },
    { label: "p95", value: 120, color: "hsl(38 92% 50%)" },
    { label: "p99", value: 480, color: "hsl(0 84% 60%)" },
    { label: "max", value: 2100, color: "hsl(0 72% 40%)" },
  ];
  const max = 2100;

  return (
    <svg viewBox="0 0 720 300" className="h-auto w-full" role="img" aria-label="Latency percentiles chart">
      <text x="24" y="28" className="fill-muted-foreground text-xs">Response time (ms)</text>
      {bars.map((bar, i) => {
        const width = (bar.value / max) * 520;
        const y = 60 + i * 52;
        return (
          <g key={bar.label}>
            <text x="24" y={y + 20} className="fill-foreground text-sm font-medium">{bar.label}</text>
            <rect x="80" y={y} width={width} height="28" rx="6" fill={bar.color} opacity="0.85" />
            <text x={90 + width} y={y + 19} className="fill-foreground text-xs">{bar.value} ms</text>
          </g>
        );
      })}
      <line x1="80" y1="250" x2="600" y2="250" stroke="var(--border)" />
      <text x="360" y="280" textAnchor="middle" className="fill-muted-foreground text-xs">Average (80 ms) looks fine — but p99 users wait 6x longer</text>
    </svg>
  );
}

function LeaderFollowerDiagram() {
  return (
    <svg viewBox="0 0 720 200" className="h-auto w-full" role="img" aria-label="Leader-follower replication">
      {[
        { x: 80, label: "Follower", role: "read" },
        { x: 300, label: "Leader", role: "write" },
        { x: 520, label: "Follower", role: "read" },
      ].map((node) => (
        <g key={node.label + node.x}>
          <rect x={node.x} y="60" width="120" height="60" rx="8" fill="var(--muted)" stroke="var(--border)" />
          <text x={node.x + 60} y="88" textAnchor="middle" className="fill-foreground text-sm font-medium">{node.label}</text>
          <text x={node.x + 60} y="108" textAnchor="middle" className="fill-muted-foreground text-xs">{node.role}</text>
        </g>
      ))}
      <line x1="200" y1="90" x2="300" y2="90" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="420" y1="90" x2="520" y2="90" stroke="var(--primary)" strokeWidth="2" />
      <line x1="360" y1="120" x2="140" y2="150" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeDasharray="4" />
      <line x1="360" y1="120" x2="580" y2="150" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeDasharray="4" />
      <text x="360" y="175" textAnchor="middle" className="fill-muted-foreground text-xs">replication log</text>
    </svg>
  );
}

function ReplicationLagDiagram() {
  return (
    <svg viewBox="0 0 720 160" className="h-auto w-full" role="img" aria-label="Replication lag timeline">
      <line x1="40" y1="80" x2="680" y2="80" stroke="var(--border)" strokeWidth="2" />
      <circle cx="120" cy="80" r="8" fill="hsl(142 76% 36%)" />
      <text x="120" y="60" textAnchor="middle" className="fill-foreground text-xs">Write</text>
      <circle cx="280" cy="80" r="8" fill="hsl(38 92% 50%)" />
      <text x="280" y="110" textAnchor="middle" className="fill-foreground text-xs">Leader ack</text>
      <circle cx="480" cy="80" r="8" fill="hsl(0 84% 60%)" />
      <text x="480" y="60" textAnchor="middle" className="fill-foreground text-xs">Follower 1</text>
      <circle cx="600" cy="80" r="8" fill="hsl(0 72% 40%)" />
      <text x="600" y="110" textAnchor="middle" className="fill-foreground text-xs">Follower 2</text>
      <text x="360" y="140" textAnchor="middle" className="fill-muted-foreground text-xs">Stale reads possible between leader ack and follower catch-up</text>
    </svg>
  );
}

function HashPartitioningDiagram() {
  const parts = ["P0", "P1", "P2", "P3"];
  return (
    <svg viewBox="0 0 720 200" className="h-auto w-full" role="img" aria-label="Hash partitioning">
      <rect x="40" y="30" width="100" height="40" rx="6" fill="var(--card)" stroke="var(--border)" />
      <text x="90" y="55" textAnchor="middle" className="fill-foreground text-sm">hash(key)</text>
      {parts.map((p, i) => (
        <g key={p}>
          <rect x={180 + i * 130} y="100" width="100" height="60" rx="8" fill="var(--muted)" stroke="var(--border)" />
          <text x={230 + i * 130} y="135" textAnchor="middle" className="fill-foreground text-sm font-medium">{p}</text>
          <line x1="90" y1="70" x2={230 + i * 130} y2="100" stroke="var(--muted-foreground)" strokeWidth="1.5" />
        </g>
      ))}
      <text x="360" y="185" textAnchor="middle" className="fill-muted-foreground text-xs">hash(key) mod 4 → partition</text>
    </svg>
  );
}

function IsolationLevelsDiagram() {
  const levels = [
    { name: "Read Uncommitted", strength: 1 },
    { name: "Read Committed", strength: 2 },
    { name: "Snapshot Isolation", strength: 3 },
    { name: "Serializable", strength: 4 },
  ];
  return (
    <svg viewBox="0 0 720 220" className="h-auto w-full" role="img" aria-label="Isolation levels">
      {levels.map((lvl, i) => (
        <g key={lvl.name}>
          <rect x="80" y={30 + i * 44} width={lvl.strength * 120} height="32" rx="6" fill="var(--primary)" opacity={0.15 + i * 0.15} stroke="var(--primary)" />
          <text x="90" y={52 + i * 44} className="fill-foreground text-xs font-medium">{lvl.name}</text>
        </g>
      ))}
      <text x="600" y="60" className="fill-muted-foreground text-xs">↑ stronger</text>
      <text x="600" y="200" className="fill-muted-foreground text-xs">↓ more concurrency</text>
    </svg>
  );
}

function QuorumDiagram() {
  return (
    <svg viewBox="0 0 720 180" className="h-auto w-full" role="img" aria-label="Quorum read write">
      {["N1", "N2", "N3"].map((n, i) => (
        <g key={n}>
          <circle cx={200 + i * 160} cy="70" r="40" fill="var(--muted)" stroke="var(--border)" strokeWidth="2" />
          <text x={200 + i * 160} y="75" textAnchor="middle" className="fill-foreground text-sm font-medium">{n}</text>
        </g>
      ))}
      <text x="200" y="140" textAnchor="middle" className="fill-foreground text-xs">W=2 write</text>
      <text x="520" y="140" textAnchor="middle" className="fill-foreground text-xs">R=2 read</text>
      <text x="360" y="165" textAnchor="middle" className="fill-muted-foreground text-xs">W + R &gt; N guarantees overlap</text>
    </svg>
  );
}

function TwoPhaseCommitDiagram() {
  const steps = ["Prepare", "Vote", "Commit/Abort"];
  return (
    <svg viewBox="0 0 720 160" className="h-auto w-full" role="img" aria-label="Two-phase commit">
      <rect x="300" y="20" width="120" height="40" rx="8" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" />
      <text x="360" y="45" textAnchor="middle" className="fill-foreground text-sm font-medium">Coordinator</text>
      {["A", "B", "C"].map((p, i) => (
        <g key={p}>
          <rect x={120 + i * 200} y="100" width="80" height="36" rx="6" fill="var(--card)" stroke="var(--border)" />
          <text x={160 + i * 200} y="123" textAnchor="middle" className="fill-foreground text-xs">Node {p}</text>
          <line x1="360" y1="60" x2={160 + i * 200} y2="100" stroke="var(--muted-foreground)" strokeWidth="1.5" />
        </g>
      ))}
      <text x="360" y="155" textAnchor="middle" className="fill-muted-foreground text-xs">{steps.join(" → ")}</text>
    </svg>
  );
}

function MapReducePipelineDiagram() {
  const stages = ["Input", "Map", "Shuffle", "Reduce", "Output"];
  return (
    <svg viewBox="0 0 720 120" className="h-auto w-full" role="img" aria-label="MapReduce pipeline">
      {stages.map((s, i) => (
        <g key={s}>
          <rect x={40 + i * 135} y="40" width="100" height="40" rx="8" fill="var(--muted)" stroke="var(--border)" />
          <text x={90 + i * 135} y="65" textAnchor="middle" className="fill-foreground text-xs font-medium">{s}</text>
          {i < stages.length - 1 ? (
            <line x1={140 + i * 135} y1="60" x2={175 + i * 135} y2="60" stroke="var(--primary)" strokeWidth="2" />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function EventStreamDiagram() {
  return (
    <svg viewBox="0 0 720 180" className="h-auto w-full" role="img" aria-label="Event stream">
      <rect x="40" y="60" width="100" height="50" rx="8" fill="var(--card)" stroke="var(--border)" />
      <text x="90" y="90" textAnchor="middle" className="fill-foreground text-xs">Producer</text>
      <rect x="200" y="40" width="320" height="90" rx="8" fill="var(--muted)" stroke="var(--border)" />
      <text x="360" y="70" textAnchor="middle" className="fill-foreground text-sm font-medium">Partitioned Log</text>
      {["0", "1", "2"].map((p, i) => (
        <rect key={p} x={220 + i * 90} y="80" width="70" height="30" rx="4" fill="var(--card)" stroke="var(--border)" />
      ))}
      <rect x="580" y="50" width="100" height="35" rx="6" fill="var(--card)" stroke="var(--border)" />
      <text x="630" y="72" textAnchor="middle" className="fill-foreground text-xs">Consumer A</text>
      <rect x="580" y="95" width="100" height="35" rx="6" fill="var(--card)" stroke="var(--border)" />
      <text x="630" y="117" textAnchor="middle" className="fill-foreground text-xs">Consumer B</text>
      <line x1="140" y1="85" x2="200" y2="85" stroke="var(--primary)" strokeWidth="2" />
      <line x1="520" y1="75" x2="580" y2="67" stroke="var(--muted-foreground)" strokeWidth="1.5" />
      <line x1="520" y1="95" x2="580" y2="112" stroke="var(--muted-foreground)" strokeWidth="1.5" />
    </svg>
  );
}

const diagrams: Record<string, () => React.ReactNode> = {
  "fault-tree": FaultTreeDiagram,
  "latency-percentiles": LatencyPercentilesDiagram,
  "leader-follower": LeaderFollowerDiagram,
  "replication-lag": ReplicationLagDiagram,
  "hash-partitioning": HashPartitioningDiagram,
  "isolation-levels": IsolationLevelsDiagram,
  "quorum-read-write": QuorumDiagram,
  "two-phase-commit": TwoPhaseCommitDiagram,
  "mapreduce-pipeline": MapReducePipelineDiagram,
  "event-stream": EventStreamDiagram,
};

export function TechnicalDiagram({ diagramId, caption }: TechnicalDiagramProps) {
  const Diagram = diagrams[diagramId];

  if (!Diagram) {
    return null;
  }

  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <Diagram />
        {caption ? <p className="text-muted-foreground mt-3 text-sm">{caption}</p> : null}
      </CardContent>
    </Card>
  );
}
