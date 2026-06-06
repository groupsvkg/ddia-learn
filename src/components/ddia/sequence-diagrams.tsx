import { ArrowDefs } from "@/components/ddia/diagram-primitives";

export type SeqActorDef = { id: string; label: string; subtitle?: string };

export type SeqStepDef =
  | { kind: "message"; from: string; to: string; label: string; dashed?: boolean }
  | { kind: "return"; from: string; to: string; label: string; dashed?: boolean }
  | { kind: "note"; over: string[]; label: string }
  | { kind: "divider"; label: string };

type SequenceDiagramProps = {
  title: string;
  actors: SeqActorDef[];
  steps: SeqStepDef[];
  minHeight?: number;
};

function actorIndex(actors: SeqActorDef[], id: string): number {
  const idx = actors.findIndex((a) => a.id === id);
  return idx === -1 ? 0 : idx;
}

export function SequenceDiagram({ title, actors, steps, minHeight = 420 }: SequenceDiagramProps) {
  const width = 720;
  const marginX = 70;
  const spacing = actors.length > 1 ? (width - marginX * 2) / (actors.length - 1) : 0;
  const ax = (id: string) => marginX + actorIndex(actors, id) * spacing;

  const headerY = 44;
  const lifelineTop = 78;
  const stepStartY = 100;
  const stepH = 34;
  const footerY = stepStartY + steps.length * stepH + 24;
  const height = Math.max(minHeight, footerY + 40);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
      <ArrowDefs />
      <text x={width / 2} y={22} textAnchor="middle" className="fill-foreground text-sm font-semibold">
        {title}
      </text>

      {actors.map((actor) => {
        const x = ax(actor.id);
        return (
          <g key={actor.id}>
            <rect
              x={x - 52}
              y={headerY - 18}
              width={104}
              height={actor.subtitle ? 40 : 32}
              rx="6"
              fill="var(--muted)"
              stroke="var(--border)"
            />
            <text x={x} y={headerY + (actor.subtitle ? 2 : 6)} textAnchor="middle" className="fill-foreground text-xs font-medium">
              {actor.label}
            </text>
            {actor.subtitle ? (
              <text x={x} y={headerY + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {actor.subtitle}
              </text>
            ) : null}
            <line
              x1={x}
              y1={lifelineTop}
              x2={x}
              y2={footerY}
              stroke="var(--border)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
          </g>
        );
      })}

      {steps.map((step, i) => {
        const currentY = stepStartY + i * stepH;

        if (step.kind === "divider") {
          return (
            <g key={i}>
              <line x1={marginX - 20} y1={currentY + 8} x2={width - marginX + 20} y2={currentY + 8} stroke="var(--border)" strokeDasharray="3 3" />
              <text x={width / 2} y={currentY + 22} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {step.label}
              </text>
            </g>
          );
        }

        if (step.kind === "note") {
          const xs = step.over.map((id) => ax(id));
          const left = Math.min(...xs) - 40;
          const right = Math.max(...xs) + 40;
          return (
            <g key={i}>
              <rect x={left} y={currentY - 4} width={right - left} height={28} rx="4" fill="var(--accent)" fillOpacity={0.15} stroke="var(--accent)" strokeDasharray="4 2" />
              <text x={(left + right) / 2} y={currentY + 14} textAnchor="middle" className="fill-foreground text-[10px]">
                {step.label}
              </text>
            </g>
          );
        }

        const fromX = ax(step.from);
        const toX = ax(step.to);
        const isReturn = step.kind === "return";
        const dashed = (step.kind === "message" || step.kind === "return") && step.dashed;
        const goingRight = fromX <= toX;
        const x1 = goingRight ? fromX : toX;
        const x2 = goingRight ? toX : fromX;
        const midX = (fromX + toX) / 2;
        const arrowY = currentY + 14;
        const labelY = currentY + (isReturn ? 26 : 10);
        const stroke = isReturn ? "var(--muted-foreground)" : "var(--primary)";
        const marker = isReturn
          ? goingRight
            ? "url(#arrow-left)"
            : "url(#arrow)"
          : goingRight
            ? "url(#arrow)"
            : "url(#arrow-left)";

        return (
          <g key={i}>
            <line
              x1={x1}
              y1={arrowY}
              x2={x2}
              y2={arrowY}
              stroke={stroke}
              strokeWidth="1.5"
              strokeDasharray={dashed || isReturn ? "5 3" : undefined}
              markerEnd={marker}
            />
            <text x={midX} y={labelY} textAnchor="middle" className="fill-foreground text-[10px]">
              {step.label}
            </text>
          </g>
        );
      })}

      {actors.map((actor) => {
        const x = ax(actor.id);
        return (
          <rect
            key={`foot-${actor.id}`}
            x={x - 52}
            y={footerY - 16}
            width={104}
            height={actor.subtitle ? 40 : 32}
            rx="6"
            fill="var(--muted)"
            stroke="var(--border)"
          />
        );
      })}
      {actors.map((actor) => {
        const x = ax(actor.id);
        return (
          <text key={`foot-label-${actor.id}`} x={x} y={footerY + (actor.subtitle ? 2 : 6)} textAnchor="middle" className="fill-foreground text-xs font-medium">
            {actor.label}
          </text>
        );
      })}
    </svg>
  );
}

function seq(
  title: string,
  actors: SeqActorDef[],
  steps: SeqStepDef[],
  minHeight?: number,
): () => React.ReactNode {
  return () => <SequenceDiagram title={title} actors={actors} steps={steps} minHeight={minHeight} />;
}

export const sequenceDiagrams: Record<string, () => React.ReactNode> = {
  "seq-foundations-request": seq(
    "Typical request path — client to data stores",
    [
      { id: "client", label: "Client", subtitle: "browser/app" },
      { id: "cdn", label: "CDN", subtitle: "Cloudflare" },
      { id: "api", label: "API", subtitle: "K8s pods" },
      { id: "cache", label: "Redis", subtitle: "cache" },
      { id: "db", label: "Postgres", subtitle: "OLTP" },
    ],
    [
      { kind: "message", from: "client", to: "cdn", label: "GET /static" },
      { kind: "return", from: "cdn", to: "client", label: "cached assets" },
      { kind: "message", from: "client", to: "api", label: "GET /api/resource" },
      { kind: "message", from: "api", to: "cache", label: "GET cache key" },
      { kind: "return", from: "cache", to: "api", label: "miss" },
      { kind: "message", from: "api", to: "db", label: "SELECT …" },
      { kind: "return", from: "db", to: "api", label: "rows" },
      { kind: "message", from: "api", to: "cache", label: "SETEX result", dashed: true },
      { kind: "return", from: "api", to: "client", label: "200 JSON" },
    ],
    380,
  ),

  "seq-youtube-upload": seq(
    "YouTube — resumable upload and transcode pipeline",
    [
      { id: "creator", label: "Creator" },
      { id: "upload", label: "Upload API" },
      { id: "s3", label: "Object Store" },
      { id: "kafka", label: "Kafka" },
      { id: "worker", label: "Transcoder" },
    ],
    [
      { kind: "message", from: "creator", to: "upload", label: "POST /uploads (multipart)" },
      { kind: "message", from: "upload", to: "s3", label: "PUT raw chunks" },
      { kind: "return", from: "s3", to: "upload", label: "ETag" },
      { kind: "message", from: "upload", to: "kafka", label: "video.uploaded event" },
      { kind: "return", from: "upload", to: "creator", label: "201 videoId" },
      { kind: "divider", label: "async workers" },
      { kind: "message", from: "kafka", to: "worker", label: "consume job" },
      { kind: "message", from: "worker", to: "s3", label: "read raw / write HLS segments" },
      { kind: "message", from: "worker", to: "kafka", label: "video.ready event", dashed: true },
    ],
    400,
  ),

  "seq-youtube-playback": seq(
    "YouTube — playback manifest and CDN segments",
    [
      { id: "viewer", label: "Viewer" },
      { id: "api", label: "Metadata API" },
      { id: "cdn", label: "CDN Edge" },
      { id: "origin", label: "Origin / S3" },
    ],
    [
      { kind: "message", from: "viewer", to: "api", label: "GET /videos/:id" },
      { kind: "return", from: "api", to: "viewer", label: "manifest URL + title" },
      { kind: "message", from: "viewer", to: "cdn", label: "GET playlist.m3u8" },
      { kind: "return", from: "cdn", to: "viewer", label: "bitrate ladder" },
      { kind: "message", from: "viewer", to: "cdn", label: "GET segment-004.ts" },
      { kind: "note", over: ["cdn", "origin"], label: "cache miss → origin fetch" },
      { kind: "message", from: "cdn", to: "origin", label: "fetch segment", dashed: true },
      { kind: "return", from: "cdn", to: "viewer", label: "video bytes" },
    ],
    360,
  ),

  "seq-whatsapp-message": seq(
    "WhatsApp — send message with offline fallback",
    [
      { id: "sender", label: "Sender" },
      { id: "server", label: "Chat Server" },
      { id: "store", label: "Message Store" },
      { id: "receiver", label: "Receiver" },
      { id: "push", label: "APNs/FCM" },
    ],
    [
      { kind: "message", from: "sender", to: "server", label: "SEND msg (WebSocket)" },
      { kind: "message", from: "server", to: "store", label: "append seq=N" },
      { kind: "return", from: "store", to: "server", label: "ACK" },
      { kind: "return", from: "server", to: "sender", label: "delivered ✓" },
      { kind: "divider", label: "receiver online vs offline" },
      { kind: "message", from: "server", to: "receiver", label: "PUSH msg (WebSocket)" },
      { kind: "message", from: "receiver", to: "server", label: "ACK seq=N" },
      { kind: "note", over: ["server", "push"], label: "if offline" },
      { kind: "message", from: "server", to: "push", label: "notify", dashed: true },
      { kind: "message", from: "push", to: "receiver", label: "push alert", dashed: true },
    ],
    420,
  ),

  "seq-reservation-booking": seq(
    "Reservation — hold, pay, confirm saga",
    [
      { id: "guest", label: "Guest" },
      { id: "api", label: "Booking API" },
      { id: "inv", label: "Inventory DB" },
      { id: "stripe", label: "Stripe" },
      { id: "kafka", label: "Kafka" },
    ],
    [
      { kind: "message", from: "guest", to: "api", label: "POST /holds" },
      { kind: "message", from: "api", to: "inv", label: "BEGIN; lock slot" },
      { kind: "return", from: "inv", to: "api", label: "holdId" },
      { kind: "return", from: "api", to: "guest", label: "hold expires 15m" },
      { kind: "message", from: "guest", to: "api", label: "POST /confirm + Idempotency-Key" },
      { kind: "message", from: "api", to: "stripe", label: "charge" },
      { kind: "return", from: "stripe", to: "api", label: "paymentId" },
      { kind: "message", from: "api", to: "inv", label: "confirm hold → COMMIT" },
      { kind: "message", from: "api", to: "kafka", label: "booking.confirmed", dashed: true },
      { kind: "return", from: "api", to: "guest", label: "201 confirmed" },
    ],
    400,
  ),

  "seq-reservation-failure": seq(
    "Reservation — payment failure compensation",
    [
      { id: "guest", label: "Guest" },
      { id: "api", label: "Booking API" },
      { id: "inv", label: "Inventory DB" },
      { id: "stripe", label: "Stripe" },
    ],
    [
      { kind: "message", from: "guest", to: "api", label: "POST /confirm" },
      { kind: "message", from: "api", to: "stripe", label: "charge" },
      { kind: "return", from: "stripe", to: "api", label: "card_declined" },
      { kind: "message", from: "api", to: "inv", label: "release hold (compensate)" },
      { kind: "return", from: "inv", to: "api", label: "slot available" },
      { kind: "return", from: "api", to: "guest", label: "402 retry payment" },
    ],
    300,
  ),

  "seq-voting-ballot": seq(
    "Voting — idempotent ballot submission",
    [
      { id: "voter", label: "Voter" },
      { id: "api", label: "Ballot API" },
      { id: "db", label: "Ballot Log" },
      { id: "agg", label: "Aggregator" },
      { id: "cache", label: "Results" },
    ],
    [
      { kind: "message", from: "voter", to: "api", label: "POST /ballots + Idempotency-Key" },
      { kind: "message", from: "api", to: "db", label: "INSERT … ON CONFLICT DO NOTHING" },
      { kind: "return", from: "db", to: "api", label: "ballotId" },
      { kind: "message", from: "api", to: "agg", label: "ballot.cast event", dashed: true },
      { kind: "return", from: "api", to: "voter", label: "201 accepted" },
      { kind: "divider", label: "async tally" },
      { kind: "message", from: "agg", to: "cache", label: "INCR choice_count" },
      { kind: "message", from: "voter", to: "cache", label: "GET /results", dashed: true },
      { kind: "return", from: "cache", to: "voter", label: "live totals" },
    ],
    380,
  ),

  "seq-multiplayer-tick": seq(
    "Multiplayer game — input to authoritative tick",
    [
      { id: "clientA", label: "Player A" },
      { id: "server", label: "Game Server" },
      { id: "clientB", label: "Player B" },
    ],
    [
      { kind: "message", from: "clientA", to: "server", label: "INPUT tick=42 (UDP)" },
      { kind: "message", from: "clientB", to: "server", label: "INPUT tick=42 (UDP)" },
      { kind: "note", over: ["server"], label: "simulate physics @ 60 Hz" },
      { kind: "message", from: "server", to: "clientA", label: "STATE delta tick=42" },
      { kind: "message", from: "server", to: "clientB", label: "STATE delta tick=42" },
      { kind: "message", from: "clientA", to: "server", label: "ACK tick=42", dashed: true },
    ],
    320,
  ),

  "seq-multiplayer-match": seq(
    "Multiplayer — matchmaking to game server",
    [
      { id: "player", label: "Player" },
      { id: "mm", label: "Matchmaker" },
      { id: "agones", label: "Agones/K8s" },
      { id: "game", label: "Game Server" },
    ],
    [
      { kind: "message", from: "player", to: "mm", label: "enqueue(ticket)" },
      { kind: "note", over: ["mm"], label: "skill + region bucket" },
      { kind: "message", from: "mm", to: "agones", label: "allocate pod" },
      { kind: "return", from: "agones", to: "mm", label: "host:port" },
      { kind: "return", from: "mm", to: "player", label: "match found" },
      { kind: "message", from: "player", to: "game", label: "CONNECT UDP" },
      { kind: "return", from: "game", to: "player", label: "world snapshot" },
    ],
    340,
  ),

  "seq-puzzle-turn": seq(
    "Puzzle game — validated turn with version check",
    [
      { id: "player", label: "Player" },
      { id: "api", label: "Game API" },
      { id: "log", label: "Move Log" },
      { id: "board", label: "Board DB" },
      { id: "redis", label: "Leaderboard" },
    ],
    [
      { kind: "message", from: "player", to: "api", label: "POST /move v=7" },
      { kind: "message", from: "api", to: "board", label: "UPDATE … WHERE version=7" },
      { kind: "return", from: "board", to: "api", label: "1 row (ok)" },
      { kind: "message", from: "api", to: "log", label: "append move event" },
      { kind: "message", from: "api", to: "redis", label: "ZADD score", dashed: true },
      { kind: "return", from: "api", to: "player", label: "200 new board" },
    ],
    320,
  ),

  "seq-workflow-saga": seq(
    "Multistep workflow — checkout saga",
    [
      { id: "client", label: "Client" },
      { id: "orch", label: "Orchestrator" },
      { id: "inv", label: "Inventory" },
      { id: "pay", label: "Payments" },
      { id: "ship", label: "Shipping" },
    ],
    [
      { kind: "message", from: "client", to: "orch", label: "start checkout" },
      { kind: "message", from: "orch", to: "inv", label: "reserve stock" },
      { kind: "return", from: "inv", to: "orch", label: "holdId" },
      { kind: "message", from: "orch", to: "pay", label: "capture payment" },
      { kind: "return", from: "pay", to: "orch", label: "chargeId" },
      { kind: "message", from: "orch", to: "ship", label: "create shipment" },
      { kind: "return", from: "ship", to: "orch", label: "trackingId" },
      { kind: "return", from: "orch", to: "client", label: "order complete" },
    ],
    360,
  ),

  "seq-workflow-compensate": seq(
    "Multistep workflow — compensate on payment failure",
    [
      { id: "orch", label: "Orchestrator" },
      { id: "inv", label: "Inventory" },
      { id: "pay", label: "Payments" },
    ],
    [
      { kind: "message", from: "orch", to: "inv", label: "reserve stock" },
      { kind: "return", from: "inv", to: "orch", label: "holdId" },
      { kind: "message", from: "orch", to: "pay", label: "capture payment" },
      { kind: "return", from: "pay", to: "orch", label: "FAILED" },
      { kind: "message", from: "orch", to: "inv", label: "release hold (compensate)" },
      { kind: "return", from: "inv", to: "orch", label: "stock restored" },
    ],
    280,
  ),

  "seq-collaboration-edit": seq(
    "Collaboration — real-time edit propagation",
    [
      { id: "userA", label: "User A" },
      { id: "ws", label: "Collab Server" },
      { id: "userB", label: "User B" },
      { id: "db", label: "Postgres" },
    ],
    [
      { kind: "message", from: "userA", to: "ws", label: "WS connect + auth" },
      { kind: "message", from: "userB", to: "ws", label: "WS connect + auth" },
      { kind: "message", from: "userA", to: "ws", label: "OP insert('hello')" },
      { kind: "message", from: "ws", to: "db", label: "persist op + snapshot?", dashed: true },
      { kind: "message", from: "ws", to: "userB", label: "BROADCAST op" },
      { kind: "return", from: "userB", to: "ws", label: "ACK", dashed: true },
      { kind: "message", from: "userB", to: "ws", label: "OP cursor move" },
      { kind: "message", from: "ws", to: "userA", label: "presence update", dashed: true },
    ],
    360,
  ),

  "seq-form-autosave": seq(
    "Multistep form — autosave and async verification",
    [
      { id: "user", label: "Applicant" },
      { id: "api", label: "Draft API" },
      { id: "db", label: "Postgres" },
      { id: "s3", label: "S3" },
      { id: "vendor", label: "Verify API" },
    ],
    [
      { kind: "message", from: "user", to: "api", label: "PATCH /draft step=2" },
      { kind: "message", from: "api", to: "db", label: "UPSERT draft JSON" },
      { kind: "return", from: "api", to: "user", label: "204 saved" },
      { kind: "message", from: "user", to: "s3", label: "PUT doc.pdf (signed URL)" },
      { kind: "message", from: "user", to: "api", label: "POST /submit" },
      { kind: "message", from: "api", to: "vendor", label: "start verification" },
      { kind: "return", from: "api", to: "user", label: "202 pending" },
      { kind: "message", from: "vendor", to: "api", label: "webhook: verified", dashed: true },
      { kind: "message", from: "api", to: "db", label: "status=APPROVED", dashed: true },
    ],
    400,
  ),
};

export const SEQUENCE_DIAGRAM_IDS = new Set(Object.keys(sequenceDiagrams));