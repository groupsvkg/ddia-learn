/** Mermaid source definitions for architecture (flowchart) and sequence diagrams. */

export const MERMAID_ARCH: Record<string, string> = {
  "system-modern-stack": `flowchart TB
    Clients["Clients<br/>web + mobile"]
    PG[(PostgreSQL)]
    Redis[(Redis)]
    ES[(Elasticsearch)]
    Kafka[[Kafka]]
    SF[(Snowflake)]

    subgraph syncPath ["Synchronous request path"]
      direction LR
      CDN["CDN + Reverse Proxy<br/>Cloudflare / nginx"]
      API["API Services<br/>Docker / K8s"]
      Clients -->|"① HTTPS"| CDN
      CDN -->|"② REST/gRPC"| API
      API -->|"③ OLTP read/write"| PG
      API -->|"④ cache hot keys"| Redis
      API -->|"⑤ search query"| ES
    end

    API -->|"⑥ publish events"| Kafka
    Kafka -.->|"⑦ ETL / CDC"| SF
    Kafka -.->|"⑧ index sync"| ES`,

  "system-youtube": `flowchart TB
    Creator["Creator app"]
    Viewer["Viewer app"]
    S3[("Object Storage<br/>S3 / GCS")]
    MetaDB[("Metadata DB<br/>PostgreSQL")]

    subgraph writePath ["Write path — upload and transcode"]
      direction LR
      UploadAPI["Upload API<br/>resumable multipart"]
      Kafka[[Kafka<br/>video.uploaded]]
      Transcoder["Transcoder fleet<br/>FFmpeg workers"]
      Creator -->|"① upload chunks"| UploadAPI
      UploadAPI -->|"② PUT raw video"| S3
      UploadAPI -->|"③ INSERT status=PROCESSING"| MetaDB
      UploadAPI -->|"④ publish event"| Kafka
      Kafka -->|"⑤ transcode job"| Transcoder
      Transcoder -->|"⑥ read raw / write HLS"| S3
      Transcoder -->|"⑦ UPDATE status=READY"| MetaDB
    end

    subgraph readPath ["Read path — metadata and playback"]
      direction LR
      MetaAPI["Metadata API<br/>Redis cache"]
      CDN["CDN Edge<br/>CloudFront / Akamai"]
      Viewer -->|"① GET /videos/:id"| MetaAPI
      MetaAPI -->|"② SELECT title, manifest URL"| MetaDB
      Viewer -->|"③ GET .m3u8 + .ts segments"| CDN
      CDN -.->|"cache miss → origin"| S3
    end`,

  "system-whatsapp": `flowchart TB
    Sender["Sender app"]
    Receiver["Receiver app"]
    Store[("Message Store<br/>replicated")]
    Redis[("Redis<br/>presence + typing")]

    subgraph sendPath ["Send path — persist message"]
      direction LR
      Server["Chat Server<br/>Erlang/BEAM"]
      Sender -->|"① WebSocket SEND"| Server
      Server -->|"② append seq=N"| Store
      Server -->|"③ update presence"| Redis
    end

    subgraph deliverPath ["Delivery path — online or offline"]
      direction LR
      Push["Push Gateway<br/>APNs / FCM"]
      Server -->|"④a online: WebSocket PUSH"| Receiver
      Server -.->|"④b offline: notify"| Push
      Push -.->|"⑤ push alert"| Receiver
      Receiver -->|"⑥ ACK seq"| Server
    end`,

  "system-reservation": `flowchart TB
    Guest["Guest app"]
    Inv[("Inventory DB<br/>PostgreSQL")]
    ES[("Elasticsearch<br/>listings index")]
    Redis[("Redis<br/>hot listing cache")]

    subgraph readPath ["Read path — search and browse"]
      direction LR
      SearchAPI["Search API"]
      Guest -->|"① browse / filter"| SearchAPI
      SearchAPI -->|"② query index"| ES
      SearchAPI -.->|"③ cache hit"| Redis
      Guest -->|"④ GET listing detail"| SearchAPI
    end

    subgraph writePath ["Write path — hold, pay, confirm"]
      direction LR
      BookAPI["Booking API"]
      Stripe["Stripe"]
      Kafka[[Kafka]]
      Guest -->|"⑤ POST /hold"| BookAPI
      BookAPI -->|"⑥ lock slot"| Inv
      Guest -->|"⑦ POST /confirm"| BookAPI
      BookAPI -->|"⑧ charge card"| Stripe
      BookAPI -->|"⑨ confirm → COMMIT"| Inv
      BookAPI -->|"⑩ booking.confirmed"| Kafka
      Kafka -.->|"⑪ async index update"| ES
    end`,

  "system-voting": `flowchart TB
    Voter["Voter app"]
    Log[("Ballot Log<br/>append-only")]
    Results[("Results Cache<br/>Redis")]
    Agg["Stream Aggregator"]

    subgraph writePath ["Write path — cast ballot (append-only)"]
      direction LR
      API["Ballot API<br/>idempotent"]
      Voter -->|"① POST + Idempotency-Key"| API
      API -->|"② INSERT ballot"| Log
      API -->|"③ ballot.cast event"| Agg
    end

    subgraph readPath ["Read path — live totals (never COUNT on log)"]
      direction LR
      Agg -->|"④ INCR choice_count"| Results
      Voter -->|"⑤ GET /results"| Results
    end`,

  "system-multiplayer": `flowchart TB
    PA["Player A"]
    PB["Player B"]
    Redis[("Redis<br/>match queue")]
    Kafka[[Kafka<br/>telemetry]]

    subgraph controlPlane ["Control plane — matchmaking"]
      direction LR
      MM["Matchmaker"]
      K8s["Agones / K8s"]
      PA -->|"① enqueue ticket"| MM
      PB -->|"① enqueue ticket"| MM
      MM -->|"② skill + region bucket"| Redis
      MM -->|"③ allocate pod"| K8s
      MM -->|"④ return host:port"| PA
      MM -->|"④ return host:port"| PB
    end

    subgraph dataPlane ["Data plane — live match (UDP, in-memory)"]
      direction LR
      GS["Game Server<br/>60 Hz tick"]
      K8s --> GS
      PA <-->|"⑤ input / state delta"| GS
      PB <-->|"⑤ input / state delta"| GS
      GS -.->|"⑥ fire-and-forget events"| Kafka
    end`,

  "system-puzzle": `flowchart TB
    Player["Player app"]
    API["Game API<br/>validate rules"]
    Board[("Board DB<br/>versioned")]
    Log[("Move Log<br/>event sourced")]
    Redis[("Redis ZSET<br/>leaderboard")]

    subgraph playPath ["Play path — validate and persist move"]
      direction LR
      Player -->|"① POST /move"| API
      API -->|"② UPDATE WHERE version=N"| Board
      API -->|"③ append move event"| Log
    end

    subgraph scorePath ["Score path — leaderboard and timers"]
      direction LR
      Timer["Scheduler<br/>forfeit on timeout"]
      API -->|"④ ZADD score"| Redis
      Timer -.->|"⑤ trigger forfeit"| API
      Player -.->|"⑥ GET top-100"| Redis
    end`,

  "system-multistep-workflow": `flowchart TB
    Client["Client"]
    Inv["Inventory svc"]
    Pay["Payments<br/>Stripe"]
    Ship["Shipping svc"]

    subgraph forwardPath ["Forward saga — happy path"]
      direction LR
      Orch["Orchestrator<br/>Temporal"]
      Client -->|"① start checkout"| Orch
      Orch -->|"② reserve stock"| Inv
      Orch -->|"③ capture payment"| Pay
      Orch -->|"④ create shipment"| Ship
      Orch -->|"⑤ order complete"| Client
    end

    Pay -.->|"FAILED"| Orch
    Orch -.->|"⑥ compensate: release hold"| Inv`,

  "system-canva": `flowchart TB
    UA["User A<br/>browser"]
    UB["User B<br/>browser"]
    PG[("PostgreSQL<br/>metadata + ACL")]
    S3[("S3 / GCS<br/>assets")]
    Redis[("Redis<br/>presence")]
    WS["Collab Server<br/>WebSocket + OT/CRDT"]

    subgraph realtimePath ["Real-time path — live editing"]
      direction LR
      UA <-->|"① send/receive ops"| WS
      UB <-->|"② send/receive ops"| WS
      WS -->|"③ heartbeat + cursors"| Redis
    end

    WS -->|"④ persist ops + snapshots"| PG
    WS -->|"⑤ asset metadata"| S3
    UA -.->|"⑥ signed URL upload"| S3`,

  "system-multistep-form": `flowchart TB
    User["Applicant"]
    API["Draft API"]
    PG[("Postgres<br/>draft JSON")]
    S3[("S3<br/>documents")]

    subgraph syncPath ["Synchronous path — autosave while editing"]
      direction LR
      User -->|"① PATCH /draft every 30s"| API
      API -->|"② UPSERT JSON"| PG
      User -->|"③ PUT via signed URL"| S3
    end

    subgraph asyncPath ["Async path — submit and verify"]
      direction LR
      Vendor["Verify API<br/>KYC / credit"]
      User -->|"④ POST /submit"| API
      API -->|"⑤ start verification"| Vendor
      Vendor -.->|"⑥ webhook result"| API
      API -->|"⑦ status = APPROVED"| PG
    end`,

  "system-airbnb": `flowchart TB
    Client["Mobile / Web"]
    GW["API Gateway<br/>Envoy / nginx"]
    Listings[Listings svc]
    Bookings[Bookings svc]
    Payments[Payments svc]
    Search[Search svc]
    PG[(PostgreSQL)]
    Redis[(Redis)]
    Kafka[[Kafka]]
    ES[(Elasticsearch)]
    Client --> GW
    GW --> Listings & Bookings & Payments & Search
    Bookings --> PG
    Listings --> Redis
    Bookings --> Kafka
    Kafka -.-> ES
    Search --> ES`,

  "system-google-search": `flowchart LR
    Crawler[Crawler]
    GFS[("GFS / S3")]
    MR[MapReduce]
    Index[("Index")]
    Query[Query svc]
    User[User]
    Crawler --> GFS --> MR --> Index
    User -->|query| Query
    Query --> Index`,

  "system-meta-feed": `flowchart TB
    Post[User posts]
    DB[("Post DB<br/>sharded")]
    Fanout["Fan-out Service"]
    C1[("Feed Cache<br/>Redis")]
    C2[("Feed Cache")]
    C3[("Feed Cache")]
    Post --> DB --> Fanout
    Fanout --> C1 & C2 & C3`,
};

export const MERMAID_SEQ: Record<string, string> = {
  "seq-foundations-request": `sequenceDiagram
    participant C as Client
    participant CDN as CDN
    participant API as API
    participant R as Redis
    participant DB as Postgres
    C->>CDN: GET /static
    CDN-->>C: cached assets
    C->>API: GET /api/resource
    API->>R: GET cache key
    R-->>API: miss
    API->>DB: SELECT rows
    DB-->>API: rows
    API->>R: SETEX result
    API-->>C: 200 JSON`,

  "seq-youtube-upload": `sequenceDiagram
    participant Cr as Creator
    participant Up as Upload API
    participant S3 as Object Store
    participant K as Kafka
    participant W as Transcoder
    Cr->>Up: POST /uploads (multipart)
    Up->>S3: PUT raw chunks
    S3-->>Up: ETag
    Up->>K: video.uploaded event
    Up-->>Cr: 201 videoId
    Note over K,W: async workers
    K->>W: consume job
    W->>S3: read raw / write HLS
    W->>K: video.ready event`,

  "seq-youtube-playback": `sequenceDiagram
    participant V as Viewer
    participant API as Metadata API
    participant CDN as CDN Edge
    participant O as Origin
    V->>API: GET /videos/:id
    API-->>V: manifest URL + title
    V->>CDN: GET playlist.m3u8
    CDN-->>V: bitrate ladder
    V->>CDN: GET segment-004.ts
    Note over CDN,O: cache miss
    CDN->>O: fetch segment
    CDN-->>V: video bytes`,

  "seq-whatsapp-message": `sequenceDiagram
    participant S as Sender
    participant Srv as Chat Server
    participant St as Message Store
    participant R as Receiver
    participant P as APNs/FCM
    S->>Srv: SEND msg (WebSocket)
    Srv->>St: append seq=N
    St-->>Srv: ACK
    Srv-->>S: delivered ✓
    alt receiver online
      Srv->>R: PUSH msg (WebSocket)
      R->>Srv: ACK seq=N
    else receiver offline
      Srv->>P: notify
      P->>R: push alert
    end`,

  "seq-reservation-booking": `sequenceDiagram
    participant G as Guest
    participant API as Booking API
    participant Inv as Inventory DB
    participant St as Stripe
    participant K as Kafka
    G->>API: POST /holds
    API->>Inv: BEGIN txn, lock slot
    Inv-->>API: holdId
    API-->>G: hold expires 15m
    G->>API: POST /confirm + Idempotency-Key
    API->>St: charge
    St-->>API: paymentId
    API->>Inv: confirm hold and COMMIT
    API->>K: booking.confirmed
    API-->>G: 201 confirmed`,

  "seq-reservation-failure": `sequenceDiagram
    participant G as Guest
    participant API as Booking API
    participant Inv as Inventory DB
    participant St as Stripe
    G->>API: POST /confirm
    API->>St: charge
    St-->>API: card_declined
    API->>Inv: release hold (compensate)
    Inv-->>API: slot available
    API-->>G: 402 retry payment`,

  "seq-voting-ballot": `sequenceDiagram
    participant V as Voter
    participant API as Ballot API
    participant DB as Ballot Log
    participant Agg as Aggregator
    participant C as Results Cache
    V->>API: POST /ballots + Idempotency-Key
    API->>DB: INSERT ON CONFLICT DO NOTHING
    DB-->>API: ballotId
    API->>Agg: ballot.cast event
    API-->>V: 201 accepted
    Note over Agg,C: async tally
    Agg->>C: INCR choice_count
    V->>C: GET /results
    C-->>V: live totals`,

  "seq-multiplayer-match": `sequenceDiagram
    participant P as Player
    participant MM as Matchmaker
    participant K8s as Agones/K8s
    participant GS as Game Server
    P->>MM: enqueue(ticket)
    Note over MM: skill + region bucket
    MM->>K8s: allocate pod
    K8s-->>MM: host:port
    MM-->>P: match found
    P->>GS: CONNECT UDP
    GS-->>P: world snapshot`,

  "seq-multiplayer-tick": `sequenceDiagram
    participant A as Player A
    participant S as Game Server
    participant B as Player B
    A->>S: INPUT tick=42 (UDP)
    B->>S: INPUT tick=42 (UDP)
    Note over S: simulate physics @ 60 Hz
    S->>A: STATE delta tick=42
    S->>B: STATE delta tick=42
    A->>S: ACK tick=42`,

  "seq-puzzle-turn": `sequenceDiagram
    participant P as Player
    participant API as Game API
    participant B as Board DB
    participant L as Move Log
    participant R as Redis
    P->>API: POST /move v=7
    API->>B: UPDATE board WHERE version=7
    B-->>API: 1 row (ok)
    API->>L: append move event
    API->>R: ZADD score
    API-->>P: 200 new board`,

  "seq-workflow-saga": `sequenceDiagram
    participant C as Client
    participant O as Orchestrator
    participant I as Inventory
    participant P as Payments
    participant S as Shipping
    C->>O: start checkout
    O->>I: reserve stock
    I-->>O: holdId
    O->>P: capture payment
    P-->>O: chargeId
    O->>S: create shipment
    S-->>O: trackingId
    O-->>C: order complete`,

  "seq-workflow-compensate": `sequenceDiagram
    participant O as Orchestrator
    participant I as Inventory
    participant P as Payments
    O->>I: reserve stock
    I-->>O: holdId
    O->>P: capture payment
    P-->>O: FAILED
    O->>I: release hold (compensate)
    I-->>O: stock restored`,

  "seq-collaboration-edit": `sequenceDiagram
    participant A as User A
    participant WS as Collab Server
    participant B as User B
    participant DB as Postgres
    A->>WS: WS connect + auth
    B->>WS: WS connect + auth
    A->>WS: OP insert('hello')
    WS->>DB: persist op
    WS->>B: BROADCAST op
    B->>WS: ACK
    B->>WS: OP cursor move
    WS->>A: presence update`,

  "seq-form-autosave": `sequenceDiagram
    participant U as Applicant
    participant API as Draft API
    participant DB as Postgres
    participant S3 as S3
    participant V as Verify API
    U->>API: PATCH /draft step=2
    API->>DB: UPSERT draft JSON
    API-->>U: 204 saved
    U->>S3: PUT doc.pdf (signed URL)
    U->>API: POST /submit
    API->>V: start verification
    API-->>U: 202 pending
    V->>API: webhook: verified
    API->>DB: status=APPROVED`,
};

/** DDIA technical concept diagrams */
export const MERMAID_TECH: Record<string, string> = {
  "fault-tree": `flowchart TB
    SF[System Failure]
    HW[Hardware]
    SW[Software]
    HU[Human]
    SF --> HW & SW & HU
    HW --> D1[Disk crash] & D2[Power loss] & D3[Network partition]
    SW --> S1[Logic bugs] & S2[Memory leaks] & S3[Cascades]
    HU --> H1[Config typo] & H2[Bad deploy] & H3[Expired cert]`,

  "latency-percentiles": `flowchart LR
    subgraph percentiles ["Response time ms"]
      P50["p50: 45ms"]
      P95["p95: 120ms"]
      P99["p99: 480ms"]
      MAX["max: 2100ms"]
    end
    AVG["avg: 80ms"]
    note["p99 is 6× average — optimize tail latency"]
    P50 ~~~ P95 ~~~ P99 ~~~ MAX`,

  "leader-follower": `flowchart LR
    Client[Client]
    Leader[(Leader<br/>writes)]
    F1[(Follower 1)]
    F2[(Follower 2)]
    Client -->|write| Leader
    Leader -->|replicate log| F1 & F2
    Client -->|read| F1
    Client -->|read| F2`,

  "replication-lag": `sequenceDiagram
    participant C as Client
    participant L as Leader
    participant F as Follower
    C->>L: WRITE x=1
    L-->>C: ACK (immediate)
    C->>F: READ x
    Note over F: lag 2s
    F-->>C: x=0 stale`,

  "hash-partitioning": `flowchart LR
    K1[key: user_A] -->|hash % 4 = 0| P0[P0]
    K2[key: user_B] -->|hash % 4 = 2| P2[P2]
    K3[key: user_C] -->|hash % 4 = 1| P1[P1]
    K4[key: user_D] -->|hash % 4 = 3| P3[P3]`,

  "quorum-read-write": `flowchart TB
    subgraph cluster ["N=3 replicas"]
      N1[(Node 1)]
      N2[(Node 2)]
      N3[(Node 3)]
    end
    W["W=2 write quorum"]
    R["R=2 read quorum"]
    Client[Client] --> W --> N1 & N2
    Client --> R --> N2 & N3
    note["R + W > N → overlap on at least one node"]`,

  "isolation-levels": `flowchart TB
    RC[Read Committed]
    RR[Repeatable Read]
    SER[Serializable]
    RC -->|prevents dirty read| RC
    RR -->|prevents non-repeatable read| RR
    SER -->|prevents phantom read| SER
    note["Stronger isolation → less concurrency"]`,

  "two-phase-commit": `sequenceDiagram
    participant C as Coordinator
    participant P1 as Participant 1
    participant P2 as Participant 2
    C->>P1: PREPARE
    C->>P2: PREPARE
    P1-->>C: READY
    P2-->>C: READY
    C->>P1: COMMIT
    C->>P2: COMMIT`,

  "mapreduce-pipeline": `flowchart LR
    Input[("Input files<br/>HDFS/S3")]
    Map[Map workers]
    Shuffle[Shuffle by key]
    Reduce[Reduce workers]
    Output[("Output")]
    Input --> Map --> Shuffle --> Reduce --> Output`,

  "event-stream": `flowchart LR
    P1[Producer A]
    P2[Producer B]
    Log[["Partitioned log<br/>Kafka"]]
    G1["Consumer group 1"]
    G2["Consumer group 2"]
    P1 & P2 -->|append| Log
    Log --> G1 & G2`,
};

export function resolveMermaid(
  diagramId: string,
): { source: string; kind: "architecture" | "sequence" | "diagram" } | null {
  if (MERMAID_SEQ[diagramId]) {
    return { source: MERMAID_SEQ[diagramId], kind: "sequence" };
  }
  if (MERMAID_ARCH[diagramId]) {
    return { source: MERMAID_ARCH[diagramId], kind: "architecture" };
  }
  if (MERMAID_TECH[diagramId]) {
    return { source: MERMAID_TECH[diagramId], kind: "diagram" };
  }
  return null;
}