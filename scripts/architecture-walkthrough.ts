import type { ContentBlock } from "../src/types/content";
import { sys } from "./lesson-snippets";

type WalkthroughSection = { title: string; steps: string[] };

type Walkthrough = {
  caption: string;
  sections: WalkthroughSection[];
};

export const ARCHITECTURE_WALKTHROUGHS: Record<string, Walkthrough> = {
  "system-modern-stack": {
    caption:
      "Typical SaaS stack: synchronous request path through CDN and API to specialized stores; async path via Kafka for derived data.",
    sections: [
      {
        title: "Synchronous request path",
        steps: [
          "① HTTPS — Browser or mobile client hits the CDN / reverse proxy (TLS termination, DDoS shield).",
          "② REST/gRPC — Proxy forwards API calls to stateless application pods behind the load balancer.",
          "③ OLTP read/write — API reads and writes authoritative rows in PostgreSQL (orders, accounts, inventory).",
          "④ Cache hot keys — Sessions, rate counters, and hot reads go through Redis with TTL.",
          "⑤ Search query — Full-text and facet queries hit Elasticsearch, not a table scan on Postgres.",
        ],
      },
      {
        title: "Async derived-data path (dashed arrows)",
        steps: [
          "⑥ Publish events — After a successful commit, the API appends a domain event to Kafka (outbox pattern).",
          "⑦ ETL / CDC — Stream consumers copy changes into Snowflake for analytics and BI dashboards.",
          "⑧ Index sync — Search index updates from the same event log — never dual-write to ES and Postgres in one request.",
        ],
      },
    ],
  },

  "system-youtube": {
    caption:
      "YouTube splits write (upload + transcode) and read (metadata + CDN playback). Object Storage and Metadata DB are shared between both paths.",
    sections: [
      {
        title: "Write path — upload and transcode",
        steps: [
          "① Upload chunks — Creator sends resumable multipart uploads; API never buffers the full file in RAM.",
          "② PUT raw video — Upload API streams bytes directly to Object Storage (S3/GCS).",
          "③ INSERT status=PROCESSING — Metadata DB row created so creators see upload received, not yet playable.",
          "④ Publish event — video.uploaded event to Kafka; upload HTTP response returns immediately.",
          "⑤ Transcode job — FFmpeg worker consumes the event from the queue.",
          "⑥ Read raw / write HLS — Worker reads original, writes adaptive bitrate segments back to Object Storage.",
          "⑦ UPDATE status=READY — Metadata row updated; manifest URL becomes valid for viewers.",
        ],
      },
      {
        title: "Read path — metadata and playback",
        steps: [
          "① GET /videos/:id — Viewer requests title, channel, and manifest URL from Metadata API.",
          "② SELECT title, manifest URL — API reads Postgres; hot rows cached in Redis.",
          "③ GET .m3u8 + .ts segments — Player fetches HLS manifest and video segments from CDN edge.",
          "Cache miss → origin — CDN pulls segment from Object Storage on miss; viral content stays at the edge.",
        ],
      },
    ],
  },

  "system-whatsapp": {
    caption:
      "WhatsApp persists every message once, then delivers online via WebSocket or offline via push — same store, two routes.",
    sections: [
      {
        title: "Send path — persist message",
        steps: [
          "① WebSocket SEND — Sender posts ciphertext over an open connection; payload stays small (no JSON bloat).",
          "② Append seq=N — Chat server assigns a monotonic sequence number and appends to the replicated message store.",
          "③ Update presence — Sender marked online in Redis with TTL; typing indicators use the same channel.",
        ],
      },
      {
        title: "Delivery path — online or offline",
        steps: [
          "④a Online: WebSocket PUSH — If receiver is connected, server pushes the message on their socket immediately.",
          "④b Offline: notify — If receiver is disconnected, server triggers APNs/FCM instead of holding sockets open.",
          "⑤ Push alert — Mobile OS shows notification; message ciphertext waits in the durable store.",
          "⑥ ACK seq — Receiver acknowledges; server trims delivered messages from the hot queue.",
        ],
      },
    ],
  },

  "system-reservation": {
    caption:
      "Reservations split fuzzy search (Elasticsearch) from exact booking (PostgreSQL + Stripe). Kafka updates the index after commit.",
    sections: [
      {
        title: "Read path — search and browse",
        steps: [
          "① Browse / filter — Guest runs date, price, and location filters against the Search API.",
          "② Query index — Search API queries Elasticsearch inverted index — never scans inventory rows.",
          "③ Cache hit — Hot listing cards served from Redis when the same queries repeat.",
          "④ GET listing detail — Guest opens a listing page; photos and description from search index or cache.",
        ],
      },
      {
        title: "Write path — hold, pay, confirm",
        steps: [
          "⑤ POST /hold — Guest reserves a slot; Booking API starts a short transaction.",
          "⑥ Lock slot — Inventory row locked in PostgreSQL (SELECT FOR UPDATE or serializable isolation).",
          "⑦ POST /confirm — Guest submits payment with Idempotency-Key to prevent double charge on retry.",
          "⑧ Charge card — Booking API calls Stripe; payment success required before confirm.",
          "⑨ Confirm → COMMIT — Hold converted to sale in one atomic transaction.",
          "⑩ booking.confirmed — Event published to Kafka after commit (outbox pattern).",
          "⑪ Async index update — Consumer updates Elasticsearch availability — derived data, not dual-write.",
        ],
      },
    ],
  },

  "system-voting": {
    caption:
      "Votes are append-only writes; live totals are pre-aggregated in Redis — never COUNT(*) on the ballot table at read time.",
    sections: [
      {
        title: "Write path — cast ballot",
        steps: [
          "① POST + Idempotency-Key — Voter submits once; retries return the same ballot ID, not a duplicate vote.",
          "② INSERT ballot — Append-only row in ballot log; ballots are never UPDATEd in place.",
          "③ ballot.cast event — Stream aggregator notified asynchronously to update live totals.",
        ],
      },
      {
        title: "Read path — live totals",
        steps: [
          "④ INCR choice_count — Aggregator increments precomputed counts in Redis on each ballot event.",
          "⑤ GET /results — Results page reads materialized totals from cache — O(1) per choice, not a table scan.",
        ],
      },
    ],
  },

  "system-multiplayer": {
    caption:
      "Matchmaking is the control plane (HTTP/Redis/K8s); live gameplay is the data plane (UDP, in-memory, no Postgres per tick).",
    sections: [
      {
        title: "Control plane — matchmaking",
        steps: [
          "① Enqueue ticket — Each player submits skill rating and region preference to the matchmaker.",
          "② Skill + region bucket — Matchmaker groups compatible players in Redis sorted sets.",
          "③ Allocate pod — Agones/Kubernetes spins up or assigns a dedicated game server pod.",
          "④ Return host:port — Players receive UDP endpoint; RTT kept low by regional placement.",
        ],
      },
      {
        title: "Data plane — live match",
        steps: [
          "⑤ Input / state delta — Clients send inputs at 20–128 Hz; server broadcasts compressed state deltas.",
          "⑥ Fire-and-forget events — Telemetry (kills, crashes) streams to Kafka without blocking the tick loop.",
        ],
      },
    ],
  },

  "system-puzzle": {
    caption:
      "Puzzle games validate moves against versioned board state, append to a move log, and rank players in Redis — not SQL ORDER BY.",
    sections: [
      {
        title: "Play path — validate and persist",
        steps: [
          "① POST /move — Player submits a move; server is authoritative, not the client.",
          "② UPDATE WHERE version=N — Optimistic lock on board row; stale version rejected with 409 Conflict.",
          "③ Append move event — Immutable move log supports replay, spectators, and audit.",
        ],
      },
      {
        title: "Score path — leaderboard and timers",
        steps: [
          "④ ZADD score — Redis sorted set updated on valid move; top-100 is O(log N + 100).",
          "⑤ Trigger forfeit — Scheduler fires when turn timer expires; API applies forfeit rule.",
          "⑥ GET top-100 — Leaderboard reads from Redis, not a full table scan in Postgres.",
        ],
      },
    ],
  },

  "system-multistep-workflow": {
    caption:
      "Checkout saga: orchestrator calls each service in order; payment failure triggers compensating inventory release.",
    sections: [
      {
        title: "Forward saga — happy path",
        steps: [
          "① Start checkout — Client kicks off a durable workflow with a correlation ID.",
          "② Reserve stock — Orchestrator calls inventory service; hold ID returned and persisted in workflow history.",
          "③ Capture payment — Payments service charges card; idempotent on retry with same key.",
          "④ Create shipment — Shipping service creates label only after payment succeeds.",
          "⑤ Order complete — Client notified; workflow marked succeeded in orchestrator history.",
        ],
      },
      {
        title: "Compensation — payment failure",
        steps: [
          "FAILED — Stripe returns card_declined; orchestrator branches to compensate, not retry forever.",
          "⑥ Compensate: release hold — Inventory hold released before error returned to client — no orphaned locks.",
        ],
      },
    ],
  },

  "system-canva": {
    caption:
      "Collaboration: real-time ops through WebSocket; durable state in Postgres and S3; large files bypass the collab server.",
    sections: [
      {
        title: "Real-time path — live editing",
        steps: [
          "① Send/receive ops — User A's edits flow over WebSocket to the collab server (OT or CRDT ordering).",
          "② Send/receive ops — Server broadcasts transformed ops to User B and other connected editors.",
          "③ Heartbeat + cursors — Presence (who is online, cursor position) stored in Redis with TTL.",
        ],
      },
      {
        title: "Persistence path — durable state",
        steps: [
          "④ Persist ops + snapshots — Collab server batches operations into Postgres; periodic snapshots bound replay time.",
          "⑤ Asset metadata — File pointers and ACL metadata in Postgres; blobs are not inlined in rows.",
          "⑥ Signed URL upload — Large images upload direct-to-S3; collab server never proxies multi-MB files.",
        ],
      },
    ],
  },

  "system-multistep-form": {
    caption:
      "Long forms: autosave dominates the sync path; vendor verification runs async over webhooks after submit.",
    sections: [
      {
        title: "Synchronous path — autosave while editing",
        steps: [
          "① PATCH /draft every 30s — Client debounced autosave; dominates write QPS vs final submit.",
          "② UPSERT JSON — Draft API persists partial answers in Postgres keyed by user + form version.",
          "③ PUT via signed URL — Large documents (PDF, scans) upload direct-to-S3; draft stores pointer only.",
        ],
      },
      {
        title: "Async path — submit and verify",
        steps: [
          "④ POST /submit — Idempotent final submit; draft status moves to PENDING_VERIFICATION.",
          "⑤ Start verification — API calls external KYC/credit vendor; HTTP returns 202 immediately.",
          "⑥ Webhook result — Vendor calls back hours later with pass/fail; no long-polling from browser.",
          "⑦ status = APPROVED — Draft row updated; user notified via email or in-app poll.",
        ],
      },
    ],
  },
};

/** Architecture diagram followed by numbered step-by-step bullet explanations. */
export function arch(diagramId: string): ContentBlock[] {
  const walkthrough = ARCHITECTURE_WALKTHROUGHS[diagramId];
  if (!walkthrough) {
    return [sys(diagramId, "")];
  }

  const blocks: ContentBlock[] = [
    sys(diagramId, walkthrough.caption),
    { type: "heading", text: "Step-by-step walkthrough", level: 2 },
  ];

  for (const section of walkthrough.sections) {
    blocks.push({ type: "heading", text: section.title, level: 3 });
    blocks.push({ type: "list", items: section.steps });
  }

  return blocks;
}