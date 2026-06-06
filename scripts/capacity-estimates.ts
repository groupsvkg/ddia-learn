import type { ContentBlock } from "../src/types/content";
import { code, rw } from "./lesson-snippets";
import { TS } from "./lesson-snippets";

function boteHeader(): ContentBlock {
  return { type: "heading", text: "Back-of-the-envelope estimates", level: 2 };
}

function assumptions(text: string): ContentBlock {
  return { type: "paragraph", text };
}

function calcs(items: string[]): ContentBlock {
  return { type: "list", items };
}

function summary(text: string): ContentBlock {
  return { type: "callout", title: "Order-of-magnitude summary", text, variant: "tip" };
}

export function youtubeEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume 500M DAU, 1B video views/day, 500k new uploads/day, average watch time 10 minutes at 3 Mbps, metadata API ~2 KB per video page load.",
    ),
    { type: "heading", text: "Read traffic", level: 3 },
    calcs([
      "Views/day → 1B / 86,400 ≈ 11,600 views/s average.",
      "Peak (prime time ×5) ≈ 58,000 metadata reads/s for titles, manifests, comments.",
      "CDN video bytes: 1B views × 10 min × 3 Mbps / 8 ≈ 2.25 EB/day theoretical max — in practice ABR averages ~1 Mbps → ~750 PB/day egress; 95%+ served from CDN cache (long-tail + viral).",
      "Metadata cache (Redis): hot 1% of videos = 10M keys × 2 KB ≈ 20 GB — fits a modest cluster.",
    ]),
    { type: "heading", text: "Write traffic", level: 3 },
    calcs([
      "Uploads: 500k/day ≈ 5.8 uploads/s average, peak ~30/s.",
      "Avg raw upload 500 MB → 500k × 500 MB ≈ 250 TB/day ingest to object storage.",
      "Transcode fan-out: 4 renditions × 500k ≈ 2M FFmpeg jobs/day → ~23 jobs/s sustained, burst queue depth in Kafka matters.",
      "View-count events: batched — 1B events/day to stream processor ≈ 11,600 events/s (not 1B UPDATEs on Postgres).",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Catalog: 500M videos × 2 KB metadata ≈ 1 TB (+ indexes → plan 3–5 TB).",
      "Raw + transcoded: 500k new/day × (500 MB raw + ~1.5 GB segments) ≈ 1 PB/year growth — tier cold content to cheaper storage class.",
    ]),
    { type: "heading", text: "Network & memory", level: 3 },
    calcs([
      "Upload path bandwidth: 250 TB/day ÷ 86,400 ≈ 2.4 GB/s average ingest — dedicated upload endpoints, not mixed with API.",
      "Transcoder fleet: ~23 concurrent jobs/s × ~2 min/job ≈ 3,000 workers at peak if not batched overnight.",
      "Origin shield: without CDN, 750 PB/day is impossible — CDN is mandatory, not optional.",
    ]),
    code("YouTube peak metadata QPS", TS.youtubeMetadataQps),
    summary(
      "~60k peak metadata QPS, ~750 PB/day video egress (mostly CDN), ~250 TB/day upload ingest, ~1 PB/year storage growth. Separate read (CDN) from write (upload + transcode) paths.",
    ),
  ];
}

export function whatsappEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume 2B MAU, 500M DAU, 100B messages/day, avg message 2 KB ciphertext, 200M concurrent connections peak, 7-day server-side retention for offline delivery.",
    ),
    { type: "heading", text: "Write traffic", level: 3 },
    calcs([
      "Messages: 100B / 86,400 ≈ 1.16M messages/s average.",
      "Peak (2× average) ≈ 2.3M writes/s globally — partitioned by chat_id across message store clusters.",
      "Group fan-out: 1 write → N deliveries; a 256-member group multiplies connection writes (hybrid pull model essential for large groups).",
    ]),
    { type: "heading", text: "Read traffic", level: 3 },
    calcs([
      "Delivery: roughly 1:1 with sends for online users; offline users read on reconnect (sync from last acked seq).",
      "Connection fan-in: 200M concurrent WebSockets — ~2M connections per chat server at 100 machines (order-of-magnitude).",
      "Push notifications: ~30% offline → 350M pushes/day ≈ 4,000/s to APNs/FCM.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Hot queue (7-day retention): 100B/day × 7 × 2 KB ≈ 1.4 PB — in practice most messages delivered and trimmed faster; plan hundreds of TB.",
      "Long-term: E2E encrypted blobs on device; server storage is routing + short retention, not infinite archive.",
    ]),
    { type: "heading", text: "Memory & caching", level: 3 },
    calcs([
      "Presence (Redis): 500M DAU × 100 B presence key ≈ 50 GB with TTL — sharded Redis clusters.",
      "Connection state: 200M × ~4 KB session ≈ 800 GB RAM fleet-wide for routing tables.",
      "Per-chat sequence counters: in-memory on chat server partition — negligible vs connection RAM.",
    ]),
    code("WhatsApp message write QPS", TS.whatsappWriteQps),
    summary(
      "~2.3M peak message writes/s, 200M concurrent connections, ~1 PB order-of-magnitude hot storage, presence in Redis not Postgres. Optimize connection fan-in, not SQL joins.",
    ),
  ];
}

export function reservationEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume Airbnb-scale: 150M users, 1M bookings/day, 10M active listings, avg 3 search queries per booking, 14-night avg stay window in inventory index.",
    ),
    { type: "heading", text: "Read traffic (search)", level: 3 },
    calcs([
      "Searches: 1M bookings × 3 ≈ 3M searches/day ≈ 35/s average.",
      "Peak (evening ×10) ≈ 350 search QPS to Elasticsearch — each query scans inverted index + facets, not OLTP table scan.",
      "Listing detail pages: ~10M views/day ≈ 115/s — cache hot listings in Redis (top 10% = 1M keys × 5 KB ≈ 5 GB).",
    ]),
    { type: "heading", text: "Write traffic (booking)", level: 3 },
    calcs([
      "Bookings: 1M/day ≈ 11.6/s average — low QPS but strict ACID.",
      "Peak checkout (hourly spike ×5) ≈ 60 commits/s — each hold + confirm is a short transaction with row lock on inventory night.",
      "Holds: ~3× booking attempts before success → ~35 hold transactions/s peak.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Inventory: 10M listings × 365 nights × 8 B availability bit ≈ 30 GB core calendar (simplified; real model uses date ranges).",
      "Bookings OLTP: 1M/day × 365 × 1 KB row ≈ 365 GB/year booking history.",
      "Elasticsearch index: 10M listings × 10 KB doc ≈ 100 GB (+ replicas → 300 GB).",
    ]),
    { type: "heading", text: "Network & caching", level: 3 },
    calcs([
      "Search response ~20 KB JSON × 350 QPS ≈ 7 MB/s — modest; latency is index query time, not bandwidth.",
      "Redis hold TTL: 1M holds/day × 200 B ≈ 200 MB/day churn — tiny.",
      "Kafka booking events: 1M/day × 500 B ≈ 500 MB/day for downstream consumers.",
    ]),
    code("Reservation search vs booking QPS", TS.reservationQps),
    summary(
      "~350 peak search QPS (Elasticsearch), ~60 peak booking commits/s (Postgres), ~100 GB search index. Reads dominate; writes are few but must be exactly correct.",
    ),
  ];
}

export function votingEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume national election: 100M eligible voters, 70% turnout = 70M ballots, 80% cast in final 4 hours, ballot row 500 B, results page polled every 5s by 10M viewers.",
    ),
    { type: "heading", text: "Write traffic", level: 3 },
    calcs([
      "Ballots in 4 hours: 56M / 14,400s ≈ 3,900 ballots/s sustained in peak window.",
      "Spike at poll close if everyone waits: 70M in 10 min ≈ 116,000/s — must queue or stagger; edge rate limiting essential.",
      "Append-only INSERT — no UPDATE contention; partition by election_id.",
    ]),
    { type: "heading", text: "Read traffic", level: 3 },
    calcs([
      "Results page: 10M users / 5s refresh ≈ 2M reads/s — served from Redis/materialized counts, never COUNT(*) on ballot table.",
      "Eligibility check: 70M once per voter ≈ 19,400/s if spread over 1 hour before peak.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Ballots: 70M × 500 B ≈ 35 GB — trivial for Postgres; audit log retention is the policy driver.",
      "Aggregator state: 500 choices × 8 B count ≈ 4 KB — fits in memory; Redis replica for HA.",
    ]),
    { type: "heading", text: "Network & caching", level: 3 },
    calcs([
      "Ballot POST ~1 KB request × 116k/s spike ≈ 116 MB/s ingress — API gateway + WAF at edge.",
      "Results JSON ~2 KB × 2M/s ≈ 4 GB/s egress at peak — CDN cache results page or aggressive edge caching.",
      "Cache warming: precompute totals on each ballot event; read path is O(1) per choice_id.",
    ]),
    code("Voting peak ballot writes", TS.votingPeakQps),
    summary(
      "Peak ~4k ballots/s sustained (116k/s worst-case spike), ~2M results reads/s from cache. Never aggregate live from raw ballot table on read path.",
    ),
  ];
}

export function multiplayerEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume 50M DAU, 5M concurrent players peak, 500k concurrent matches, 100 players/match max (battle royale), 60 Hz tick, 50 B input + 200 B state delta per player per tick.",
    ),
    { type: "heading", text: "Network (UDP)", level: 3 },
    calcs([
      "Per match (100 players): 100 inputs/s × 50 B + 100 deltas/s × 200 B × 100 recipients ≈ 2 MB/s per match (simplified fan-out).",
      "500k matches × 2 MB/s ≈ 1 TB/s game traffic — regional shards mandatory; global single cluster impossible.",
      "Per player: ~20 KB/s down, ~5 KB/s up — fits home broadband; mobile is the constraint.",
    ]),
    { type: "heading", text: "Compute & memory", level: 3 },
    calcs([
      "Game server RAM: ~50 MB world state per match × 500k ≈ 25 TB fleet-wide — each pod handles 1–10 matches, not 500k on one machine.",
      "Tick CPU: 60 Hz × 500k matches ≈ 30M simulations/s — GPU/CPU physics is the bottleneck, not database.",
      "Matchmaker: 5M players / 100 per match ≈ 50k match formations in a few minutes at peak — queue in Redis sorted sets by MMR.",
    ]),
    { type: "heading", text: "Storage & writes", level: 3 },
    calcs([
      "Live state: zero disk writes during match — all in-memory.",
      "Post-match stats: 500k matches/day × 5 KB ≈ 2.5 GB/day to Postgres for leaderboards.",
      "Telemetry (Kafka): 5M players × 1 KB event/min ≈ 83 MB/s fire-and-forget.",
    ]),
    { type: "heading", text: "Caching", level: 3 },
    calcs([
      "Lobby/player profile: Redis 5M × 2 KB ≈ 10 GB for matchmaking context.",
      "No CDN for game state — UDP is point-to-point.",
    ]),
    code("Multiplayer match network bandwidth", TS.multiplayerBandwidth),
    summary(
      "500k concurrent matches → regional UDP fleets, ~50 MB RAM per match in-process, matchmaker in Redis. Postgres only for post-game stats, not live ticks.",
    ),
  ];
}

export function puzzleEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume Wordle-scale daily puzzle: 5M DAU, 1 guess per user per day (6 guesses max), 3M monthly active leaderboard, chess-style async: 500k active games, 10 moves/game/day.",
    ),
    { type: "heading", text: "Read/write traffic", level: 3 },
    calcs([
      "Daily puzzle submit: 5M / 86,400 ≈ 58/s average — tiny; peak (morning ×20) ≈ 1,200/s.",
      "Each submit: 1 read (puzzle id) + 1 idempotent INSERT ≈ 2,400 DB ops/s peak.",
      "Chess moves: 500k games × 10 moves / 86,400 ≈ 58 moves/s + validation query.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Daily submissions: 5M/day × 365 × 200 B ≈ 365 GB/year.",
      "Move log: 500k games × 10 moves × 100 B × 365 days ≈ 180 GB/year.",
      "Board state: 500k active × 2 KB ≈ 1 GB — trivial.",
    ]),
    { type: "heading", text: "Leaderboard & caching", level: 3 },
    calcs([
      "Redis ZSET: 3M users × (member + score) ≈ 150 MB per daily board.",
      "Top-100 query: O(log N + 100) — sub-ms; no SQL ORDER BY on millions of rows.",
      "Cache puzzle answer hash: 1 key per day — singleflight on submit path.",
    ]),
    { type: "heading", text: "Network", level: 3 },
    calcs([
      "Submit payload ~500 B × 1,200/s ≈ 600 KB/s — HTTPS is fine; no UDP needed.",
      "Push notify opponent: 250k moves/day triggering push ≈ 3/s.",
    ]),
    code("Daily puzzle submit QPS", TS.puzzleSubmitQps),
    summary(
      "~1.2k peak submit QPS, Redis for leaderboards, Postgres for idempotent daily submissions. Correctness over latency — no heavy infra needed at this scale.",
    ),
  ];
}

export function multistepWorkflowEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume e-commerce: 2M orders/day, 5 saga steps each, 20% failure requiring compensation, 10% of orders wait 24h on KYC step, workflow history 2 KB per step.",
    ),
    { type: "heading", text: "Workflow throughput", level: 3 },
    calcs([
      "Orders: 2M/day ≈ 23/s average, peak (Black Friday ×20) ≈ 460 new sagas/s.",
      "Steps: 460 × 5 ≈ 2,300 activity invocations/s peak — each idempotent HTTP call to inventory/payment/ship.",
      "Compensations: 20% × 460 ≈ 92 reverse flows/s on failure spikes.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Workflow history: 2M orders × 5 steps × 2 KB ≈ 20 GB/day ≈ 7 TB/year — Temporal/Step Functions persist full event log.",
      "Sleeping workflows (KYC 24h): 200k in-flight × 2 KB ≈ 400 MB state — durable timers, not blocked threads.",
    ]),
    { type: "heading", text: "Messaging & network", level: 3 },
    calcs([
      "Kafka choreography (optional): 2M × 3 events × 500 B ≈ 3 GB/day async side effects.",
      "Orchestrator ↔ services: 2,300 RPC/s × 5 KB ≈ 11 MB/s — low bandwidth, latency per step dominates (Stripe ~200ms).",
    ]),
    { type: "heading", text: "Memory & caching", level: 3 },
    calcs([
      "Worker memory: replay history on crash — disk-backed in Temporal, not all in RAM.",
      "Idempotency cache (Redis): 460 new/s × 3600s × 100 B key ≈ 165 MB/hour churn for duplicate detection.",
    ]),
    code("Checkout saga peak activities", TS.workflowPeakQps),
    summary(
      "~460 peak sagas/s, ~2.3k activity calls/s, ~7 TB/year workflow history. Bottleneck is external APIs (payment, inventory), not QPS math.",
    ),
  ];
}

export function collaborationEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume 50M docs, 2M DAU, 50k docs edited concurrently peak, 5 editors/doc avg, 2 ops/s/editor, 500 B/op, 5 MB avg asset per doc, 100 KB metadata.",
    ),
    { type: "heading", text: "Real-time ops (WebSocket)", level: 3 },
    calcs([
      "Ops/s: 50k docs × 5 editors × 2 ops/s ≈ 500k ops/s globally.",
      "Per collab server (10k docs): 50k ops/s — sticky routing by doc_id.",
      "Broadcast fan-out: 500k ops × 4 peers avg × 500 B ≈ 1 GB/s WebSocket egress fleet-wide.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Metadata (Postgres): 50M × 100 KB ≈ 5 TB (+ indexes → 15 TB).",
      "Assets (S3): 50M × 5 MB ≈ 250 PB total — CDN for export/download; uploads direct to S3.",
      "Op log (before compaction): 500k ops/s × 500 B × 3600 ≈ 900 GB/hour raw — snapshot every 5 min, compact to 100 KB snapshots.",
    ]),
    { type: "heading", text: "Memory & caching", level: 3 },
    calcs([
      "Active doc in RAM (CRDT/OT): 50k × 2 MB working set ≈ 100 GB across collab fleet.",
      "Presence (Redis): 2M DAU × 150 B ≈ 300 MB with TTL.",
      "ACL cache: 50k hot docs × 1 KB permission snapshot ≈ 50 MB.",
    ]),
    { type: "heading", text: "Read traffic", level: 3 },
    calcs([
      "Doc open: 2M opens/day ≈ 23/s — load snapshot + replay tail of op log since snapshot.",
      "Export PDF (async): 100k/day ≈ 1/s — separate worker queue, not collab hot path.",
    ]),
    code("Collaboration ops per second", TS.collaborationOps),
    summary(
      "~500k peak ops/s WebSocket, ~100 GB active doc RAM, S3 for blobs not Postgres. Op log compaction is mandatory — never insert every keystroke into OLTP forever.",
    ),
  ];
}

export function multistepFormEstimates(): ContentBlock[] {
  return [
    boteHeader(),
    assumptions(
      "Assume mortgage applications: 500k submitted/year, 12 steps, autosave every 30s while active, 200k concurrent draft sessions peak, 2 MB avg attachment, 50 KB draft JSON.",
    ),
    { type: "heading", text: "Write traffic (autosave)", level: 3 },
    calcs([
      "Autosave: 200k sessions / 30s ≈ 6,700 PATCH/s peak to draft API.",
      "Each upsert: 50 KB JSON → 6,700 × 50 KB ≈ 335 MB/s write bandwidth to Postgres (batch or debounce to reduce).",
      "Final submit: 500k/year ≈ 0.016/s average — negligible vs autosave.",
    ]),
    { type: "heading", text: "Read traffic", level: 3 },
    calcs([
      "Resume session: ~same rate as autosave on open ≈ 6,700 reads/s peak for draft fetch.",
      "Step validation: 6,700 × 12 fields checked server-side — CPU bound, not I/O.",
    ]),
    { type: "heading", text: "Storage", level: 3 },
    calcs([
      "Draft JSON: 200k active × 50 KB ≈ 10 GB hot; completed 500k × 50 KB ≈ 25 GB/year retained.",
      "S3 attachments: 500k × 2 MB ≈ 1 TB/year new blobs — pre-signed PUT, not through API.",
      "Verification vendor refs: 500k × 200 B ≈ 100 MB metadata.",
    ]),
    { type: "heading", text: "Network & caching", level: 3 },
    calcs([
      "Debounce autosave to 60s → halve writes to ~3,350/s — UX trade-off.",
      "Redis draft lock: 200k × 100 B ≈ 20 MB for optimistic concurrency tokens.",
      "Webhook inbound: 500k verifications/year ≈ 1/s async — no peak concern.",
    ]),
    code("Form autosave write QPS", TS.formAutosaveQps),
    summary(
      "~6.7k peak autosave writes/s dominates traffic — debounce, S3 for files, Postgres for JSON drafts. Submit is rare; autosave drives sizing.",
    ),
  ];
}