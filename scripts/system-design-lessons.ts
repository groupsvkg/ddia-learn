import type { LessonSection } from "../src/types/content";
import { rw, app, code, seq, sys, TS } from "./lesson-snippets";
import {
  collaborationEstimates,
  multiplayerEstimates,
  multistepFormEstimates,
  multistepWorkflowEstimates,
  puzzleEstimates,
  reservationEstimates,
  votingEstimates,
  whatsappEstimates,
  youtubeEstimates,
} from "./capacity-estimates";
import {
  collaborationStack,
  foundationsStack,
  multiplayerStack,
  multistepFormStack,
  multistepWorkflowStack,
  puzzleStack,
  reservationStack,
  votingStack,
  whatsappStack,
  youtubeStack,
} from "./tech-choices";

type L = Omit<LessonSection, "media"> & { media?: LessonSection["media"] };

function L(
  id: string,
  chapterId: string,
  title: string,
  summary: string,
  keyTakeaways: string[],
  body: LessonSection["body"],
  relatedConcepts: string[],
): L {
  return { id, chapterId, title, summary, keyTakeaways, body, relatedConcepts, media: {} };
}

export const systemDesignLessons: L[] = [
  // ── Foundations ──────────────────────────────────────────────────────────
  L(
    "approaching-system-design",
    "sd-foundations",
    "How to Approach System Design",
    "Start with users and constraints — not databases. Clarify functional needs, non-functional targets, and what you can defer.",
    [
      "Separate functional requirements (what) from non-functional ones (how well).",
      "Identify actors: mobile clients, admins, third-party integrations, batch jobs.",
      "Sketch read vs write ratio, consistency needs, and acceptable downtime.",
      "Defer deep dives until the happy path and failure modes are clear.",
      "Name concrete products (YouTube, WhatsApp) to anchor estimations and trade-offs.",
      "Interview and production design both reward structured thinking over memorized diagrams.",
    ],
    [
      {
        type: "paragraph",
        text: "System design is the practice of mapping product requirements to components that store, move, and transform data. The same DDIA concepts — replication, partitioning, streams — appear in every case study; the skill is knowing which ones matter for each problem.",
      },
      { type: "heading", text: "A repeatable framework", level: 2 },
      {
        type: "list",
        items: [
          "Clarify scope: MVP vs full product, geography, scale today vs in 12 months.",
          "Functional requirements: core user journeys in plain language.",
          "Non-functional: latency targets, durability, consistency, cost, compliance.",
          "High-level diagram: clients → API → services → data stores → async pipelines.",
          "Deep dives: bottlenecks, failure modes, scaling levers.",
          "Trade-offs: what you optimize for and what you explicitly sacrifice.",
        ],
      },
      rw("Stripe's design reviews start with the user promise ('charge once, never double-charge') before picking Postgres vs DynamoDB. Netflix capacity plans assume regional failure. The framework is universal; the storage engines change."),
      app("Airbnb", "Before sharding listings search, the team nailed booking invariants: a night cannot be sold twice, payments must match reservations, and cancellations must release inventory. Those constraints drove PostgreSQL transactions and Kafka outbox patterns."),
      sys("system-modern-stack", "Typical SaaS components and how data flows between specialized stores."),
      code("Requirements checklist as types", TS.systemDesignChecklist),
      seq("seq-foundations-request", "End-to-end request path: CDN for static assets, API through cache to database."),
      ...foundationsStack(),
    ],
    ["requirements", "non-functional", "trade-offs", "scope", "failure modes", "CDN", "PostgreSQL", "Redis", "Kafka"],
  ),

  L(
    "capacity-estimation",
    "sd-foundations",
    "Back-of-the-Envelope Estimation",
    "Rough numbers prevent impossible architectures. Estimate QPS, storage, bandwidth, and cache size before you draw shards.",
    [
      "Convert daily active users into peak requests per second with a burst factor.",
      "Storage = records × average object size × replication factor × retention.",
      "Video and images dominate bandwidth — metadata is usually smaller.",
      "1 day of write volume often fits in RAM; plan for 30–90 days on disk.",
      "Estimates justify CDN, batch transcoding, and read replicas early.",
      "Google, Meta, and AWS whitepapers all start with napkin math.",
    ],
    [
      {
        type: "paragraph",
        text: "You do not need exact numbers. Order-of-magnitude checks catch designs that cannot work: serving 4K video from a single Postgres row, or indexing every WhatsApp message in Elasticsearch in real time.",
      },
      { type: "heading", text: "Worked example: short-video app", level: 2 },
      {
        type: "list",
        items: [
          "50M DAU, each watches 20 videos/day → 1B views/day ≈ 12k views/s average.",
          "Peak ≈ 5× average → ~60k read QPS for metadata; bytes served mostly from CDN.",
          "100k uploads/day, 50 MB average raw → 5 TB/day ingest; keep hot in object storage.",
          "Metadata row ~2 KB × 500M videos → ~1 TB before indexes and replicas.",
        ],
      },
      rw("YouTube and TikTok napkin math drove separate upload paths (write-heavy) from feed reads (CDN-heavy). WhatsApp optimized for small text payloads and connection fan-in, not storage per message."),
      code("Peak QPS from DAU", TS.capacityEstimation),
      sys("system-youtube", "Upload bandwidth and transcode queues dominate write path; CDN serves reads."),
    ],
    ["estimation", "QPS", "storage", "bandwidth", "CDN"],
  ),

  L(
    "core-tradeoffs",
    "sd-foundations",
    "Latency, Throughput, and Consistency",
    "Every system design picks a point on the latency–throughput–consistency triangle. Name your choice explicitly.",
    [
      "Strong consistency simplifies application logic but adds coordination latency.",
      "Eventual consistency scales reads but requires idempotency and conflict handling.",
      "Tail latency (p99) matters more than averages for interactive products.",
      "Async pipelines improve throughput at the cost of visible lag.",
      "CAP is a reminder to plan for partitions — not a menu with three equal options.",
      "DDIA Part II concepts map directly to these product-level decisions.",
    ],
    [
      {
        type: "paragraph",
        text: "A reservation system needs linearizable inventory decrements. A YouTube view counter can be approximate. A voting system needs auditability stronger than either. The 'right' consistency level is domain-specific.",
      },
      { type: "callout", title: "Pick your guarantees", text: "Write down what must never happen (double booking, duplicate vote) before choosing databases. The invariant picks the consistency model.", variant: "tip" },
      rw("Instagram tolerates slightly stale like counts (approximate aggregation) but not duplicate posts on retry (idempotent write IDs). Google Spanner pays latency for global consistency where ads billing requires it."),
      app("WhatsApp", "Message ordering within a chat is strict; global search across chats is weaker or absent. The product promise determines per-feature consistency."),
      code("Read-your-writes vs eventual feed", TS.readYourOwnWrites),
    ],
    ["consistency", "latency", "throughput", "CAP", "idempotency"],
  ),

  // ── YouTube ──────────────────────────────────────────────────────────────
  L(
    "youtube-requirements",
    "sd-youtube",
    "Requirements and Constraints",
    "YouTube must ingest massive files, serve globally with low startup latency, and recommend the next clip — all profitably.",
    [
      "Upload: resumable, durable, survive client crashes mid-transfer.",
      "Processing: transcode to many resolutions and codecs (ABR ladder).",
      "Delivery: edge caching; adaptive bitrate for variable networks.",
      "Metadata: title, channel, stats, comments — OLTP with heavy read caching.",
      "Recommendations: batch + stream features; personalization is derived data.",
      "Copyright and moderation pipelines are async consumers of upload events.",
    ],
    [
      {
        type: "paragraph",
        text: "Video is the bulk of bytes; metadata is the bulk of queries. Treating them as one system fails — upload and transcode are write pipelines, playback is a CDN problem, home feed is a ranking problem.",
      },
      rw("YouTube stores originals in durable object storage (GCS-style), serves via Google's CDN, and keeps metadata in sharded databases. Creators see processing state; viewers see p95 startup time under a few seconds on good networks."),
      app("YouTube", "A 2 GB upload cannot block a synchronous API thread. Resumable uploads land in object storage; a job queue fans out transcoding workers that write HLS/DASH segments back to the bucket."),
      sys(
        "system-youtube",
        "Two paths share Object Storage and Metadata DB. Write path (top): numbered steps ①–⑦ from multipart upload through Kafka transcode to READY status. Read path (bottom): metadata from API/DB, video segments from CDN with origin fallback on cache miss.",
      ),
      seq("seq-youtube-upload", "Time-ordered upload flow from creator through object storage to async transcoding."),
      ...youtubeStack(),
    ],
    ["video", "upload", "CDN", "transcoding", "metadata", "S3", "Kafka"],
  ),

  L(
    "youtube-architecture",
    "sd-youtube",
    "Upload, Transcode, and Serve",
    "The write path is a pipeline; the read path is cache-heavy. Connect them with immutable video IDs and versioned manifests.",
    [
      "Resumable uploads (tus/S3 multipart) buffer network unreliability.",
      "Transcoding is embarrassingly parallel — one job per resolution per video.",
      "Manifest files (M3U8) list segment URLs; players switch bitrate dynamically.",
      "CDN caches segments close to users; origin shield reduces object storage load.",
      "Thumbnails and titles are tiny compared to video — cache aggressively.",
      "Kafka or Pub/Sub notifies subscribers when processing completes.",
    ],
    [
      { type: "heading", text: "Write path", level: 2 },
      {
        type: "list",
        items: [
          "Client → upload API → object storage (raw).",
          "Event → transcoder fleet → object storage (segments + manifests).",
          "Metadata service marks video READY and exposes playback URL.",
        ],
      },
      { type: "heading", text: "Read path", level: 2 },
      {
        type: "list",
        items: [
          "Client requests manifest from API (cached).",
          "Player fetches segments from CDN edge; miss goes to origin.",
          "View counts batched to stream processor (approximate is OK).",
        ],
      },
      code("Upload job enqueue", TS.youtubeUploadPipeline),
      sys(
        "system-youtube",
        "Write path fans out transcoding via Kafka; read path never touches raw uploads — viewers hit Metadata API for manifests and CDN for HLS segments.",
      ),
      seq("seq-youtube-playback", "Viewer fetches metadata, then manifest and segments from CDN with origin fallback."),
    ],
    ["HLS", "transcoding", "object storage", "Kafka", "manifest", "CDN"],
  ),

  L(
    "youtube-scaling",
    "sd-youtube",
    "Caching, Popularity, and Cost",
    "Virality shifts traffic from long-tail to hot objects. Design caching and storage tiers for both.",
    [
      "Long-tail videos: CDN still helps, but most bytes sit cold in cheap storage.",
      "Viral videos: push to more edge POPs; protect origin with shield tiers.",
      "Popular metadata (trending page) needs application-level cache + singleflight.",
      "Recommendation features precomputed offline; online path does light reranking.",
      "Cost control: transcode once, store lifecycle policies for unwatched uploads.",
      "Multi-region metadata replicas with sticky routing for editors.",
    ],
    [
      {
        type: "paragraph",
        text: "A video with 10 views and one with 10M views share the same architecture but wildly different cache hit ratios. Popularity-aware prefetch and tiered storage prevent paying CDN prices for cold content.",
      },
      rw("Netflix Open Connect caches hot titles on ISP appliances. YouTube's long tail lives in cheaper storage classes; only trending manifests get aggressive edge warming."),
      app("Google", "Search ranking and YouTube recommendations share DNA: offline batch features + online low-latency scoring. The serving path never scans raw watch history per request."),
      code("Singleflight for trending metadata", TS.trendingCacheSingleflight),
      ...youtubeEstimates(),
    ],
    ["CDN", "cache", "long tail", "recommendations", "cost", "QPS", "bandwidth"],
  ),

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  L(
    "whatsapp-requirements",
    "sd-whatsapp",
    "Messaging Requirements",
    "Billions of users expect near-instant delivery, offline support, and privacy — on unreliable mobile networks.",
    [
      "Delivery semantics: at-least-once with client-side deduplication by message ID.",
      "Ordering: per-chat sequence numbers, not global total order.",
      "Offline users: store-and-forward plus push notifications (APNs/FCM).",
      "Groups fan out one write to many recipients — hotspot risk.",
      "E2E encryption: servers route ciphertext; metadata still visible.",
      "Low payload size favors custom protocols over verbose JSON.",
    ],
    [
      {
        type: "paragraph",
        text: "Chat apps are connection-heavy. A user with one WebSocket can receive thousands of messages per day; the hard part is routing each message to the right connection set with minimal latency.",
      },
      sys("system-whatsapp", "WebSocket routing, durable store, and push gateway for offline receivers."),
      seq("seq-whatsapp-message", "Message send, persist, online delivery, or push notification when offline."),
      rw("WhatsApp famously runs Erlang/BEAM for massive connection counts. Message IDs are client-generated UUIDs so retries do not duplicate chats. Signal protocol handles E2E on devices."),
      app("WhatsApp", "When the receiver is offline, the server persists ciphertext and triggers APNs/FCM. On reconnect, the client syncs from its last acked sequence — no message loss without unbounded server memory."),
      ...whatsappStack(),
    ],
    ["messaging", "WebSocket", "push", "E2E encryption", "ordering", "Redis", "Cassandra"],
  ),

  L(
    "whatsapp-delivery",
    "sd-whatsapp",
    "Delivery, Ordering, and Groups",
    "Per-chat ordering, presence, and group fan-out define the server-side data model.",
    [
      "Each chat has a monotonic server or hybrid logical clock for ordering.",
      "Acks from clients let servers trim durable queues.",
      "Group messages: write once, fan out to member inboxes or connection maps.",
      "Large groups may use partial fan-out + pull on open (hybrid like Meta feeds).",
      "Presence (online/typing) is ephemeral — Redis with TTL, not Postgres.",
      "Multi-device sync shares the same message log keyed by account.",
    ],
    [
      { type: "heading", text: "Group fan-out strategies", level: 2 },
      {
        type: "list",
        items: [
          "Small groups (< 256): push to every member inbox on send.",
          "Large groups: store single copy; members pull on chat open.",
          "Typing indicators: gossip or pub/sub channel, lossy is acceptable.",
        ],
      },
      code("Per-chat sequence and ack", TS.whatsappSequence),
      sys("system-whatsapp", "Online WebSocket delivery; offline path through push + sync."),
      ...whatsappEstimates(),
    ],
    ["fan-out", "sequence", "groups", "presence", "Redis", "QPS", "connections"],
  ),

  // ── Reservation ──────────────────────────────────────────────────────────
  L(
    "reservation-requirements",
    "sd-reservation",
    "Booking Requirements",
    "Hotels, flights, restaurants, and concerts sell finite inventory that must never be oversold.",
    [
      "Search is read-heavy and fuzzy; booking is write-heavy and exact.",
      "Holds: temporary locks while user pays (10–15 minute TTL).",
      "Payments tie to reservations — sagas coordinate both.",
      "Cancellations and modifications release inventory back to the pool.",
      "Calendar queries need efficient range indexes on availability.",
      "Time zones and daylight saving complicate 'night' inventory.",
    ],
    [
      {
        type: "paragraph",
        text: "Reservation systems are classic OLTP with brutal correctness requirements. A double-booked hotel room destroys trust faster than a slow search page.",
      },
      app("Airbnb", "Guests search Elasticsearch-backed listings but commit bookings through a transactional core that decrements night-level inventory in PostgreSQL with row-level locks or serializable isolation."),
      sys("system-reservation", "Elasticsearch for search; PostgreSQL inventory as source of truth."),
      ...reservationStack(),
    ],
    ["booking", "inventory", "OLTP", "search", "holds", "Elasticsearch", "Stripe"],
  ),

  L(
    "reservation-concurrency",
    "sd-reservation",
    "Preventing Double Booking",
    "Use database constraints, compare-and-swap, or dedicated inventory services — never 'check then insert' without locking.",
    [
      "Pessimistic locking (SELECT FOR UPDATE) on inventory rows is simple and strong.",
      "Optimistic concurrency with version columns works when conflicts are rare.",
      "Distributed locks (Redis Redlock) only if DB row is unavailable — know the risks.",
      "Hold tokens expire via TTL job to release abandoned carts.",
      "Idempotent booking API keys prevent duplicate charges on retry.",
      "Outbox pattern publishes booking events after commit.",
    ],
    [
      {
        type: "paragraph",
        text: "Two users booking the last seat is a race. The fix is atomic decrement: one transaction wins, the other gets a clear 'sold out' error — not two confirmations.",
      },
      code("Atomic inventory decrement", TS.reservationLock),
      seq("seq-reservation-failure", "When payment fails, the saga releases the inventory hold before returning an error."),
      rw("OpenTable and Ticketmaster use inventory partitions per venue/show time. Airbnb shards booking writes by listing ID. All share: single writer per inventory cell at commit time."),
      { type: "callout", title: "Hold vs confirm", text: "A hold reserves inventory temporarily; confirm converts hold to sale after payment. Never confirm without checking hold ownership.", variant: "warning" },
    ],
    ["locking", "serializable", "idempotency", "hold", "outbox"],
  ),

  L(
    "reservation-architecture",
    "sd-reservation",
    "End-to-End Booking Flow",
    "Search, hold, pay, confirm — orchestrated with sagas and clear compensation if payment fails.",
    [
      "API gateway routes search to read services, booking to write service.",
      "Hold service writes to inventory DB; payment service calls Stripe.",
      "On payment success: confirm hold; on failure: release hold (compensating action).",
      "Kafka events update search index and send confirmation emails async.",
      "Read replicas serve 'my trips'; primary handles commits.",
      "Admin overrides need audit log separate from user-facing booking row.",
    ],
    [
      sys("system-reservation", "Labeled service interactions: search, hold, Stripe charge, Kafka events."),
      seq("seq-reservation-booking", "Happy-path sequence from hold through payment to confirmed booking."),
      code("Booking saga with compensation", TS.bookingSaga),
      rw("Expedia and Booking.com pipelines mirror this: Elasticsearch for discovery, PostgreSQL for reservations, Stripe/Adyen for payments, Temporal or custom sagas for multi-step checkout."),
      ...reservationEstimates(),
    ],
    ["saga", "Stripe", "Elasticsearch", "PostgreSQL", "compensation", "Kafka", "API gateway", "QPS"],
  ),

  // ── Voting ───────────────────────────────────────────────────────────────
  L(
    "voting-requirements",
    "sd-voting",
    "Integrity and Trust",
    "Voting systems must prevent duplicate ballots, resist tampering, and survive traffic spikes on election night.",
    [
      "One voter → one ballot: unique constraint on (election_id, voter_id).",
      "Ballots should be append-only; tallies derived, not edited in place.",
      "Secret ballot vs verifiability is a product/legal trade-off.",
      "Rate limiting and bot detection at the edge.",
      "Audit logs: who cast when (metadata), not necessarily how they voted.",
      "Read scaling for results pages; write spike at poll close.",
    ],
    [
      {
        type: "paragraph",
        text: "Unlike likes on a post, votes are legally and socially sensitive. The architecture must make certain attacks impossible (double vote) and others detectable (ballot box stuffing at scale).",
      },
      { type: "callout", title: "Threat model first", text: "Define adversaries: duplicate voter, admin tampering, DDoS, network partition during close. Each drives different controls.", variant: "warning" },
      rw("Estonia's i-Voting uses cryptographic protocols; US precinct systems often air-gap tallies. Product web polls (Twitter, Slack) use idempotent voter keys and Redis rate limits — weaker but appropriate for low stakes."),
    ],
    ["integrity", "audit", "rate limiting", "append-only", "threat model"],
  ),

  L(
    "voting-architecture",
    "sd-voting",
    "Ballots, Tallies, and Audits",
    "Append ballots to an immutable log; aggregate counts in stream processors or materialized views.",
    [
      "Ballot ingest API validates voter eligibility once, writes immutable record.",
      "Hash chain or signed events support third-party audit (high-stakes systems).",
      "Tally service aggregates by choice_id; real-time preview uses stream processor.",
      "Results page reads materialized count — never COUNT(*) on raw ballots live.",
      "Idempotency-Key per voter session prevents double submit on retry.",
      "Geo-distributed read replicas for results; single-region write primary for consistency.",
    ],
    [
      sys("system-voting", "Ballot API, append-only log, stream aggregator, and cached results."),
      seq("seq-voting-ballot", "Idempotent vote submission and async tally update to results cache."),
      code("Idempotent ballot submission", TS.votingBallot),
      app("Slack", "Workspace polls are low-stakes but still use one-vote-per-user keys stored in OLTP with unique indexes — the same pattern at national scale with harder identity proofing."),
      ...votingStack(),
      ...votingEstimates(),
    ],
    ["ballot", "tally", "Kafka", "idempotency", "materialized view", "Redis", "peak QPS"],
  ),

  // ── Multiplayer games ────────────────────────────────────────────────────
  L(
    "multiplayer-requirements",
    "sd-multiplayer-games",
    "Latency and Fairness",
    "FPS and battle royale players feel 50 ms; turn-based tolerates seconds. Pick transport and authority model accordingly.",
    [
      "Sub-100 ms RTT often requires regional servers and UDP-based protocols.",
      "Authoritative server prevents most cheating; client prediction hides latency.",
      "Tick rate (20–128 Hz) trades CPU for smoothness.",
      "Matchmaking groups similar skill and low ping — data problem + queue system.",
      "Disconnect/reconnect must restore state from server snapshot.",
      "Anti-cheat inspects impossible state transitions server-side.",
    ],
    [
      {
        type: "paragraph",
        text: "Games are distributed systems with humans in the loop. Fairness means everyone sees a consistent world; responsiveness means hiding network delay with prediction and reconciliation.",
      },
      rw("Riot Games deploys regional shards (NA, EUW) with dedicated UDP servers. Among Us uses simpler authoritative state with lower tick demands. Protocol choice follows latency budget."),
    ],
    ["latency", "UDP", "authoritative server", "matchmaking", "tick rate"],
  ),

  L(
    "multiplayer-architecture",
    "sd-multiplayer-games",
    "Game Servers and State Sync",
    "Dedicated simulation loop owns truth; clients send inputs, receive state deltas.",
    [
      "Lobby service assigns players to a game server instance.",
      "Server sim loop: inputs in → physics/rules → state snapshot out.",
      "Delta compression sends only changed entities to clients.",
      "Redis or in-memory store for session; periodic checkpoint to DB for stats.",
      "Dedicated servers vs P2P: commercial titles choose servers for anti-cheat.",
      "Agones on Kubernetes scales game server pods per match.",
    ],
    [
      sys("system-multiplayer", "Matchmaker, Agones/K8s game pods, and UDP state sync."),
      seq("seq-multiplayer-match", "Queue to matchmaker, pod allocation, then UDP connect to game server."),
      seq("seq-multiplayer-tick", "Clients send inputs; server simulates and broadcasts state deltas."),
      code("Authoritative tick with input buffer", TS.gameServerTick),
      app("Fortnite", "Epic runs regional game server fleets; matchmaking minimizes RTT. Client sends inputs; server corrects position if client prediction diverges."),
      ...multiplayerStack(),
    ],
    ["game server", "delta compression", "Agones", "Kubernetes", "prediction", "UDP", "Kafka"],
  ),

  L(
    "multiplayer-scaling",
    "sd-multiplayer-games",
    "Sharding and Matchmaking",
    "Scale horizontally by adding game server processes; matchmaking is the control plane.",
    [
      "Each match is an isolated process — natural parallelism boundary.",
      "Matchmaking queues partition by mode/region/rank.",
      "Backpressure when server pool full: queue wait UX vs degraded bots.",
      "Cross-region play only when product accepts high ping.",
      "Telemetry pipeline (Kafka) feeds ranking and crash analytics.",
      "Stateful sets or Agones allocate UDP ports per pod.",
    ],
    [
      rw("Call of Duty warzone spins thousands of single-match processes across cloud VMs. Control plane tracks capacity; data plane is ephemeral per round."),
      code("Regional matchmaking queue", TS.matchmakingQueue),
      ...multiplayerEstimates(),
    ],
    ["sharding", "matchmaking", "Agones", "regional", "telemetry", "UDP", "bandwidth"],
  ),

  // ── Puzzle games ─────────────────────────────────────────────────────────
  L(
    "puzzle-turn-model",
    "sd-puzzle-games",
    "Turns, Timers, and Async Play",
    "Wordle, chess, and daily puzzles mix turn order, deadlines, and optional async moves.",
    [
      "Turn state machine: WAITING → ACTIVE → COMPLETED per player.",
      "Server validates moves against rules before applying to board.",
      "Timers use scheduled jobs (SQS delay, Redis TTL) to forfeit on timeout.",
      "Async mode: push notification when opponent moves.",
      "Daily puzzles: same seed globally; validate once per user per day.",
      "Smaller payloads than FPS — HTTPS and WebSocket both fine.",
    ],
    [
      {
        type: "paragraph",
        text: "Puzzle games stress correctness over microseconds. A illegal word guess must be rejected; a daily puzzle must not accept two submissions from the same account.",
      },
      app("Wordle", "One puzzle ID per calendar day, stored as immutable answer hash. Client submits guess; server returns tile feedback without leaking future answers."),
      code("Daily puzzle idempotency", TS.dailyPuzzleSubmit),
    ],
    ["turn-based", "state machine", "timer", "daily puzzle", "validation"],
  ),

  L(
    "puzzle-conflicts",
    "sd-puzzle-games",
    "Merging Moves and Leaderboards",
    "Concurrent edits to shared boards need versioning; leaderboards need approximate top-K at scale.",
    [
      "Board state version increments on each valid move; stale versions rejected.",
      "Shared puzzles (collaborative crosswords) may use CRDT grids for cells.",
      "Leaderboards: Redis sorted sets for real-time; batch reconcile for seasons.",
      "Anti-cheat: server-side dictionary and move legality only.",
      "Spectator mode reads immutable move log — same pattern as event sourcing.",
      "Tie-breakers defined upfront (time, fewer hints).",
    ],
    [
      sys("system-puzzle", "Move log, versioned board, and Redis leaderboard aggregation."),
      seq("seq-puzzle-turn", "Validated move with optimistic locking, event log, and score update."),
      code("Optimistic board version check", TS.puzzleBoardVersion),
      rw("Chess.com stores PGN move logs; lichess uses similar event-sourced game records. NYT Games leaderboard uses precomputed daily ranks to avoid scanning all players at read time."),
      ...puzzleStack(),
      ...puzzleEstimates(),
    ],
    ["leaderboard", "versioning", "Redis", "event sourcing", "CRDT", "PostgreSQL", "QPS"],
  ),

  // ── Multistep systems ────────────────────────────────────────────────────
  L(
    "multistep-patterns",
    "sd-multistep-systems",
    "Sagas and Orchestration",
    "Long-running flows span services. Sagas coordinate forward steps and compensating rollbacks.",
    [
      "Choreography: each service emits events; others react (loose coupling).",
      "Orchestration: central workflow engine calls services in order (clear visibility).",
      "Each step idempotent; correlation ID ties the saga together.",
      "Compensating transactions undo prior steps (cancel shipment, refund hold).",
      "Timeouts trigger automatic compensation or human escalation.",
      "Shopify checkout and Uber trip lifecycle are canonical sagas.",
    ],
    [
      {
        type: "paragraph",
        text: "A multistep checkout is not one database transaction — payment, inventory, shipping, and email span systems. Sagas make partial failure explicit instead of hoping for the best.",
      },
      code("Saga step with compensation", TS.bookingSaga),
      sys("system-multistep-workflow", "Orchestrator coordinates inventory, payments, and shipping services."),
      seq("seq-workflow-saga", "Forward saga steps from cart to shipment with durable orchestration."),
      seq("seq-workflow-compensate", "Payment failure triggers compensating release of inventory hold."),
      rw("Temporal, AWS Step Functions, and Cadence power durable workflows at Uber, Netflix, and Stripe. Kafka-only choreography works until you need a human-readable workflow graph."),
      ...multistepWorkflowStack(),
    ],
    ["saga", "orchestration", "choreography", "Temporal", "compensation", "Kafka"],
  ),

  L(
    "multistep-durability",
    "sd-multistep-systems",
    "Durable Execution and Retries",
    "Workflow state must survive process crashes. Durable timers and replayable history are the answer.",
    [
      "Workflow engine persists event history before calling external APIs.",
      "Activities retry with exponential backoff; non-retryable errors branch to compensate.",
      "Exactly-once illusion via idempotent activity implementations.",
      "Human tasks (KYC review) park workflow for days without holding threads.",
      "Visibility APIs show ops which step failed and with what payload.",
      "Version workflows carefully — running instances use old definition.",
    ],
    [
      app("Uber", "A trip saga spans matching, driver en route, payment capture, and receipt email. Temporal replays from history if the worker crashes mid-step."),
      code("Durable workflow stub", TS.durableWorkflow),
      { type: "callout", title: "Outbox + inbox", text: "Combine sagas with transactional outbox so 'charge card' and 'mark order paid' never diverge.", variant: "tip" },
    ],
    ["Temporal", "durable execution", "retry", "idempotency", "outbox"],
  ),

  L(
    "multistep-examples",
    "sd-multistep-systems",
    "Real-World Workflow Stacks",
    "Compare how production companies implement the same pattern with different engines.",
    [
      "E-commerce checkout: cart → hold inventory → charge → fulfill → notify.",
      "Onboarding KYC: upload ID → vendor verify → manual review → activate.",
      "Loan origination: apply → credit pull → underwrite → fund → servicer handoff.",
      "Each step is a service boundary; workflow engine is the spine.",
      "Observability: trace ID per saga instance across all HTTP and queue hops.",
      "Dead-letter queues capture poison steps without losing the saga context.",
    ],
    [
      rw("Stripe Checkout is a hosted multistep UI over PaymentIntents sagas. Airbnb host onboarding chains identity, payout, and listing steps with manual gates. Banks use Camunda or custom mainframes with the same state-machine thinking."),
      sys("system-multistep-workflow", "Checkout saga: payment success continues; failure triggers inventory release."),
      ...multistepWorkflowEstimates(),
    ],
    ["checkout", "KYC", "workflow", "observability", "DLQ", "saga QPS"],
  ),

  // ── Collaboration ────────────────────────────────────────────────────────
  L(
    "collaboration-presence",
    "sd-collaboration",
    "Presence and Permissions",
    "See who is online, what they are editing, and whether they may change it — without leaking document content.",
    [
      "Presence heartbeats in Redis with TTL; disconnect clears avatar.",
      "Document ACLs: owner, editor, commenter, viewer enforced on every op.",
      "Cursors and selections are ephemeral broadcast, not durable history.",
      "Share links map tokens to roles with expiration.",
      "Audit log records permission changes, not every keystroke.",
      "Google Docs 'anonymous animals' are presence UX on top of WebSocket fan-out.",
    ],
    [
      {
        type: "paragraph",
        text: "Collaboration tools combine real-time transport with authorization. A user without edit permission must not apply operations even if they bypass the UI.",
      },
      rw("Figma stores file permissions in Postgres; presence in Redis. Notion blocks embed share settings per page tree. All validate ops server-side against ACL snapshot."),
      code("Presence heartbeat", TS.collaborationPresence),
    ],
    ["presence", "ACL", "Redis", "permissions", "WebSocket"],
  ),

  L(
    "collaboration-sync",
    "sd-collaboration",
    "OT, CRDTs, and Conflict-Free Editing",
    "Concurrent edits merge without a single global lock. OT needs a server; CRDTs can peer-sync.",
    [
      "Operational Transformation: server transforms concurrent ops against each other.",
      "CRDTs: mathematically merge without central coordinator (Yjs, Automerge).",
      "Choose OT for rich text with complex intent; CRDTs for JSON/tree structures.",
      "Periodic snapshots bound replay time on reconnect.",
      "Comment threads attach to stable anchors (block IDs), not byte offsets.",
      "Offline edit queues flush on reconnect with merge.",
    ],
    [
      sys("system-canva", "WebSocket collab server, Postgres metadata, S3 assets, Redis presence."),
      seq("seq-collaboration-edit", "Edit operation broadcast and optional persistence to Postgres."),
      app("Figma", "Multiplayer editing uses a central server to order operations and broadcast deltas. CRDT research powers newer whiteboard features with less server coupling."),
      code("Yjs-style document update", TS.crdtUpdate),
    ],
    ["OT", "CRDT", "Yjs", "Figma", "offline sync"],
  ),

  L(
    "collaboration-architecture",
    "sd-collaboration",
    "Storage and Real-Time Transport",
    "Split blob storage, metadata DB, collab server, and CDN for assets.",
    [
      "Object storage (S3) for images/fonts; Postgres for doc metadata and ACL.",
      "Collab server cluster sticky by document ID for OT ordering.",
      "WebSocket gateway scales with connection count; Redis pub/sub bridges regions.",
      "Export/render jobs async — separate from live editing path.",
      "Version history: snapshot + op log compaction weekly.",
      "Same architecture pattern as Canva, Google Docs, Notion — different CRDT/OT choices.",
    ],
    [
      sys("system-canva", "Clients ↔ collab server ↔ Postgres metadata + S3 assets + Redis presence."),
      rw("Google Docs historically used centralized OT servers at scale. Notion shards documents across cells; Miro uses regional collab routers for EU data residency."),
      ...collaborationStack(),
      ...collaborationEstimates(),
    ],
    ["WebSocket", "S3", "PostgreSQL", "snapshot", "compaction", "Redis", "CRDT", "ops/s"],
  ),

  // ── Multistep forms ──────────────────────────────────────────────────────
  L(
    "forms-state-machine",
    "sd-multistep-forms",
    "Steps, Drafts, and Validation",
    "Wizards span sessions and devices. Persist partial progress; validate per step and on submit.",
    [
      "Explicit step graph: some steps skippable based on prior answers.",
      "Draft record keyed by user + form version; autosave debounced.",
      "Server-side validation authoritative — client hints are UX only.",
      "Schema versioning: in-flight drafts pinned to form version they started.",
      "Resume token in email link maps to draft without exposing PII in URL.",
      "Final submit is idempotent — duplicate clicks do not create two applications.",
    ],
    [
      {
        type: "paragraph",
        text: "Mortgage and insurance forms take days. Users expect to pause on mobile and finish on desktop. That requires durable draft storage, not session cookies.",
      },
      code("Multistep draft autosave", TS.multistepFormDraft),
      app("Stripe", "Connect onboarding is a hosted multistep form with saved progress — merchants resume KYC without re-entering verified fields."),
    ],
    ["wizard", "draft", "validation", "state machine", "autosave"],
  ),

  L(
    "forms-architecture",
    "sd-multistep-forms",
    "Backend for Long-Running Applications",
    "API design for partial saves, file uploads, and async verification steps.",
    [
      "POST /drafts upserts JSON blob; PATCH /steps/:id validates slice only.",
      "Large uploads direct-to-S3 with signed URLs; draft stores pointer.",
      "Async steps (credit check) transition draft to PENDING_VERIFICATION.",
      "Webhook or poll updates UI when vendor returns.",
      "PII encrypted at rest; field-level encryption for SSN/tax IDs.",
      "Analytics on funnel drop-off per step drives product iteration.",
    ],
    [
      sys("system-multistep-form", "Draft API, Postgres, S3 uploads, and async vendor verification."),
      seq("seq-form-autosave", "Autosave draft, direct S3 upload, submit, and webhook-driven approval."),
      rw("TurboTax and government visa portals use identical patterns: session-less drafts in DB, step validators as pure functions, async steps wired to mainframe or vendor APIs."),
      code("Step validation handler", TS.formStepValidation),
      ...multistepFormStack(),
      ...multistepFormEstimates(),
    ],
    ["draft API", "S3", "webhook", "PII", "funnel analytics", "PostgreSQL", "autosave QPS"],
  ),
];