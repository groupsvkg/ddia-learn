import type { ContentBlock } from "../src/types/content";
import { why } from "./lesson-snippets";

function section(title = "Why these technologies?"): ContentBlock {
  return { type: "heading", text: title, level: 2 };
}

/** Shared building blocks referenced across many designs */
export function foundationsStack(): ContentBlock[] {
  return [
    section("Why common infrastructure building blocks?"),
    why(
      "CDN (Cloudflare / CloudFront)",
      "Static assets (JS, CSS, images) are identical for every user — perfect for edge caching. A CDN also absorbs DDoS and terminates TLS close to users, shrinking latency and origin load. You would skip it only for a purely internal API with no browser clients.",
    ),
    why(
      "Load balancer / reverse proxy (nginx, Envoy, ALB)",
      "Distributes traffic across many stateless API pods, performs health checks, and can enforce rate limits and auth before requests hit application code. Required once you run more than one API instance — which is effectively always in production.",
    ),
    why(
      "API gateway",
      "Single front door for clients: routing to microservices, JWT validation, request shaping, and API versioning. Alternatives: embed routing in the load balancer (simpler monolith) or use a service mesh (Istio) for east-west traffic between services.",
    ),
    why(
      "PostgreSQL",
      "Default choice when you need ACID transactions, joins, foreign keys, and ad-hoc queries — bookings, accounts, permissions. Poor fit for billion-row append-only logs, video blobs, or sub-millisecond leaderboard hot paths.",
    ),
    why(
      "Redis",
      "In-memory speed for hot keys: sessions, rate counters, presence, leaderboards (sorted sets), and short-lived holds. Data is ephemeral or cache-aside — never the sole source of truth for money or inventory unless you accept loss on restart.",
    ),
    why(
      "Kafka (or SQS / Pub/Sub)",
      "Buffers spikes, decouples producers from consumers, and lets you add subscribers (search index, email, analytics) without changing the write API. Use when work can be asynchronous; skip when the user waits for the result in the same HTTP request.",
    ),
    why(
      "Elasticsearch (or OpenSearch)",
      "Full-text search, fuzzy matching, facets, and geo filters at scale. Indexes are derived from an OLTP source of truth via CDC — never the system of record for payments or inventory.",
    ),
    why(
      "Object storage (S3 / GCS)",
      "Cheap, durable storage for large immutable blobs: video, images, PDFs, backups. Not for low-latency row lookups — pair with a database for metadata pointers.",
    ),
    why(
      "Kubernetes (Docker)",
      "Packages services consistently and scales stateless pods horizontally. Agones extends K8s for game servers; batch workers and functions (Lambda) replace K8s when you want zero cluster management.",
    ),
  ];
}

export function youtubeStack(): ContentBlock[] {
  return [
    section(),
    why(
      "Object storage (S3 / GCS)",
      "Video files are gigabytes — storing them in Postgres or on API servers is impossible at scale. Object storage offers pennies-per-GB durability with multipart/resumable upload APIs. Metadata (title, status) lives elsewhere.",
    ),
    why(
      "Upload API (stateless service)",
      "Accepts chunked uploads, validates auth, and issues pre-signed URLs so bytes stream directly to object storage without proxying through app servers. Keeps API pods memory-light.",
    ),
    why(
      "Kafka / Pub/Sub",
      "Transcoding takes minutes and must not block the upload response. An event ('video.uploaded') fans out to worker pools that scale independently. Also feeds moderation, thumbnails, and search indexing.",
    ),
    why(
      "Transcoder workers (FFmpeg fleet)",
      "CPU-heavy, embarrassingly parallel — one job per resolution. Run on spot instances or batch queues, not on request-serving API pods. Output is immutable HLS/DASH segments back to object storage.",
    ),
    why(
      "CDN",
      "99% of bytes are video segments served repeatedly — edge caching cuts origin egress cost and startup latency. Adaptive bitrate manifests let players switch quality without new API calls.",
    ),
    why(
      "Metadata database (PostgreSQL / sharded SQL)",
      "Titles, channels, comments, and processing state need joins, indexes, and transactions. Sharded or regional when single-node Postgres saturates — not replaced by object storage.",
    ),
    why(
      "Stream processor (Flink / Dataflow) for view counts",
      "Exact per-view counts are unnecessary; approximate aggregation at millions of events/sec is cheaper than row-level UPDATE on a video table.",
    ),
  ];
}

export function whatsappStack(): ContentBlock[] {
  return [
    section(),
    why(
      "Erlang/BEAM or similar (chat server)",
      "Millions of concurrent WebSocket connections per machine with preemptive scheduling and hot code reload. Node.js or Go work at smaller scale; BEAM is proven for telco-grade connection fan-in.",
    ),
    why(
      "WebSocket (not HTTP polling)",
      "Bi-directional, low-overhead channel for instant delivery and typing indicators. Long polling wastes bandwidth; SSE is server→client only.",
    ),
    why(
      "Durable message store (Cassandra / HBase / custom)",
      "Append-heavy writes at massive QPS with partition by chat_id. PostgreSQL struggles with write fan-out to billions of messages; the store optimizes for log-like access, not complex joins.",
    ),
    why(
      "APNs / FCM (push gateway)",
      "Mobile OSes kill background apps — you cannot hold a WebSocket forever on a phone. Push wakes the app to pull pending messages when offline.",
    ),
    why(
      "Redis (presence & typing)",
      "Ephemeral state with TTL: online status, typing indicators, connection routing hints. Loss on restart is acceptable — users reconnect. Wrong tool for durable message history.",
    ),
    why(
      "Client-side E2E encryption (Signal protocol)",
      "Servers route ciphertext they cannot read — privacy promise. Trade-off: server-side search and moderation become harder.",
    ),
    why(
      "Not Elasticsearch for every message",
      "Full-text search across all chats is expensive and often not a product requirement. WhatsApp optimizes delivery, not global search.",
    ),
  ];
}

export function reservationStack(): ContentBlock[] {
  return [
    section(),
    why(
      "Elasticsearch / OpenSearch",
      "Guests search by date range, location, price, amenities — fuzzy, faceted queries that SQL can do but not at Airbnb-scale relevance ranking. Index is rebuilt from listing events; stale by seconds is OK.",
    ),
    why(
      "PostgreSQL (inventory OLTP)",
      "A night sold twice destroys trust — needs ACID, row locks, unique constraints, and serializable transactions on inventory rows. DynamoDB can work with careful conditional writes but SQL is the default for booking invariants.",
    ),
    why(
      "API gateway",
      "Routes read-heavy search traffic separately from write-heavy booking commits. Can throttle abusive search without starving checkout.",
    ),
    why(
      "Stripe / Adyen (payments)",
      "PCI-DSS compliance, card vaulting, and dispute handling outsourced — building this in-house is a non-starter for most products.",
    ),
    why(
      "Kafka",
      "After booking commits, emails, search index updates, analytics, and host notifications run async. Outbox pattern ensures events publish only after DB commit.",
    ),
    why(
      "Redis (optional hold TTL)",
      "Fast expiry of abandoned cart holds with key TTL + background sweeper. Source of truth remains Postgres; Redis accelerates 'is this hold still valid?' checks.",
    ),
    why(
      "Saga / workflow orchestrator",
      "Hold → pay → confirm spans services — no single XA transaction across Stripe and your DB. Compensating release on payment failure is mandatory.",
    ),
  ];
}

export function votingStack(): ContentBlock[] {
  return [
    section(),
    why(
      "PostgreSQL (append-only ballot log)",
      "UNIQUE (election_id, voter_id) enforces one vote per person at the database layer. Append-only inserts preserve audit trail; tallies are derived, never UPDATE-in-place on ballot rows.",
    ),
    why(
      "Idempotency-Key header",
      "Network retries must not create duplicate ballots — same key returns the same result. Simpler than distributed locks for voter sessions.",
    ),
    why(
      "Kafka / stream processor",
      "Aggregates millions of ballots into live totals without scanning the full table on every results page refresh. Handles write spikes when polls close.",
    ),
    why(
      "Redis / materialized results cache",
      "Results pages are read-heavy during election night — precomputed counts serve sub-ms reads. Eventual consistency of +1–2 seconds is usually acceptable for display.",
    ),
    why(
      "API gateway + rate limiting (Cloudflare / WAF)",
      "Bot protection and per-IP throttling at the edge before ballots hit your origin. Critical when viral links drive traffic spikes.",
    ),
    why(
      "Not updating vote counts in the ballot row",
      "In-place UPDATE loses auditability and races under concurrency. Event sourcing pattern: insert ballot, derive count.",
    ),
  ];
}

export function multiplayerStack(): ContentBlock[] {
  return [
    section(),
    why(
      "UDP (game traffic)",
      "TCP head-of-line blocking adds latency unsuitable for 60 Hz shooters. UDP drops packets — game state corrects on next tick. TCP/HTTP fine for lobby and matchmaking.",
    ),
    why(
      "Authoritative game server",
      "Server simulates truth; clients predict locally then reconcile. Prevents speed hacks and wall hacks — P2P cannot enforce fairness in competitive games.",
    ),
    why(
      "Matchmaker service",
      "Groups players by skill (MMR) and region (ping). Separate from game simulation — queue logic changes without redeploying game binaries.",
    ),
    why(
      "Agones / Kubernetes game pods",
      "Each match is an isolated process with dedicated CPU — natural scale unit. Spin up pod per match, tear down after. StatefulSet assigns stable UDP ports.",
    ),
    why(
      "In-memory state (not Postgres during match)",
      "Sub-16 ms tick loops cannot round-trip to disk. Checkpoint stats to DB only after match ends. Redis optional for cross-service lobby state.",
    ),
    why(
      "Kafka (telemetry)",
      "Fire-and-forget analytics: kills, crashes, latency histograms. Never blocks the game tick loop.",
    ),
    why(
      "Not a single global game database",
      "Game state is ephemeral and regional — sharding by match ID, not user ID.",
    ),
  ];
}

export function puzzleStack(): ContentBlock[] {
  return [
    section(),
    why(
      "PostgreSQL (board state)",
      "Turn-based games tolerate 50–200 ms latency — ACID updates with version column prevent stale moves. Simpler than CRDTs for single-writer-per-turn chess.",
    ),
    why(
      "Append-only move log",
      "Replay games, spectator mode, and dispute resolution. Event sourcing lite — board is a projection of moves.",
    ),
    why(
      "Redis sorted sets (leaderboard)",
      "O(log N) rank updates and top-K queries at millions of players. Recomputing ranks in SQL nightly is too slow for live daily puzzles.",
    ),
    why(
      "Scheduler (SQS delay / Redis TTL / cron)",
      "Forfeit players who exceed turn timeout without polling every second in application code.",
    ),
    why(
      "HTTPS / WebSocket (not UDP)",
      "Puzzle games are not latency-competitive — reliable delivery matters more. JSON payloads are tiny.",
    ),
    why(
      "Push notifications (APNs/FCM)",
      "Async turn games notify opponent it's their move — optional but standard for retention.",
    ),
  ];
}

export function multistepWorkflowStack(): ContentBlock[] {
  return [
    section(),
    why(
      "Temporal / Step Functions / Cadence",
      "Durable workflow state survives worker crashes. Timers (wait 7 days for KYC) without holding threads. Replay history for debugging failed checkouts.",
    ),
    why(
      "Saga pattern (not 2PC)",
      "Payment, inventory, and shipping are separate services — XA transactions across Stripe and your DB don't exist. Compensating actions (release hold) are explicit.",
    ),
    why(
      "Kafka (choreography option)",
      "Services react to events without a central orchestrator — looser coupling, harder to visualize. Many teams start with orchestration, add events for notifications.",
    ),
    why(
      "Per-service PostgreSQL",
      "Each bounded context owns its data — inventory service DB, payment service ledger. Shared monolith DB creates deployment coupling.",
    ),
    why(
      "Idempotent activity implementations",
      "Retries are guaranteed — charge API must accept same idempotency key, ship API must tolerate duplicate create with same correlation ID.",
    ),
    why(
      "Dead-letter queue",
      "Poison messages (bad payload) isolate without blocking the whole saga — ops can inspect and replay.",
    ),
  ];
}

export function collaborationStack(): ContentBlock[] {
  return [
    section(),
    why(
      "WebSocket collab server",
      "Sub-100 ms operation broadcast for cursors and edits. HTTP polling would feel laggy and waste bandwidth.",
    ),
    why(
      "OT or CRDT library (Yjs, Automerge)",
      "Merge concurrent edits without locking the whole document. OT needs server ordering; CRDTs can peer-sync offline then merge.",
    ),
    why(
      "PostgreSQL (metadata & ACL)",
      "Document titles, share permissions, folder hierarchy — relational model fits. Not for multi-MB canvas blobs.",
    ),
    why(
      "S3 / GCS (assets)",
      "Images, fonts, video layers are large immutable files — cheap object storage with CDN in front for export/download.",
    ),
    why(
      "Redis (presence & pub/sub)",
      "Who is online, cursor color, typing — ephemeral with TTL. Pub/sub bridges collab server instances in multi-region deploys.",
    ),
    why(
      "Sticky routing by document ID",
      "OT requires consistent operation ordering per document — route all ops for doc X to the same server or use CRDT to avoid stickiness.",
    ),
    why(
      "Not storing every keystroke in Postgres forever",
      "Op log compacted to periodic snapshots — unbounded insert rate would saturate OLTP.",
    ),
  ];
}

export function multistepFormStack(): ContentBlock[] {
  return [
    section(),
    why(
      "PostgreSQL (draft storage)",
      "Multi-day forms need durable JSON blobs keyed by user + form version — survives browser close and device switch. Session cookies expire; DB drafts don't.",
    ),
    why(
      "S3 pre-signed URLs",
      "Large documents (PDFs, scans) upload directly to object storage — API servers don't proxy gigabyte files. Draft row stores S3 key pointer only.",
    ),
    why(
      "Step-scoped validation API",
      "Validate only fields for current step — faster UX and clearer errors than validating entire 50-field form on every keystroke.",
    ),
    why(
      "Async verification vendor + webhook",
      "Credit checks and identity verification take seconds to days — cannot block HTTP request. Webhook transitions draft from PENDING to APPROVED.",
    ),
    why(
      "Idempotent final submit",
      "Double-click submit must not create two loan applications — same pattern as Stripe idempotency keys.",
    ),
    why(
      "Field-level encryption",
      "SSN and tax IDs encrypted at rest in Postgres — defense in depth beyond disk encryption.",
    ),
    why(
      "Not a workflow engine for simple 3-step forms",
      "Temporal is overkill for a checkout wizard — Postgres draft + state machine in application code suffices until human review gates appear.",
    ),
  ];
}