import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TechnicalDiagramProps = {
  diagramId: string;
  caption?: string;
};

function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)" />
      </marker>
      <marker id="arrow-muted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--muted-foreground)" />
      </marker>
    </defs>
  );
}

function FaultTreeDiagram() {
  return (
    <svg viewBox="0 0 720 360" className="h-auto w-full" role="img" aria-label="Fault categories diagram">
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
  const avg = 80;
  const avgWidth = (avg / max) * 520;

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
      <line x1={80 + avgWidth} y1="52" x2={80 + avgWidth} y2="250" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x={86 + avgWidth} y="48" className="fill-muted-foreground text-xs">avg {avg} ms</text>
      <text x="360" y="280" textAnchor="middle" className="fill-muted-foreground text-xs">Average looks fine — but p99 (480 ms) is 6× the average</text>
    </svg>
  );
}

function LeaderFollowerDiagram() {
  const leader = { x: 300, label: "Leader", role: "write" };
  const followers = [
    { x: 80, label: "Follower", role: "read" },
    { x: 520, label: "Follower", role: "read" },
  ];

  return (
    <svg viewBox="0 0 720 220" className="h-auto w-full" role="img" aria-label="Leader-follower replication">
      <ArrowDefs />
      <rect x="310" y="8" width="80" height="28" rx="6" fill="var(--card)" stroke="var(--border)" />
      <text x="350" y="27" textAnchor="middle" className="fill-foreground text-xs">Client</text>
      <line x1="350" y1="36" x2="360" y2="58" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="382" y="48" className="fill-muted-foreground text-xs">write</text>

      <g>
        <rect x={leader.x} y="60" width="120" height="60" rx="8" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="2" />
        <text x={leader.x + 60} y="88" textAnchor="middle" className="fill-foreground text-sm font-medium">{leader.label}</text>
        <text x={leader.x + 60} y="108" textAnchor="middle" className="fill-muted-foreground text-xs">{leader.role}</text>
      </g>

      {followers.map((node) => (
        <g key={node.x}>
          <rect x={node.x} y="60" width="120" height="60" rx="8" fill="var(--muted)" stroke="var(--border)" />
          <text x={node.x + 60} y="88" textAnchor="middle" className="fill-foreground text-sm font-medium">{node.label}</text>
          <text x={node.x + 60} y="108" textAnchor="middle" className="fill-muted-foreground text-xs">{node.role}</text>
          <line
            x1="360"
            y1="90"
            x2={node.x + (node.x < leader.x ? 120 : 0)}
            y2="90"
            stroke="var(--primary)"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <line
            x1={node.x + 60}
            y1="60"
            x2={node.x + 60}
            y2="36"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
            strokeDasharray="4"
            markerEnd="url(#arrow-muted)"
          />
          <text x={node.x + 72} y="44" className="fill-muted-foreground text-xs">read</text>
        </g>
      ))}

      <text x="360" y="175" textAnchor="middle" className="fill-muted-foreground text-xs">Leader appends to replication log; followers tail the log</text>
    </svg>
  );
}

function ReplicationLagDiagram() {
  const events = [
    { x: 100, label: "Write", sub: "t₀", color: "hsl(142 76% 36%)" },
    { x: 240, label: "Leader ack", sub: "t₁", color: "hsl(38 92% 50%)" },
    { x: 420, label: "Follower 1", sub: "t₂", color: "hsl(0 84% 60%)" },
    { x: 580, label: "Follower 2", sub: "t₃", color: "hsl(0 72% 40%)" },
  ];

  return (
    <svg viewBox="0 0 720 180" className="h-auto w-full" role="img" aria-label="Replication lag timeline">
      <ArrowDefs />
      <line x1="40" y1="90" x2="680" y2="90" stroke="var(--border)" strokeWidth="2" markerEnd="url(#arrow-muted)" />
      <text x="690" y="94" className="fill-muted-foreground text-xs">time</text>
      <rect x="250" y="68" width="190" height="44" rx="6" fill="hsl(38 92% 50%)" opacity="0.12" stroke="hsl(38 92% 50%)" strokeDasharray="4" />
      <text x="345" y="64" textAnchor="middle" className="fill-muted-foreground text-xs">stale-read window</text>
      {events.map((ev) => (
        <g key={ev.label}>
          <circle cx={ev.x} cy="90" r="8" fill={ev.color} />
          <text x={ev.x} y="68" textAnchor="middle" className="fill-foreground text-xs">{ev.label}</text>
          <text x={ev.x} y="120" textAnchor="middle" className="fill-muted-foreground text-xs">{ev.sub}</text>
        </g>
      ))}
      <text x="360" y="155" textAnchor="middle" className="fill-muted-foreground text-xs">Reads from followers between t₁ and t₂ may return stale data</text>
    </svg>
  );
}

function HashPartitioningDiagram() {
  const parts = ["P0", "P1", "P2", "P3"];
  const routes = [
    { key: "user:42", partition: 0 },
    { key: "user:17", partition: 1 },
    { key: "user:99", partition: 2, highlight: true },
    { key: "user:8", partition: 3 },
  ];

  return (
    <svg viewBox="0 0 720 240" className="h-auto w-full" role="img" aria-label="Hash partitioning">
      <text x="24" y="24" className="fill-muted-foreground text-xs">Example keys</text>
      {routes.map((route, i) => {
        const y = 44 + i * 34;
        const partX = 500 + route.partition * 52;
        const isHighlight = route.highlight;
        return (
          <g key={route.key}>
            <text x="24" y={y + 4} className="fill-foreground text-xs font-mono">{route.key}</text>
            <line x1="110" y1={y} x2="170" y2={y} stroke="var(--muted-foreground)" strokeWidth="1.2" />
            <text x="190" y={y + 4} className="fill-muted-foreground text-xs">hash % 4</text>
            <line
              x1="250"
              y1={y}
              x2={partX}
              y2={150}
              stroke={isHighlight ? "var(--primary)" : "var(--muted-foreground)"}
              strokeWidth={isHighlight ? 2 : 1.2}
              opacity={isHighlight ? 1 : 0.45}
            />
          </g>
        );
      })}
      {parts.map((p, i) => {
        const x = 470 + i * 52;
        const isTarget = i === 2;
        return (
          <g key={p}>
            <rect
              x={x}
              y="150"
              width="44"
              height="44"
              rx="8"
              fill={isTarget ? "var(--primary)" : "var(--muted)"}
              fillOpacity={isTarget ? 0.15 : 1}
              stroke={isTarget ? "var(--primary)" : "var(--border)"}
              strokeWidth={isTarget ? 2 : 1}
            />
            <text x={x + 22} y="177" textAnchor="middle" className="fill-foreground text-xs font-medium">{p}</text>
          </g>
        );
      })}
      <text x="360" y="220" textAnchor="middle" className="fill-muted-foreground text-xs">
        Each key maps to exactly one partition via hash(key) mod N
      </text>
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
      <text x="600" y="60" className="fill-muted-foreground text-xs">↑ stronger guarantees</text>
      <text x="600" y="200" className="fill-muted-foreground text-xs">↓ higher concurrency</text>
    </svg>
  );
}

function QuorumDiagram() {
  const nodes = [
    { id: "N1", x: 160, write: true, read: false },
    { id: "N2", x: 360, write: true, read: true, overlap: true },
    { id: "N3", x: 560, write: false, read: true },
  ];

  return (
    <svg viewBox="0 0 720 220" className="h-auto w-full" role="img" aria-label="Quorum read write">
      <text x="24" y="24" className="fill-muted-foreground text-xs">N = 3 replicas</text>
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy="90"
            r="40"
            fill={node.write ? "hsl(142 76% 36%)" : "var(--muted)"}
            fillOpacity={node.write ? 0.2 : 1}
            stroke={node.overlap ? "hsl(38 92% 50%)" : node.write ? "hsl(142 76% 36%)" : "var(--border)"}
            strokeWidth={node.overlap ? 3 : 2}
          />
          {node.read ? (
            <circle cx={node.x} cy="90" r="48" fill="none" stroke="hsl(221 83% 53%)" strokeWidth="2" strokeDasharray="5 3" />
          ) : null}
          <text x={node.x} y="95" textAnchor="middle" className="fill-foreground text-sm font-medium">{node.id}</text>
          {node.write ? <text x={node.x} y="112" textAnchor="middle" className="fill-foreground text-xs">W</text> : null}
          {node.read ? <text x={node.x} y={node.write ? "126" : "112"} textAnchor="middle" className="fill-foreground text-xs">R</text> : null}
        </g>
      ))}
      <text x="260" y="165" textAnchor="middle" className="fill-foreground text-xs">W = 2 (green)</text>
      <text x="460" y="165" textAnchor="middle" className="fill-foreground text-xs">R = 2 (blue ring)</text>
      <text x="360" y="195" textAnchor="middle" className="fill-muted-foreground text-xs">W + R &gt; N → read and write sets overlap at N2</text>
    </svg>
  );
}

function TwoPhaseCommitDiagram() {
  const participants = [
    { id: "A", x: 120 },
    { id: "B", x: 320 },
    { id: "C", x: 520 },
  ];

  return (
    <svg viewBox="0 0 720 200" className="h-auto w-full" role="img" aria-label="Two-phase commit">
      <ArrowDefs />
      <rect x="300" y="16" width="120" height="40" rx="8" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" />
      <text x="360" y="41" textAnchor="middle" className="fill-foreground text-sm font-medium">Coordinator</text>
      {participants.map((p) => (
        <g key={p.id}>
          <rect x={p.x} y="110" width="80" height="36" rx="6" fill="var(--card)" stroke="var(--border)" />
          <text x={p.x + 40} y="133" textAnchor="middle" className="fill-foreground text-xs">Node {p.id}</text>
          <line x1="360" y1="56" x2={p.x + 40} y2="110" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
          <line x1={p.x + 40} y1="110" x2="360" y2="56" stroke="var(--primary)" strokeWidth="1.2" strokeDasharray="4" opacity="0.6" />
        </g>
      ))}
      <rect x="80" y="162" width="200" height="28" rx="6" fill="var(--muted)" stroke="var(--border)" />
      <text x="180" y="180" textAnchor="middle" className="fill-foreground text-xs">Phase 1: Prepare (vote)</text>
      <line x1="290" y1="176" x2="310" y2="176" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <rect x="320" y="162" width="220" height="28" rx="6" fill="var(--muted)" stroke="var(--border)" />
      <text x="430" y="180" textAnchor="middle" className="fill-foreground text-xs">Phase 2: Commit or Abort</text>
    </svg>
  );
}

function MapReducePipelineDiagram() {
  const stages = ["Input", "Map", "Shuffle", "Reduce", "Output"];
  return (
    <svg viewBox="0 0 720 120" className="h-auto w-full" role="img" aria-label="MapReduce pipeline">
      <ArrowDefs />
      {stages.map((s, i) => (
        <g key={s}>
          <rect x={40 + i * 135} y="40" width="100" height="40" rx="8" fill="var(--muted)" stroke="var(--border)" />
          <text x={90 + i * 135} y="65" textAnchor="middle" className="fill-foreground text-xs font-medium">{s}</text>
          {i < stages.length - 1 ? (
            <line x1={140 + i * 135} y1="60" x2={175 + i * 135} y2="60" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
          ) : null}
        </g>
      ))}
      <text x="360" y="105" textAnchor="middle" className="fill-muted-foreground text-xs">Shuffle groups intermediate key-value pairs by key across workers</text>
    </svg>
  );
}

function EventStreamDiagram() {
  const partitions = [
    { id: "0", x: 220, consumer: "A", offset: 42 },
    { id: "1", x: 310, consumer: "B", offset: 17 },
    { id: "2", x: 400, consumer: "B", offset: 8 },
  ];

  return (
    <svg viewBox="0 0 720 210" className="h-auto w-full" role="img" aria-label="Event stream">
      <ArrowDefs />
      <rect x="40" y="70" width="100" height="50" rx="8" fill="var(--card)" stroke="var(--border)" />
      <text x="90" y="100" textAnchor="middle" className="fill-foreground text-xs">Producer</text>
      <rect x="190" y="50" width="340" height="90" rx="8" fill="var(--muted)" stroke="var(--border)" />
      <text x="360" y="72" textAnchor="middle" className="fill-foreground text-sm font-medium">Partitioned Log</text>
      {partitions.map((p) => (
        <g key={p.id}>
          <rect x={p.x} y="82" width="70" height="44" rx="4" fill="var(--card)" stroke="var(--border)" />
          <text x={p.x + 35} y="100" textAnchor="middle" className="fill-foreground text-xs font-medium">P{p.id}</text>
          <text x={p.x + 35} y="116" textAnchor="middle" className="fill-muted-foreground text-xs">offset {p.offset}</text>
        </g>
      ))}
      <rect x="580" y="55" width="110" height="35" rx="6" fill="var(--card)" stroke="var(--border)" />
      <text x="635" y="72" textAnchor="middle" className="fill-foreground text-xs">Consumer A</text>
      <text x="635" y="84" textAnchor="middle" className="fill-muted-foreground text-xs">group 1</text>
      <rect x="580" y="110" width="110" height="35" rx="6" fill="var(--card)" stroke="var(--border)" />
      <text x="635" y="127" textAnchor="middle" className="fill-foreground text-xs">Consumer B</text>
      <text x="635" y="139" textAnchor="middle" className="fill-muted-foreground text-xs">group 2</text>
      <line x1="140" y1="95" x2="190" y2="95" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="158" y="88" className="fill-muted-foreground text-xs">append</text>
      <line x1="530" y1="100" x2="580" y2="72" stroke="hsl(221 83% 53%)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
      <line x1="530" y1="105" x2="580" y2="127" stroke="hsl(221 83% 53%)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
      <text x="360" y="175" textAnchor="middle" className="fill-muted-foreground text-xs">Each consumer group tracks its own offset per partition</text>
    </svg>
  );
}

function SysBox({ x, y, w, h, label, sub, highlight }: { x: number; y: number; w: number; h: number; label: string; sub?: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={highlight ? "var(--primary)" : "var(--muted)"} fillOpacity={highlight ? 0.15 : 1} stroke={highlight ? "var(--primary)" : "var(--border)"} strokeWidth={highlight ? 2 : 1} />
      <text x={x + w / 2} y={y + (sub ? 22 : 28)} textAnchor="middle" className="fill-foreground text-xs font-medium">{label}</text>
      {sub ? <text x={x + w / 2} y={y + 38} textAnchor="middle" className="fill-muted-foreground text-xs">{sub}</text> : null}
    </g>
  );
}

function SystemAirbnbDiagram() {
  return (
    <svg viewBox="0 0 720 300" className="h-auto w-full" role="img" aria-label="Airbnb system architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Airbnb — marketplace data system (simplified)</text>
      <SysBox x={310} y={36} w={100} h={40} label="Mobile / Web" />
      <line x1="360" y1="76" x2="360" y2="96" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={300} y={96} w={120} h={40} label="API Gateway" sub="Envoy / nginx" highlight />
      <line x1="360" y1="136" x2="360" y2="156" stroke="var(--muted-foreground)" strokeWidth="1.5" />
      {[{ x: 60, l: "Listings" }, { x: 210, l: "Bookings" }, { x: 360, l: "Payments" }, { x: 510, l: "Search" }].map((s) => (
        <g key={s.l}>
          <SysBox x={s.x} y={156} w={100} h={44} label={s.l} sub="microservice" />
          <line x1="360" y1="156" x2={s.x + 50} y2="156" stroke="var(--muted-foreground)" strokeWidth="1.2" />
        </g>
      ))}
      {[{ x: 80, l: "PostgreSQL", s: "OLTP" }, { x: 230, l: "Redis", s: "cache" }, { x: 380, l: "Kafka", s: "events" }, { x: 530, l: "Elasticsearch", s: "search" }].map((d) => (
        <g key={d.l}>
          <SysBox x={d.x} y={230} w={110} h={48} label={d.l} sub={d.s} />
          <line x1={d.x + 55} y1="200" x2={d.x + 55} y2="230" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
        </g>
      ))}
      <text x="360" y="292" textAnchor="middle" className="fill-muted-foreground text-xs">Bookings in Postgres; search index derived via Kafka CDC</text>
    </svg>
  );
}

function SystemWhatsappDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="WhatsApp messaging architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">WhatsApp — message delivery (simplified)</text>
      <SysBox x={40} y={50} w={90} h={44} label="Sender" sub="mobile" />
      <SysBox x={580} y={50} w={90} h={44} label="Receiver" sub="mobile" />
      <SysBox x={300} y={44} w={120} h={52} label="Chat Server" sub="Erlang/BEAM" highlight />
      <line x1="130" y1="72" x2="300" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="200" y="64" className="fill-muted-foreground text-xs">send</text>
      <SysBox x={285} y={130} w={150} h={44} label="Message Store" sub="replicated" />
      <line x1="360" y1="96" x2="360" y2="130" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={80} y={130} w={120} h={44} label="Push Gateway" sub="APNs / FCM" />
      <line x1="285" y1="152" x2="200" y2="152" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
      <line x1="435" y1="152" x2="580" y2="72" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrow)" />
      <text x="520" y="110" className="fill-muted-foreground text-xs">offline push</text>
      <text x="360" y="210" textAnchor="middle" className="fill-muted-foreground text-xs">Online: WebSocket/long-poll delivery. Offline: push notification + sync on reconnect.</text>
      <text x="360" y="240" textAnchor="middle" className="fill-muted-foreground text-xs">End-to-end encryption happens on devices — servers route ciphertext</text>
    </svg>
  );
}

function SystemGoogleSearchDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="Google search pipeline">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Google Search — index pipeline (simplified)</text>
      {[{ x: 40, l: "Crawler" }, { x: 175, l: "GFS / S3" }, { x: 310, l: "MapReduce" }, { x: 445, l: "Index" }, { x: 580, l: "Query" }].map((s, i) => (
        <g key={s.l}>
          <SysBox x={s.x} y={50} w={110} h={48} label={s.l} highlight={i === 4} />
          {i < 4 ? <line x1={s.x + 110} y1="74" x2={s.x + 135} y2="74" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" /> : null}
        </g>
      ))}
      <SysBox x={40} y={150} w={120} h={44} label="User Query" />
      <line x1="160" y1="172" x2="580" y2="98" stroke="hsl(221 83% 53%)" strokeWidth="1.5" strokeDasharray="5" markerEnd="url(#arrow-muted)" />
      <text x="360" y="140" textAnchor="middle" className="fill-muted-foreground text-xs">Batch: crawl → store → build inverted index. Online: millisecond lookup + ranking.</text>
      <text x="360" y="230" textAnchor="middle" className="fill-muted-foreground text-xs">Immutable web snapshots enable reprocessing when ranking algorithms change</text>
    </svg>
  );
}

function SystemMetaFeedDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="Meta social feed architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Facebook / Instagram — feed fan-out (simplified)</text>
      <SysBox x={40} y={50} w={100} h={44} label="User posts" highlight />
      <line x1="140" y1="72" x2="200" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={200} y={50} w={120} h={44} label="Post DB" sub="sharded" />
      <line x1="320" y1="72" x2="380" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={380} y={44} w={140} h={52} label="Fan-out Service" sub="write to caches" highlight />
      {[{ x: 80, l: "Follower A" }, { x: 240, l: "Follower B" }, { x: 400, l: "Follower C" }, { x: 560, l: "Follower D" }].map((f) => (
        <g key={f.l}>
          <SysBox x={f.x} y={150} w={100} h={44} label="Feed Cache" sub="Redis" />
          <line x1="450" y1="96" x2={f.x + 50} y2="150" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
        </g>
      ))}
      <text x="360" y="220" textAnchor="middle" className="fill-muted-foreground text-xs">Push model: precompute feeds for active users. Pull model for celebrities with millions of followers.</text>
      <text x="360" y="245" textAnchor="middle" className="fill-muted-foreground text-xs">Hybrid fan-out is how Meta scales the home timeline</text>
    </svg>
  );
}

function SystemCanvaDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="Canva collaboration architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Canva — real-time design collaboration (simplified)</text>
      {[{ x: 60, l: "Designer A" }, { x: 560, l: "Designer B" }].map((u) => (
        <SysBox key={u.l} x={u.x} y={44} w={100} h={40} label={u.l} sub="browser" />
      ))}
      <SysBox x={280} y={110} w={160} h={52} label="Collab Server" sub="WebSocket + CRDT" highlight />
      <line x1="110" y1="84" x2="300" y2="110" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="610" y1="84" x2="420" y2="110" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={120} y={190} w={120} h={44} label="PostgreSQL" sub="metadata" />
      <SysBox x={300} y={190} w={120} h={44} label="S3 / GCS" sub="assets" />
      <SysBox x={480} y={190} w={120} h={44} label="Redis" sub="presence" />
      <line x1="360" y1="162" x2="360" y2="190" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <text x="360" y="248" textAnchor="middle" className="fill-muted-foreground text-xs">Operational transforms / CRDTs merge concurrent edits without a single leader bottleneck</text>
    </svg>
  );
}

function SystemYoutubeDiagram() {
  return (
    <svg viewBox="0 0 720 280" className="h-auto w-full" role="img" aria-label="YouTube video pipeline">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">YouTube — upload, transcode, CDN playback</text>
      <SysBox x={40} y={50} w={90} h={40} label="Creator" sub="upload" />
      <SysBox x={170} y={44} w={110} h={48} label="Upload API" sub="resumable" highlight />
      <SysBox x={310} y={44} w={110} h={48} label="Object Store" sub="raw video" />
      <SysBox x={450} y={44} w={110} h={48} label="Transcode" sub="job queue" highlight />
      <SysBox x={590} y={44} w={100} h={48} label="Segments" sub="HLS/DASH" />
      {[{ x: 130, t: 72 }, { x: 280, t: 68 }, { x: 420, t: 68 }, { x: 560, t: 68 }].map((a, i, arr) =>
        i < arr.length - 1 ? (
          <line key={a.x} x1={a.x + (i === 0 ? 60 : 110)} y1={a.t} x2={arr[i + 1].x} y2={arr[i + 1].t} stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
        ) : null,
      )}
      <SysBox x={80} y={150} w={100} h={40} label="Viewer" sub="player" />
      <SysBox x={220} y={144} w={120} h={48} label="Metadata API" sub="cached" />
      <SysBox x={380} y={144} w={120} h={48} label="CDN Edge" sub="segments" highlight />
      <SysBox x={540} y={144} w={120} h={48} label="Origin" sub="object store" />
      <line x1="180" y1="170" x2="220" y2="168" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="340" y1="168" x2="380" y2="168" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="500" y1="168" x2="540" y2="168" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" markerEnd="url(#arrow-muted)" />
      <text x="360" y="230" textAnchor="middle" className="fill-muted-foreground text-xs">Write path: async transcode pipeline. Read path: manifest + CDN bytes.</text>
      <text x="360" y="255" textAnchor="middle" className="fill-muted-foreground text-xs">View counts batched via stream processor — approximate OK</text>
    </svg>
  );
}

function SystemReservationDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="Reservation booking flow">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Reservation system — search, hold, pay, confirm</text>
      <SysBox x={40} y={50} w={100} h={44} label="Guest" />
      <SysBox x={180} y={50} w={110} h={44} label="Search" sub="Elasticsearch" />
      <SysBox x={320} y={44} w={110} h={52} label="Hold Svc" sub="inventory lock" highlight />
      <SysBox x={460} y={50} w={100} h={44} label="Stripe" sub="payment" />
      <SysBox x={580} y={44} w={110} h={52} label="Confirm" sub="saga" highlight />
      <line x1="140" y1="72" x2="180" y2="72" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
      <line x1="290" y1="72" x2="320" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="430" y1="72" x2="460" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="560" y1="72" x2="580" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={200} y={150} w={130} h={48} label="PostgreSQL" sub="inventory OLTP" />
      <SysBox x={380} y={150} w={110} h={48} label="Kafka" sub="events" />
      <line x1="375" y1="96" x2="265" y2="150" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <line x1="635" y1="96" x2="435" y2="150" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <text x="360" y="220" textAnchor="middle" className="fill-muted-foreground text-xs">Payment failure → release hold (compensating transaction)</text>
      <text x="360" y="245" textAnchor="middle" className="fill-muted-foreground text-xs">Search index updated async from booking events</text>
    </svg>
  );
}

function SystemVotingDiagram() {
  return (
    <svg viewBox="0 0 720 240" className="h-auto w-full" role="img" aria-label="Voting system architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Voting — ballot log, tally, results</text>
      <SysBox x={60} y={50} w={100} h={44} label="Voter" />
      <SysBox x={200} y={44} w={120} h={52} label="Ballot API" sub="idempotent" highlight />
      <SysBox x={360} y={50} w={110} h={44} label="Ballot Log" sub="append-only" />
      <SysBox x={500} y={50} w={120} h={44} label="Aggregator" sub="stream" />
      <SysBox x={600} y={130} w={100} h={44} label="Results" sub="cached" highlight />
      <line x1="160" y1="72" x2="200" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="320" y1="72" x2="360" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="470" y1="72" x2="500" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="560" y1="94" x2="630" y2="130" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
      <text x="360" y="200" textAnchor="middle" className="fill-muted-foreground text-xs">Unique (election_id, voter_id) prevents double voting</text>
      <text x="360" y="225" textAnchor="middle" className="fill-muted-foreground text-xs">Audit trail immutable; tallies derived from log</text>
    </svg>
  );
}

function SystemMultiplayerDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="Multiplayer game architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Multiplayer game — matchmaking and authoritative server</text>
      {[{ x: 50, l: "Player A" }, { x: 570, l: "Player B" }].map((p) => (
        <SysBox key={p.l} x={p.x} y={44} w={90} h={40} label={p.l} sub="UDP client" />
      ))}
      <SysBox x={260} y={100} w={140} h={52} label="Game Server" sub="60 Hz tick" highlight />
      <SysBox x={280} y={44} w={120} h={44} label="Matchmaker" sub="skill + region" />
      <line x1="360" y1="88" x2="330" y2="100" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="140" y1="84" x2="260" y2="120" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="580" y1="84" x2="400" y2="120" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <SysBox x={180} y={190} w={120} h={44} label="Agones/K8s" sub="pod per match" />
      <SysBox x={420} y={190} w={120} h={44} label="Telemetry" sub="Kafka" />
      <line x1="330" y1="152" x2="240" y2="190" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <line x1="370" y1="152" x2="480" y2="190" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <text x="360" y="248" textAnchor="middle" className="fill-muted-foreground text-xs">Server owns truth; clients predict locally then reconcile</text>
    </svg>
  );
}

function SystemPuzzleDiagram() {
  return (
    <svg viewBox="0 0 720 240" className="h-auto w-full" role="img" aria-label="Multiplayer puzzle game">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Puzzle game — move log and leaderboard</text>
      <SysBox x={80} y={50} w={100} h={44} label="Players" sub="turn-based" />
      <SysBox x={220} y={44} w={120} h={52} label="Game API" sub="validate moves" highlight />
      <SysBox x={380} y={50} w={110} h={44} label="Move Log" sub="append" />
      <SysBox x={530} y={50} w={120} h={44} label="Board State" sub="versioned" />
      <line x1="180" y1="72" x2="220" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="340" y1="72" x2="380" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="490" y1="72" x2="530" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={260} y={150} w={120} h={48} label="Redis ZSET" sub="leaderboard" highlight />
      <SysBox x={420} y={150} w={120} h={48} label="Scheduler" sub="turn timer" />
      <line x1="430" y1="94" x2="320" y2="150" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <text x="360" y="220" textAnchor="middle" className="fill-muted-foreground text-xs">Stale move versions rejected; daily puzzle idempotent per user</text>
    </svg>
  );
}

function SystemMultistepWorkflowDiagram() {
  return (
    <svg viewBox="0 0 720 260" className="h-auto w-full" role="img" aria-label="Multistep workflow saga">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Multistep workflow — saga with compensation</text>
      <SysBox x={60} y={60} w={100} h={44} label="Cart" />
      <SysBox x={190} y={60} w={100} h={44} label="Hold" highlight />
      <SysBox x={320} y={60} w={100} h={44} label="Charge" highlight />
      <SysBox x={450} y={60} w={100} h={44} label="Ship" />
      <SysBox x={580} y={60} w={100} h={44} label="Notify" />
      {[{ x: 160 }, { x: 290 }, { x: 420 }, { x: 550 }].map((a) => (
        <line key={a.x} x1={a.x} y1="82" x2={a.x + 30} y2="82" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      ))}
      <SysBox x={260} y={160} w={200} h={48} label="Workflow Engine" sub="Temporal / Step Functions" highlight />
      <line x1="370" y1="104" x2="360" y2="160" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <line x1="320" y1="160" x2="240" y2="104" stroke="hsl(0 72% 51%)" strokeWidth="1.5" strokeDasharray="5" markerEnd="url(#arrow-muted)" />
      <text x="280" y="148" className="fill-muted-foreground text-xs">compensate</text>
      <text x="360" y="230" textAnchor="middle" className="fill-muted-foreground text-xs">Charge fails → release hold. Each step idempotent with correlation ID.</text>
    </svg>
  );
}

function SystemMultistepFormDiagram() {
  return (
    <svg viewBox="0 0 720 250" className="h-auto w-full" role="img" aria-label="Multistep form architecture">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Multistep form — drafts, uploads, async verification</text>
      <SysBox x={60} y={50} w={100} h={44} label="Applicant" sub="web/mobile" />
      <SysBox x={200} y={44} w={120} h={52} label="Draft API" sub="autosave" highlight />
      <SysBox x={360} y={50} w={110} h={44} label="Postgres" sub="draft JSON" />
      <SysBox x={500} y={50} w={100} h={44} label="S3" sub="documents" />
      <line x1="160" y1="72" x2="200" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="320" y1="72" x2="360" y2="72" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="430" y1="72" x2="500" y2="72" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />
      <SysBox x={220} y={150} w={140} h={48} label="Verify Vendor" sub="async webhook" highlight />
      <SysBox x={400} y={150} w={140} h={48} label="Submit" sub="idempotent" />
      <line x1="430" y1="94" x2="290" y2="150" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="4" />
      <line x1="430" y1="94" x2="470" y2="150" stroke="var(--primary)" strokeWidth="1.2" markerEnd="url(#arrow)" />
      <text x="360" y="220" textAnchor="middle" className="fill-muted-foreground text-xs">Resume later via magic link; step validators run server-side only</text>
    </svg>
  );
}

function SystemModernStackDiagram() {
  return (
    <svg viewBox="0 0 720 280" className="h-auto w-full" role="img" aria-label="Modern SaaS data stack">
      <ArrowDefs />
      <text x="360" y="22" textAnchor="middle" className="fill-foreground text-sm font-semibold">Modern SaaS — typical data-intensive stack</text>
      <SysBox x={300} y={36} w={120} h={40} label="Clients" sub="web + mobile" />
      <line x1="360" y1="76" x2="360" y2="92" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrow)" />
      <SysBox x={270} y={92} w={180} h={40} label="CDN + Reverse Proxy" sub="Cloudflare / nginx" highlight />
      <line x1="360" y1="132" x2="360" y2="148" stroke="var(--muted-foreground)" strokeWidth="1.5" />
      <SysBox x={290} y={148} w={140} h={40} label="API Services" sub="Docker / K8s" />
      {[{ x: 50, l: "PostgreSQL" }, { x: 175, l: "Redis" }, { x: 300, l: "Kafka" }, { x: 425, l: "Elasticsearch" }, { x: 550, l: "Snowflake" }].map((d) => (
        <g key={d.l}>
          <SysBox x={d.x} y={210} w={110} h={44} label={d.l} />
          <line x1={d.x + 55} y1="188" x2={d.x + 55} y2="210" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="3" />
        </g>
      ))}
      <text x="360" y="272" textAnchor="middle" className="fill-muted-foreground text-xs">Used by Airbnb, Stripe, Shopify, Canva — specialized stores connected by events</text>
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
  "system-airbnb": SystemAirbnbDiagram,
  "system-whatsapp": SystemWhatsappDiagram,
  "system-google-search": SystemGoogleSearchDiagram,
  "system-meta-feed": SystemMetaFeedDiagram,
  "system-canva": SystemCanvaDiagram,
  "system-modern-stack": SystemModernStackDiagram,
  "system-youtube": SystemYoutubeDiagram,
  "system-reservation": SystemReservationDiagram,
  "system-voting": SystemVotingDiagram,
  "system-multiplayer": SystemMultiplayerDiagram,
  "system-puzzle": SystemPuzzleDiagram,
  "system-multistep-workflow": SystemMultistepWorkflowDiagram,
  "system-multistep-form": SystemMultistepFormDiagram,
};

const SYSTEM_DIAGRAMS = new Set([
  "system-airbnb",
  "system-whatsapp",
  "system-google-search",
  "system-meta-feed",
  "system-canva",
  "system-modern-stack",
  "system-youtube",
  "system-reservation",
  "system-voting",
  "system-multiplayer",
  "system-puzzle",
  "system-multistep-workflow",
  "system-multistep-form",
]);

export function TechnicalDiagram({ diagramId, caption }: TechnicalDiagramProps) {
  const Diagram = diagrams[diagramId];

  if (!Diagram) {
    return null;
  }

  const title = SYSTEM_DIAGRAMS.has(diagramId) ? "System diagram" : "Diagram";

  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Diagram />
        {caption ? <p className="text-muted-foreground mt-3 text-sm">{caption}</p> : null}
      </CardContent>
    </Card>
  );
}