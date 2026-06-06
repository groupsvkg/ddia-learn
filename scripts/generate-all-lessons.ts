import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ContentBlock, LessonSection } from "../src/types/content";
import { rw, app, code, dia, sys, TS } from "./lesson-snippets";
import { resolveMermaid } from "./mermaid-diagrams";
import { systemDesignLessons } from "./system-design-lessons";

const root = path.resolve(import.meta.dirname, "..");
const lessonsDir = path.join(root, "content/lessons");

function toMermaidBlocks(body: ContentBlock[]): ContentBlock[] {
  return body.map((block) => {
    if (block.type !== "diagram") return block;
    const resolved = resolveMermaid(block.diagramId);
    if (!resolved) return block;
    return {
      type: "mermaid",
      source: resolved.source,
      kind: resolved.kind,
      caption: block.caption,
    };
  });
}

function migrateLesson(lesson: LessonSection): LessonSection {
  return { ...lesson, body: toMermaidBlocks(lesson.body) };
}

function loadCh01(): Record<string, LessonSection> {
  const files = [
    "ch01-thinking-about-data-systems.json",
    "ch01-reliability.json",
    "ch01-scalability.json",
    "ch01-maintainability.json",
  ];
  const result: Record<string, LessonSection> = {};
  for (const file of files) {
    const lesson = JSON.parse(readFileSync(path.join(lessonsDir, file), "utf8")) as LessonSection;
    result[lesson.id] = migrateLesson(lesson);
  }
  return result;
}

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

const newLessons: L[] = [
  // Chapter 2
  L("relational-vs-document", "ch02-data-models-query-languages", "Relational Model Versus Document Model",
    "The relational and document models represent data differently — and each shines for different access patterns.",
    ["Relational databases normalize data into tables with foreign-key relationships.", "Document databases embed related data together for locality of reference.", "One-to-many and many-to-many relationships are easier in relational schemas.", "Schema flexibility favors documents for rapidly evolving product data.", "Neither model is universally superior — match the model to your query patterns.", "PostgreSQL handles both relational tables and JSONB columns; MongoDB stores BSON documents natively."],
    [{ type: "paragraph", text: "At the heart of every database is a data model: the abstraction it exposes to applications. For decades, the relational model dominated. The rise of web applications brought document databases back into focus, each arguing they better fit modern development." },
     { type: "heading", text: "The Object-Relational Mismatch", level: 2 },
     { type: "paragraph", text: "Object-oriented code thinks in nested structures; relational tables are flat rows. ORMs bridge this gap but introduce impedance mismatch — awkward joins, N+1 queries, and schema migrations that fight your object model." },
     rw("Stripe and GitHub run core workloads on PostgreSQL with strict schemas and migrations. Product catalogs and mobile backends often use MongoDB or DynamoDB where documents map cleanly to JSON APIs. Prisma and Drizzle ORMs target PostgreSQL; Mongoose targets MongoDB — the ORM choice often follows the data model."),
     app("Airbnb", "Listings, guests, and payments live in normalized PostgreSQL tables joined at query time. Canva stores entire design documents — layers, fonts, assets — as nested BSON so the editor loads one record per canvas open."),
     code("Relational joins vs embedded documents", TS.prismaVsMongo),
     { type: "callout", title: "When documents win", text: "If your application mostly reads or writes whole records together (user profile + settings + preferences), embedding in a document avoids joins and maps naturally to JSON APIs.", variant: "tip" },
     { type: "list", items: ["Relational: strong for ad-hoc queries, joins, and enforcing referential integrity.", "Document: strong for hierarchical data, flexible schemas, and horizontal scaling.", "Graph: strong when relationships are the primary query pattern (covered next)."] }],
    ["relational model", "document model", "PostgreSQL", "MongoDB", "normalization", "impedance mismatch"]),

  L("query-languages", "ch02-data-models-query-languages", "Query Languages for Data",
    "Declarative query languages let you describe what you want; the engine figures out how to get it.",
    ["SQL is the canonical declarative language — describe the result, not the algorithm.", "MapReduce expresses batch computation as map and reduce phases over datasets.", "Graph query languages (Cypher, SPARQL) traverse relationships declaratively.", "Imperative code in application layers duplicates logic that belongs in the data layer.", "Choosing a query language constrains which access patterns are efficient.", "GraphQL and gRPC sit above storage engines — they are API layers, not database query languages."],
    [{ type: "paragraph", text: "A query language defines how applications read and transform data. Declarative languages like SQL separate the what from the how: you specify the desired result set, and the query optimizer chooses indexes, join order, and execution plan." },
     { type: "heading", text: "Declarative vs Imperative", level: 2 },
     { type: "paragraph", text: "Imperative code fetches rows and loops in application memory. Declarative queries push work to the database where indexes and statistics enable efficient execution. This separation is why SQL survived decades of hype cycles." },
     rw("PostgreSQL and Snowflake both speak SQL but optimize for different workloads. MongoDB uses its aggregation pipeline ($match, $group) for server-side transforms. Neo4j uses Cypher for graph patterns. In microservices, REST/GraphQL fetch data imperatively in app code — often reimplementing logic the database could handle more efficiently."),
     app("Google", "BigQuery and Snowflake let analysts write declarative SQL while the engine chooses partition pruning, join order, and columnar scans. Google's internal Dremel paper inspired the separation of what from how at warehouse scale."),
     code("Declarative OLAP query", TS.snowflakeQuery),
     { type: "callout", title: "MapReduce", text: "MapReduce brought declarative batch processing to distributed files: map functions extract key-value pairs, shuffle groups by key, reduce aggregates. Modern engines (Spark, Flink) evolved beyond the strict two-phase model.", variant: "info" }],
    ["SQL", "PostgreSQL", "MongoDB", "declarative query", "MapReduce", "query optimizer"]),

  L("graph-like-data-models", "ch02-data-models-query-languages", "Graph-Like Data Models",
    "When connections between entities matter more than the entities themselves, graph models are the natural fit.",
    ["Property graphs store nodes, edges, and properties — ideal for social networks and recommendations.", "Triple-stores represent facts as (subject, predicate, object) for semantic web data.", "Graph traversals replace expensive multi-table joins in relational schemas.", "Cypher and SPARQL express path queries declaratively.", "Graph databases trade specialized traversal for weaker bulk analytics.", "Neo4j and Amazon Neptune power fraud detection and knowledge graphs in production."],
    [{ type: "paragraph", text: "Many domains are inherently connected: social graphs, supply chains, knowledge bases, fraud detection. Representing these as relational tables with join tables works but makes traversal queries verbose and slow." },
     { type: "heading", text: "Property Graphs", level: 2 },
     { type: "paragraph", text: "In a property graph, vertices represent entities and edges represent relationships, both carrying key-value properties. Finding friends-of-friends or shortest paths becomes a native index traversal rather than a recursive SQL query." },
     rw("LinkedIn's early social graph used custom graph storage; today Neo4j, Amazon Neptune, and Azure Cosmos DB (Gremlin API) handle relationship-heavy workloads. Banks use graph queries to trace money-laundering rings across accounts — a multi-hop traversal that would require recursive CTEs in PostgreSQL."),
     app("LinkedIn", "People You May Know and connection suggestions traverse multi-hop paths over billions of edges. A property graph makes friends-of-friends a native index walk instead of a four-table SQL join."),
     code("Graph pattern query (Cypher)", TS.cypherGraph),
     { type: "list", items: ["Cypher (Neo4j): pattern-matching syntax for graph traversal.", "SPARQL: W3C standard for RDF triple-stores.", "Datalog: logic-based queries with recursive rules."] }],
    ["property graph", "Neo4j", "Neptune", "Cypher", "SPARQL", "graph traversal"]),

  // Chapter 3
  L("data-structures", "ch03-storage-and-retrieval", "Data Structures That Power Your Database",
    "Under every database API lies a storage engine choosing between log-structured and B-tree designs.",
    ["Hash indexes suit exact key lookups on memory-resident data.", "SSTables and LSM-trees batch writes into sorted segments for high write throughput.", "B-trees maintain sorted pages on disk for balanced read/write performance.", "LSM-trees trade read amplification for write throughput; B-trees do the opposite.", "Compaction in LSM-trees merges segments in the background.", "RocksDB backs Cassandra and Kafka Streams state; PostgreSQL and MySQL InnoDB use B-trees."],
    [{ type: "paragraph", text: "Storage engines are the library components that databases use to store and retrieve bytes on disk. The two dominant families are log-structured merge (LSM) trees and B-trees — each optimizing for different workloads." },
     { type: "heading", text: "LSM-Trees vs B-Trees", level: 2 },
     { type: "paragraph", text: "B-trees update pages in place — predictable read latency, but random writes can be slow on spinning disks. LSM-trees append writes to a log, then compact sorted segments — excellent write throughput at the cost of occasional read amplification during compaction." },
     { type: "callout", title: "Real-world engines", text: "RocksDB and LevelDB use LSM-trees. PostgreSQL and MySQL InnoDB use B-trees. Choosing an engine is choosing a read/write trade-off.", variant: "info" },
     rw("Cassandra, ScyllaDB, and RocksDB-backed stores favor LSM-trees for high write throughput. PostgreSQL, MySQL InnoDB, and SQL Server use B-tree variants for predictable OLTP reads. Redis keeps everything in memory with hash tables and skip lists — a different trade-off entirely."),
     app("Google", "Bigtable and LevelDB pioneered LSM-trees for Google's indexing and analytics pipelines — append-heavy writes with background compaction. Spanner layers B-tree pages on top of a distributed LSM for OLTP with global consistency."),
     code("LSM append vs B-tree in-place update", TS.lsmVsBtree)],
    ["LSM-tree", "B-tree", "RocksDB", "PostgreSQL", "SSTable", "storage engine", "compaction"]),

  L("transaction-processing-or-analytics", "ch03-storage-and-retrieval", "Transaction Processing or Analytics?",
    "OLTP and OLAP systems optimize for opposite access patterns — and mixing them hurts both.",
    ["OLTP handles many small, fast transactions: inserts, updates, point lookups.", "OLAP runs large aggregation scans over historical data.", "Data warehouses use column-oriented storage and star/snowflake schemas.", "ETL pipelines copy OLTP data into warehouses for analytics.", "Trying to run analytics on OLTP databases overloads production traffic.", "PostgreSQL powers OLTP; Snowflake, BigQuery, and Redshift power OLAP."],
    [{ type: "paragraph", text: "Transaction processing (OLTP) systems power live applications: checkout, account updates, messaging. Analytics (OLAP) systems answer business questions over months of history. Their hardware, schema, and storage layouts diverge completely." },
     { type: "heading", text: "Data Warehousing", level: 2 },
     { type: "paragraph", text: "A data warehouse ingests copies of production data via ETL, denormalizes into star schemas (fact tables surrounded by dimension tables), and optimizes for scan-heavy aggregation — not millisecond point lookups." },
     rw("A Shopify-scale stack might use PostgreSQL or Aurora for live orders, then pipe data through Airbyte or Fivetran into Snowflake or BigQuery for BI dashboards. Running heavy aggregations directly on the production Postgres would starve checkout queries — exactly the anti-pattern DDIA warns about."),
     app("Shopify", "Checkout and inventory run on low-latency OLTP (PostgreSQL/Aurora). Merchant analytics and revenue dashboards query Snowflake star schemas fed by nightly ETL — never the live order database."),
     code("OLTP → warehouse ETL pipeline", TS.olapEtl),
     sys("system-google-search", "OLTP writes to row stores; OLAP reads columnar warehouses — Google-scale search indexing follows the same split.")],
    ["OLTP", "OLAP", "PostgreSQL", "Snowflake", "BigQuery", "data warehouse", "ETL"]),

  L("column-oriented-storage", "ch03-storage-and-retrieval", "Column-Oriented Storage",
    "Column stores excel at analytics by reading only the columns a query needs.",
    ["Row-oriented storage reads entire rows even when you need one column.", "Column-oriented storage stores each column contiguously on disk.", "Column compression is far more effective due to similar values in a column.", "Sort order in column storage enables efficient range scans and merges.", "Materialized views and data cubes pre-aggregate common queries.", "Snowflake, ClickHouse, and Apache Parquet on S3 are column-oriented in production."],
    [{ type: "paragraph", text: "In a row store, all fields of a record sit together — great for fetching a whole user profile. In a column store, all values for a given field sit together — great for SUM(revenue) across millions of rows." },
     rw("Snowflake and ClickHouse store columns separately for analytics queries that touch few fields across billions of rows. Apache Parquet files on AWS S3 use columnar layout for cheap cold storage. PostgreSQL remains row-oriented — which is why you offload analytics to a warehouse instead of scanning production tables."),
     app("Google", "Google's web index and ad analytics read only the columns each query needs — URL, rank, bid price — across petabytes. Columnar Parquet on GCS and BigQuery column stores are the production descendants of this layout."),
     code("Column-pruned warehouse query", TS.snowflakeQuery),
     sys("system-google-search", "Batch indexing and column-oriented storage: read a few fields across billions of rows without touching full records."),
     { type: "list", items: ["Read only columns referenced in SELECT — less I/O.", "Run-length and dictionary encoding compress repetitive column data.", "Vectorized execution processes columns in SIMD-friendly batches."] }],
    ["column store", "Snowflake", "ClickHouse", "Parquet", "column compression", "materialized view"]),

  // Chapter 4
  L("formats-for-encoding", "ch04-encoding-and-evolution", "Formats for Encoding Data",
    "How you encode data determines compatibility, schema evolution, and cross-language interoperability.",
    ["JSON and XML are human-readable but verbose and weakly typed.", "Thrift and Protocol Buffers use tagged field numbers for compact binary encoding.", "Avro requires a schema for reading — enabling compact encoding without field tags.", "Forward and backward compatibility let old and new code coexist during deploys.", "Schema registries manage evolution in production systems.", "REST APIs use JSON; gRPC uses Protobuf; Kafka ecosystems standardize on Avro with Schema Registry."],
    [{ type: "paragraph", text: "Programs in memory represent data as objects and structs. To send data over a network or store it on disk, you must encode it as bytes. The encoding format determines size, speed, and — critically — whether schemas can evolve without breaking consumers." },
     { type: "callout", title: "Compatibility modes", text: "Forward compatibility: old code reads new data. Backward compatibility: new code reads old data. Field tags (Protobuf) and union schemas (Avro) enable both.", variant: "tip" },
     rw("Public REST APIs return JSON with OpenAPI specs. Internal microservices increasingly use gRPC with Protocol Buffers for compact, typed RPC. Kafka pipelines pair Avro schemas with Confluent Schema Registry so producers and consumers evolve independently during rolling deploys on Kubernetes."),
     app("Canva", "Design state syncs over WebSockets with compact binary payloads. Internal services use Protocol Buffers so new canvas fields ship without breaking older editor builds — forward compatibility via tagged field numbers."),
     code("Protocol Buffers encoding", TS.protobufEncode),
     sys("system-canva", "Real-time collaboration requires compact encoding and schema evolution as the editor adds new layer types.")],
    ["JSON", "Protocol Buffers", "Avro", "gRPC", "schema evolution", "serialization"]),

  L("modes-of-dataflow", "ch04-encoding-and-evolution", "Modes of Dataflow",
    "Data moves between processes via databases, service calls, and message queues — each with different trade-offs.",
    ["Database-as-mediator: processes write and read shared tables asynchronously.", "REST and RPC: synchronous request/response between services.", "Message queues: asynchronous, buffered delivery with at-least-once semantics.", "Event-driven architectures decouple producers and consumers in time.", "The encoding format must be agreed upon across all participants.", "nginx/Envoy reverse proxies front gRPC services; Kafka and SQS carry async events."],
    [{ type: "paragraph", text: "When one process needs to share data with another, the dataflow pattern matters. Writing to a shared database is the oldest integration pattern. RPC calls offer synchronous coupling. Message queues add buffering and decouple availability." },
     rw("A typical AWS microservice stack: services call each other via gRPC behind an Envoy or nginx reverse proxy, share state in PostgreSQL, cache hot reads in Redis, and publish domain events to Kafka or AWS SQS. WebSockets and Server-Sent Events (SSE) push real-time updates to browsers — another dataflow mode for live dashboards and notifications."),
     app("Airbnb", "A booking spans listings, calendar, payments, and notifications — each a separate service. Synchronous gRPC checks availability; Kafka events notify hosts asynchronously when a reservation confirms."),
     code("Synchronous gRPC between services", TS.grpcDataflow),
     sys("system-airbnb", "Transactions and data integration across services: sync RPC for reads, async events for side effects."),
     { type: "list", items: ["Database: simple but creates tight schema coupling.", "REST/RPC: real-time but requires both sides to be available.", "Message queue: resilient to spikes but adds delivery guarantees complexity."] }],
    ["REST", "gRPC", "Kafka", "Redis", "reverse proxy", "WebSocket", "SSE", "message queue"]),

  // Chapter 5
  L("leaders-and-followers", "ch05-replication", "Leaders and Followers",
    "Leader-based replication funnels all writes through one node and copies them to followers.",
    ["One replica is the leader; all writes go to it.", "Followers replicate the leader's write log and serve read traffic.", "Synchronous replication waits for follower ack before confirming writes.", "Asynchronous replication is faster but risks data loss on leader failure.", "New followers bootstrap by copying a snapshot then tailing the log.", "PostgreSQL streaming replication, MySQL primary-replica, and MongoDB replica sets all use this pattern."],
    [{ type: "paragraph", text: "Replication keeps copies of data on multiple machines for fault tolerance and read scaling. The simplest scheme designates one leader that accepts writes and broadcasts changes to follower replicas." },
     dia("leader-follower", "Writes flow to the leader; followers replicate the log and serve reads."),
     rw("PostgreSQL streaming replication sends the WAL from primary to standbys. Amazon RDS Multi-AZ runs synchronous replication within an AZ pair. MongoDB replica sets elect a primary; secondaries tail the oplog. Read replicas on AWS Aurora offload analytics queries from the writer."),
     app("WhatsApp", "Message history replicates from a primary shard to followers so reads scale globally. All writes funnel through the leader; followers tail the WAL to stay consistent without accepting direct writes."),
     code("Write-ahead log replication", TS.walReplication),
     sys("system-whatsapp", "Leader-based replication over unreliable networks: one writer, many read replicas tailing the log.")],
    ["leader", "follower", "PostgreSQL", "MongoDB", "replication log", "synchronous replication"]),

  L("replication-lag", "ch05-replication", "Problems with Replication Lag",
    "Asynchronous followers may lag behind the leader, creating stale reads and subtle consistency bugs.",
    ["Read-your-own-writes: users must see their own recent changes.", "Monotonic reads: users never see time go backward across requests.", "Consistent prefix reads: causal order of writes is preserved.", "Replication lag is normal — applications must explicitly handle it.", "Sticky sessions route a user to one replica to improve consistency.", "Session cookies, Redis-backed sessions, and read-after-write routing fix common lag bugs."],
    [{ type: "paragraph", text: "When followers lag seconds behind the leader, users experience anomalies: posting a comment and not seeing it, or seeing newer data followed by older data. These are not failures — they are consequences of eventual consistency." },
     dia("replication-lag", "A write reaches the leader immediately but followers may serve stale data for seconds."),
     { type: "callout", title: "Fixes", text: "Read from leader after writes, use sticky sessions, or wait for follower catch-up before serving reads.", variant: "tip" },
     rw("After posting a tweet, Twitter routes your next read to the leader or a caught-up replica. E-commerce apps using PostgreSQL read replicas often force read-your-own-writes by querying the primary after checkout. HAProxy or AWS ALB sticky sessions keep a user on one replica for monotonic reads."),
     app("Instagram", "After you post a story, the next feed load must include it — even if replicas lag milliseconds behind. Meta routes post-write reads to the primary or enforces a short read-from-leader window per session."),
     code("Read-your-own-writes routing", TS.readYourOwnWrites),
     sys("system-meta-feed", "Partitioned feed storage with replication lag: writes hit the leader; reads may see stale followers.")],
    ["replication lag", "read-your-own-writes", "monotonic reads", "Redis", "eventual consistency"]),

  L("multi-leader-replication", "ch05-replication", "Multi-Leader Replication",
    "Multiple leaders accept writes in different datacenters — but conflict resolution becomes necessary.",
    ["Each datacenter has a local leader for low-latency writes.", "Leaders replicate to each other asynchronously.", "Concurrent writes to the same record on different leaders create conflicts.", "Conflict resolution: last-write-wins, custom merge, or conflict-free replicated data types.", "Multi-leader suits multi-datacenter deployments with offline tolerance.", "CouchDB, Cassandra multi-DC, and CRDTs in collaborative apps use multi-leader patterns."],
    [{ type: "paragraph", text: "Single-leader replication means cross-datacenter writes traverse WAN latency. Multi-leader allows each site to write locally, then replicate. The cost is write conflicts when two leaders modify the same data concurrently." },
     rw("CouchDB replicates bidirectionally between edge nodes and cloud — ideal for offline-first mobile apps. Cassandra's multi-datacenter replication lets each region write locally. Figma-style collaborative editors use CRDTs so concurrent edits merge without a single leader bottleneck."),
     app("Canva", "Collaborative design editing lets multiple users write concurrently from different regions. CRDTs and operational transforms merge conflicting layer edits without funneling every keystroke through one global leader."),
     code("Real-time collaboration over WebSocket", TS.websocketCanva),
     sys("system-canva", "Multi-leader-style concurrent writes: each client edits locally; merge engine reconciles conflicts in real time.")],
    ["multi-leader", "Cassandra", "CouchDB", "CRDT", "write conflict", "last-write-wins"]),

  L("leaderless-replication", "ch05-replication", "Leaderless Replication",
    "Dynamo-style systems let any replica accept writes and use quorums to detect inconsistency.",
    ["Clients write to multiple replicas in parallel (W replicas).", "Reads contact R replicas and pick the most recent version by version number.", "Quorum condition W + R > N ensures overlap between read and write sets.", "Sloppy quorums and hinted handoff maintain availability during partitions.", "Version vectors detect concurrent writes that need merging.", "Amazon DynamoDB, Cassandra, and Riak follow Dynamo-style quorum design."],
    [{ type: "paragraph", text: "Leaderless replication (pioneered by Dynamo) removes the single-leader bottleneck. Any node can accept writes. On read, the client queries multiple replicas and reconciles versions. Quorum rules balance consistency against availability." },
     dia("quorum-read-write", "With N=3, W=2, R=2: writes and reads overlap on at least one node."),
     rw("Amazon DynamoDB lets you tune W and R per request — R=2, W=2 with N=3 is a common production setting. Apache Cassandra uses tunable consistency (QUORUM, ONE, ALL). During a partition, sloppy quorums and hinted handoff keep writes flowing to healthy nodes."),
     app("Stripe", "Payment session state and idempotency records use Dynamo-style quorum writes so any replica can accept a retry without a single leader bottleneck. Tunable R/W per request trades latency for consistency."),
     code("Quorum read and write", TS.quorumRead)],
    ["quorum", "DynamoDB", "Cassandra", "leaderless", "version vector", "sloppy quorum"]),

  // Chapter 6
  L("partitioning-key-value", "ch06-partitioning", "Partitioning of Key-Value Data",
    "Partitioning splits a dataset across nodes so each machine handles a manageable subset.",
    ["Partitioning by key range assigns contiguous key ranges to nodes — risk of hot spots.", "Hash partitioning distributes keys evenly but loses range-scan efficiency.", "Skewed workloads need composite keys or random suffixes to spread hot keys.", "Partitioning is almost always combined with replication for fault tolerance.", "The partition function is hard to change after deployment.", "Kafka partitions, MongoDB sharded clusters, and DynamoDB partition keys all shard by key."],
    [{ type: "paragraph", text: "A single machine cannot hold all data forever. Partitioning (sharding) divides the key space so each node owns a subset. The partition scheme determines load balance and query efficiency." },
     dia("hash-partitioning", "Each key hashes to one partition index; different keys spread across P0–P3."),
     rw("Kafka topics split into partitions for parallelism — each partition is an ordered log. MongoDB sharding routes documents by shard key through mongos routers. DynamoDB partitions by primary key hash; a hot partition (e.g., celebrity user ID) can throttle the whole table until you add a random suffix."),
     app("Uber", "Trip events partition by ride_id so all state transitions for one trip land on the same Kafka partition — preserving order. Driver location updates hash by geo-cell to spread load across shards."),
     code("Hash partition routing", TS.hashPartition)],
    ["partitioning", "sharding", "Kafka", "MongoDB", "DynamoDB", "hash partitioning", "hot spot"]),

  L("secondary-indexes", "ch06-partitioning", "Partitioning and Secondary Indexes",
    "Secondary indexes on partitioned data require either local indexes per partition or a global index.",
    ["Partitioned by document: each partition maintains its own secondary indexes.", "Partitioned by term: the index itself is partitioned by the indexed value.", "Global indexes enable efficient lookups but add coordination overhead.", "Secondary index queries may scatter-gather across all partitions.", "Index maintenance on writes adds latency to every insert and update.", "Elasticsearch scatter-gather queries and MongoDB compound indexes illustrate the trade-offs."],
    [{ type: "paragraph", text: "Primary key partitioning is straightforward — route by key hash. Secondary indexes (search by email, filter by date) complicate routing because the indexed value may live on a different partition than the record." },
     rw("MongoDB sharded clusters maintain local indexes per shard — a query on an unsharded field must scatter-gather to every shard. Elasticsearch distributes inverted indexes across nodes; a search hits all shards and merges results. PostgreSQL on Citus uses co-location and reference tables to reduce scatter-gather overhead."),
     app("Airbnb", "Search by city or neighborhood hits secondary indexes scattered across listing shards. Each shard returns partial results; the router merges and ranks them — scatter-gather is the cost of partitioning by listing_id."),
     code("Scatter-gather secondary index query", TS.scatterGather)],
    ["secondary index", "Elasticsearch", "MongoDB", "scatter-gather", "global index", "local index"]),

  L("rebalancing", "ch06-partitioning", "Rebalancing Partitions",
    "When nodes join or leave the cluster, partitions must move — without excessive downtime.",
    ["Hash mod N breaks when N changes — most keys remap to new nodes.", "Consistent hashing minimizes key movement when nodes are added or removed.", "Fixed number of partitions with virtual nodes simplifies rebalancing.", "Automatic rebalancing risks cascading failures; manual triggers are safer.", "Rebalancing should move minimal data at bounded throughput.", "Cassandra vnodes, Kafka partition reassignment, and Kubernetes StatefulSet scaling all rebalance data."],
    [{ type: "paragraph", text: "Adding a machine should improve capacity, not invalidate your entire partition map. Naive hash mod N remaps almost every key when N changes. Better schemes use fixed partitions or consistent hashing to limit data movement." },
     rw("Cassandra uses virtual nodes (vnodes) so adding a host only moves a fraction of data. Kafka's kafka-reassign-partitions tool migrates partitions between brokers with throttling. On Kubernetes, scaling a StatefulSet adds pods but your app still needs a safe rebalance plan — automatic resharding without ops oversight has caused production outages."),
     app("Netflix", "Adding Cassandra nodes during peak streaming hours uses consistent hashing with vnodes so only a fraction of keys move — avoiding the full remap disaster of hash mod N."),
     code("Consistent hashing on the ring", TS.consistentHashing)],
    ["rebalancing", "Cassandra", "Kafka", "Kubernetes", "consistent hashing", "virtual node"]),

  L("request-routing", "ch06-partitioning", "Request Routing",
    "Clients must find the right partition for each request — via routing tier, gateway, or aware clients.",
    ["Naive approach: send all requests to a routing tier that forwards to the right node.", "Gateway: stateless proxy that knows the partition map.", "Partition-aware clients cache the routing table and connect directly.", "The partition map must update when rebalancing occurs.", "ZooKeeper, gossip protocols, or config services distribute routing metadata.", "nginx, Envoy, AWS ALB, and MongoDB mongos are production routing layers."],
    [{ type: "paragraph", text: "Given a key, which node owns it? A routing layer answers this question. Centralized gateways are simple but can bottleneck. Smart clients avoid the hop but must handle map updates." },
     rw("MongoDB mongos routers sit between apps and shards, caching the chunk map from the config servers. Kafka clients fetch partition leadership metadata from the broker controller. In Kubernetes, an nginx or Envoy ingress acts as a reverse proxy — routing HTTP/gRPC to the right pod. AWS ALB does the same at the cloud edge, with health checks and cross-AZ failover."),
     app("Twitter/X", "Timeline and user-data requests route through a gateway that caches the partition map. When a shard rebalances, the routing tier updates so clients always hit the node that owns a given user_id."),
     code("Gateway partition routing", TS.routeToPartition)],
    ["request routing", "nginx", "Envoy", "reverse proxy", "mongos", "partition map"]),

  // Chapter 7
  L("slippery-concept", "ch07-transactions", "The Slippery Concept of a Transaction",
    "Transactions group operations into atomic units — but the guarantees vary widely across systems.",
    ["ACID: Atomicity, Consistency, Isolation, Durability — the classic transaction contract.", "Atomicity: all-or-nothing — partial failures roll back.", "Consistency: invariants hold (often enforced by application logic, not the DB).", "Isolation: concurrent transactions do not interfere.", "Durability: committed data survives crashes.", "Single-object vs multi-object transactions have very different costs.", "PostgreSQL and MySQL offer full multi-row ACID; MongoDB added multi-document transactions in v4.0."],
    [{ type: "paragraph", text: "A transaction is a logical unit of work that succeeds or fails as a whole. ACID properties define the promise, but real systems implement them with varying strictness — especially in distributed settings." },
     { type: "callout", title: "Consistency in ACID", text: "Unlike the other three properties, consistency depends on application-defined invariants (e.g., account balance >= 0). The database provides tools; the application defines the rules.", variant: "info" },
     rw("A bank transfer in PostgreSQL wraps debit and credit in BEGIN/COMMIT — both rows update or neither does. Stripe uses idempotency keys with PostgreSQL to make retried API calls safe. MongoDB multi-document transactions work across collections but cost more than single-document atomic writes in DynamoDB."),
     app("Stripe", "A payment capture debits the customer, records the charge, and updates the merchant balance in one PostgreSQL transaction — partial failure rolls back all three writes."),
     code("Multi-step booking transaction", TS.prismaTransaction)],
    ["ACID", "PostgreSQL", "MongoDB", "atomicity", "transaction", "durability"]),

  L("weak-isolation", "ch07-transactions", "Weak Isolation Levels",
    "Most databases default to weak isolation for performance — accepting anomalies most apps never notice.",
    ["Read committed: no dirty reads; each query sees only committed data.", "Snapshot isolation: each transaction sees a consistent point-in-time snapshot.", "Repeatable read prevents non-repeatable reads within a transaction.", "Write skew: two transactions read overlapping data and write disjoint rows.", "Phantoms: new rows appear in a re-executed range query.", "PostgreSQL defaults to READ COMMITTED; SERIALIZABLE uses SSI for stronger guarantees."],
    [{ type: "paragraph", text: "Serial execution of transactions is safe but slow. Weak isolation levels allow concurrency by permitting certain anomalies. Understanding which anomalies your application can tolerate is essential." },
     dia("isolation-levels", "Stronger isolation prevents more anomalies but reduces concurrency."),
     rw("PostgreSQL's default READ COMMITTED is fine for most web apps. Inventory systems prone to write skew might need SERIALIZABLE or explicit row locks (SELECT FOR UPDATE). MySQL InnoDB uses REPEATABLE READ with next-key locking to reduce phantoms — behavior differs from PostgreSQL, so isolation level names are not portable across databases."),
     app("Airbnb", "Double-booking the same listing date is a write-skew anomaly — two guests read available=true concurrently and both commit. Inventory systems need SERIALIZABLE or SELECT FOR UPDATE, not default READ COMMITTED."),
     code("Choosing an isolation level", TS.isolationLevels)],
    ["read committed", "PostgreSQL", "snapshot isolation", "write skew", "phantom read"]),

  L("serializability", "ch07-transactions", "Serializability",
    "The strongest isolation guarantee: transactions execute as if they ran one at a time.",
    ["Actual serial execution: run transactions on a single thread — simple but limited throughput.", "Two-phase locking (2PL): readers and writers acquire locks; risk of deadlocks.", "Serializable Snapshot Isolation (SSI): optimistic detection of conflicts at commit.", "Serializability prevents all anomalies but costs latency and throughput.", "Distributed serializability requires coordination across partitions.", "PostgreSQL SSI, Google Spanner, and CockroachDB target serializable distributed transactions."],
    [{ type: "paragraph", text: "Serializable isolation is the gold standard: the result is identical to some serial execution order. Achieving it without sacrificing all concurrency is one of database engineering's hardest problems." },
     rw("PostgreSQL offers SERIALIZABLE via Serializable Snapshot Isolation (SSI) — good for low-contention workloads. Google Spanner and CockroachDB use TrueTime and distributed consensus for serializable transactions across regions — at the cost of higher write latency. Redis single-threaded execution is effectively serial for one key — which is why simple counters work reliably."),
     app("Google", "Spanner offers externally serializable transactions globally by combining TrueTime timestamps with Paxos replication. Ad auction bidding and financial ledger rows cannot tolerate write skew across regions."),
     code("Serializable Snapshot Isolation", TS.serializableSSI)],
    ["serializability", "PostgreSQL", "Spanner", "CockroachDB", "SSI", "two-phase locking"]),

  // Chapter 8
  L("faults-and-partial-failures", "ch08-trouble-with-distributed-systems", "Faults and Partial Failures",
    "In distributed systems, only part of the system can fail — making failures harder to reason about.",
    ["Single-machine systems fail entirely; distributed systems have partial failures.", "Cloud datacenters have better redundancy than single machines but shared failure domains.", "Supercomputers assume reliable components; cloud systems assume failure is routine.", "You cannot assume a remote node is alive without evidence.", "Design for the case where any node, link, or rack can fail independently.", "Kubernetes pod crashes, AWS AZ outages, and Redis sentinel failover are everyday partial failures."],
    [{ type: "paragraph", text: "On one machine, a crash stops everything — easy to detect. In a distributed system, one node may crash while others continue. A network link may drop while processes on both ends are healthy. This ambiguity makes distributed failure modes uniquely subtle." },
     rw("A Kubernetes cluster might lose one pod while others keep serving traffic — but now load is uneven and downstream caches may be stale. An AWS Availability Zone outage takes out some RDS replicas but not the whole region. Docker containers restart on failure, but that does not replace distributed coordination for data consistency."),
     app("Netflix", "Chaos Monkey deliberately kills instances during business hours to prove partial failures are survivable. A single API pod crash must not corrupt shared state — only reduce capacity until Kubernetes reschedules."),
     code("gRPC deadline on partial failure", TS.grpcTimeout)],
    ["partial failure", "Kubernetes", "AWS", "Docker", "fault tolerance", "failure domain"]),

  L("unreliable-networks", "ch08-trouble-with-distributed-systems", "Unreliable Networks",
    "Network packets get lost, delayed, and reordered — and you often cannot tell which happened.",
    ["TCP provides reliable delivery within a connection but cannot detect peer crashes.", "Timeouts are the only way to detect failure — but choosing the right timeout is hard.", "Network partitions split the cluster into islands that cannot communicate.", "Synchronous networks (e.g., internal datacenter) are more predictable than the public internet.", "You must design for messages that never arrive or arrive twice.", "gRPC deadlines, Envoy retries, and circuit breakers handle unreliable networks in microservices."],
    [{ type: "paragraph", text: "The network is not reliable. Packets drop, switches fail, and congestion causes unbounded delays. Distributed protocols must handle lost messages, duplicate messages, and the inability to distinguish slow responses from dead nodes." },
     { type: "callout", title: "The two generals problem", text: "Two armies must agree to attack simultaneously via messengers who may be captured. Proves that consensus is impossible with unreliable communication.", variant: "warning" },
     rw("gRPC clients set deadlines; Envoy or nginx reverse proxies configure retry policies with backoff. Istio circuit breakers stop hammering a failing service. AWS ALB health checks eject unhealthy targets. Mobile clients on flaky networks must use idempotent APIs (Stripe idempotency keys) because TCP reliability does not survive application-level timeouts."),
     app("Uber", "Driver matching RPCs run over mobile networks with unpredictable latency. gRPC deadlines abort hung calls after 3 seconds; idempotent retries prevent duplicate trip assignments when packets are lost."),
     code("gRPC client deadline", TS.grpcTimeout),
     sys("system-whatsapp", "Unreliable networks between mobile clients and regional datacenters: timeouts, retries, and idempotency are mandatory.")],
    ["network partition", "gRPC", "Envoy", "timeout", "TCP", "circuit breaker"]),

  L("unreliable-clocks", "ch08-trouble-with-distributed-systems", "Unreliable Clocks",
    "Clocks drift, jump backward after NTP sync, and are meaningless across machines without careful use.",
    ["Time-of-day clocks (NTP) synchronize to UTC but can jump backward.", "Monotonic clocks measure elapsed time and never go backward — good for timeouts.", "Clock skew between machines makes event ordering by timestamp unreliable.", "Logical clocks (Lamport, vector clocks) track causality without wall-clock time.", "Never use wall-clock timestamps alone for ordering in distributed systems.", "OpenTelemetry traces, Kafka event time, and Spanner TrueTime handle time carefully."],
    [{ type: "paragraph", text: "Applications use clocks for timeouts, deadlines, and event ordering. But NTP adjustments can jump time backward, quartz drift causes skew, and leap seconds create surprises. Relying on synchronized wall clocks for correctness is dangerous." },
     rw("Docker and Kubernetes nodes sync via NTP but can still drift milliseconds apart — enough to break last-write-wins conflict resolution. Use monotonic clocks (System.nanoTime) for timeouts in Java/Go services. Kafka stream processors distinguish event time from processing time. Google Spanner uses GPS-synchronized TrueTime for globally consistent timestamps — expensive, but instructive."),
     app("Google", "Spanner's TrueTime API exposes uncertainty bounds on wall-clock time so transactions can order commits globally. Most services should use monotonic clocks for timeouts and event-time for stream windows — not NTP for correctness."),
     code("Monotonic vs event time", TS.monotonicClock)],
    ["NTP", "OpenTelemetry", "Kafka", "clock skew", "monotonic clock", "Lamport clock"]),

  L("knowledge-truth-lies", "ch08-trouble-with-distributed-systems", "Knowledge, Truth, and Lies",
    "In a distributed system, nodes operate with incomplete information — and must make decisions anyway.",
    ["The majority quorum defines what is true in leaderless systems.", "Byzantine faults: nodes that deliberately lie or behave arbitrarily.", "System models (crash-stop vs Byzantine) assume different failure modes.", "Fencing tokens prevent stale leaders from corrupting shared resources.", "Truth is agreement among nodes — not an absolute property.", "etcd lease fencing, ZooKeeper ephemeral nodes, and DynamoDB conditional writes enforce safe decisions."],
    [{ type: "paragraph", text: "A node cannot know global system state — it only knows what it has observed. Decisions based on partial knowledge (is the leader dead? did my write succeed?) are inherently uncertain. Protocols define rules for reaching sufficient agreement to act." },
     rw("A stale PostgreSQL primary that was network-partitioned must be fenced before rejoining — otherwise it could accept writes that conflict with the new primary. etcd grants expiring leases so only the current leader holds the lock. DynamoDB conditional writes (attribute_not_exists) prevent lost-update races without a central lock service."),
     app("Shopify", "During a network partition, the old primary must not resume writes after a new leader is elected. Fencing tokens from etcd ensure stale nodes cannot corrupt shared inventory or checkout state."),
     code("Fencing stale leaders", TS.fencingToken)],
    ["Byzantine fault", "etcd", "ZooKeeper", "fencing token", "DynamoDB", "quorum"]),

  // Chapter 9
  L("consistency-guarantees", "ch09-consistency-and-consensus", "Consistency Guarantees",
    "Consistency models define what reads can return after writes — from eventual to linearizable.",
    ["Eventual consistency: replicas converge if no new writes occur.", "Causal consistency preserves cause-and-effect ordering.", "Linearizability: every operation appears instantaneous at some point between start and end.", "Stronger guarantees cost latency and availability during partitions.", "Choose the weakest consistency model that satisfies your application invariants.", "DynamoDB tunable consistency, MongoDB read concerns, and Redis replication illustrate the spectrum."],
    [{ type: "paragraph", text: "When data is replicated, reads may not reflect the latest write. Consistency models formalize what clients can expect. The spectrum runs from eventual (replicas converge eventually) to linearizable (behaves like a single copy)." },
     rw("DynamoDB offers eventual (default) or strong (R+W>N) reads per request. MongoDB readConcern: majority waits for replication to a quorum. Redis async replication means reads from replicas may be stale — many teams read only from the primary for consistency-sensitive data. Caching in Redis amplifies consistency questions: what TTL is acceptable for stale catalog data?"),
     app("Facebook", "News feed tolerates seconds of staleness in Redis cache-aside — a slightly old post order is acceptable. Account balance reads require strong consistency from the primary, not a cached replica."),
     code("Cache-aside with tunable staleness", TS.redisCache)],
    ["eventual consistency", "DynamoDB", "MongoDB", "Redis", "causal consistency", "linearizability"]),

  L("linearizability", "ch09-consistency-and-consensus", "Linearizability",
    "Linearizability makes a replicated system behave as if there were only one copy of the data.",
    ["Every operation appears to take effect atomically at some instant.", "Once a write completes, all subsequent reads see it.", "Compare-and-set and distributed locks require linearizability.", "Implementing linearizability requires coordination — often a single leader.", "The CAP theorem: during a partition, choose consistency or availability.", "etcd, ZooKeeper, and Spanner provide linearizable operations for coordination and storage."],
    [{ type: "paragraph", text: "Linearizability (also called strong consistency or atomic consistency) is the strongest single-object guarantee. It makes concurrent operations appear to execute in some sequential order that respects real-time ordering." },
     { type: "callout", title: "Cost", text: "Linearizability requires consensus on every operation — adding latency and reducing availability during network partitions.", variant: "warning" },
     rw("Kubernetes uses etcd for linearizable leader election and config storage. ZooKeeper coordinates Kafka brokers (legacy) and Hadoop. Distributed locks (Redisson on Redis, etcd leases) need linearizable compare-and-set. Spanner offers external linearizable reads globally — rare and costly; most apps settle for per-partition ordering in Kafka instead."),
     app("LinkedIn", "Job-posting deduplication and distributed locks for recruiter workflows require linearizable compare-and-set via etcd — only one worker may hold the lock at a time."),
     code("Linearizable compare-and-set lock", TS.compareAndSet)],
    ["linearizability", "etcd", "ZooKeeper", "CAP theorem", "Spanner", "compare-and-set"]),

  L("ordering-guarantees", "ch09-consistency-and-consensus", "Ordering Guarantees",
    "Ordering events is fundamental to consistency, causality, and replication.",
    ["Causality: if A caused B, every node must see A before B.", "Sequence numbers assign a total order within one leader.", "Total order broadcast delivers the same messages in the same order to all nodes.", "Lamport timestamps provide partial ordering without a central sequencer.", "Consistent ordering simplifies replication and conflict resolution.", "Kafka partition ordering, PostgreSQL LSNs, and Debezium CDC preserve event order."],
    [{ type: "paragraph", text: "If event B depends on event A, all observers must process A before B. Establishing global order in a distributed system requires either a single sequencer (leader) or logical clocks that track causality." },
     rw("Kafka guarantees order within a partition — so related events (e.g., all updates for user_id=42) must share a partition key. PostgreSQL logical replication streams changes in log sequence number (LSN) order. Debezium CDC publishes database changes to Kafka preserving per-table ordering. Cross-partition causal ordering still requires application-level design."),
     app("Uber", "All events for one trip_id share a Kafka partition so pickup → en-route → completed always arrive in causal order. Cross-trip ordering does not matter and stays unordered."),
     code("Kafka consumer with partition ordering", TS.kafkaConsumer)],
    ["causality", "Kafka", "Debezium", "total order broadcast", "Lamport timestamp", "sequence number"]),

  L("distributed-consensus", "ch09-consistency-and-consensus", "Distributed Transactions and Consensus",
    "Consensus protocols let nodes agree on a value despite failures — powering distributed transactions.",
    ["Two-phase commit (2PC) coordinates atomic commit across participants.", "2PC blocks if the coordinator fails after prepare.", "Fault-tolerant consensus (Raft, Paxos, Zab) elects a leader and replicates a log.", "Consensus is required for leader election, atomic commit, and membership changes.", "Coordination services (ZooKeeper, etcd) provide consensus as a service.", "Raft in etcd/Consul, Kafka KRaft, and XA transactions across PostgreSQL show consensus in production."],
    [{ type: "paragraph", text: "Getting multiple nodes to agree on a single value — who is leader, whether to commit, what the next log entry is — is the consensus problem. Algorithms like Raft make this practical for production systems." },
     dia("two-phase-commit", "Coordinator asks participants to prepare, then commits or aborts."),
     rw("etcd and HashiCorp Consul use Raft for leader election and consistent key-value storage — the backbone of Kubernetes control planes. Kafka replaced ZooKeeper with KRaft (internal Raft) for broker metadata. Cross-database 2PC (XA transactions) exists in Java EE but is fragile; the saga pattern with compensating transactions in microservices is more common today."),
     app("Google", "Chubby (precursor to etcd) provided distributed consensus for Google's internal infrastructure — leader election, lock service, and membership. Kubernetes today relies on etcd's Raft implementation for the same guarantees."),
     code("SAGA compensating transaction", TS.sagaBooking)],
    ["consensus", "Raft", "etcd", "Kafka", "two-phase commit", "ZooKeeper"]),

  // Chapter 10
  L("unix-tools", "ch10-batch-processing", "Batch Processing with Unix Tools",
    "The Unix philosophy — composable tools over monolithic programs — scales to big data.",
    ["Small tools do one thing well and compose via pipes.", "stdin/stdout as a uniform interface decouples producers and consumers.", "Log analysis with awk, grep, and sort handles surprisingly large datasets.", "Immutability of input files enables retry and recomputation.", "The same patterns underpin Hadoop, Spark, and modern data pipelines.", "grep/awk on logs, DuckDB on Parquet, and Fluent Bit pipelines extend the Unix pattern."],
    [{ type: "paragraph", text: "Long before Hadoop, Unix pipelines processed data by chaining simple programs: extract fields with awk, filter with grep, aggregate with sort. Each tool is stateless, reads stdin, writes stdout — a pattern that scales to terabytes when parallelized." },
     rw("SREs still debug production with grep and jq on JSON logs. DuckDB queries Parquet files on S3 like a local Unix tool — no cluster required. Fluent Bit and Vector collect container logs on Kubernetes nodes and pipe them to Elasticsearch or S3. The composable-pipeline idea survived; only the scale and storage changed."),
     app("Google", "Google's early MapReduce paper explicitly credits Unix pipelines as inspiration — small composable tools over monolithic programs. SRE log triage still chains grep, awk, and sort before reaching for a cluster."),
     code("Unix-style log pipeline", TS.unixPipeline)],
    ["Unix philosophy", "DuckDB", "Fluent Bit", "batch processing", "pipeline", "immutability"]),

  L("mapreduce", "ch10-batch-processing", "MapReduce and Distributed Filesystems",
    "MapReduce brought Unix-style batch processing to clusters with automatic parallelization and fault tolerance.",
    ["Input files are split across cluster nodes; each runs a map function.", "Shuffle sorts and groups intermediate key-value pairs by key.", "Reduce functions aggregate all values for each key.", "Failed map/reduce tasks are automatically retried on other nodes.", "HDFS stores large immutable files replicated across the cluster.", "Hadoop MapReduce on HDFS is legacy; S3 + Spark replaced it in most cloud stacks."],
    [{ type: "paragraph", text: "MapReduce wraps the Unix pipeline in a fault-tolerant distributed runtime. Map tasks extract data in parallel; shuffle groups by key; reduce tasks aggregate. The runtime handles scheduling, retries, and data locality." },
     dia("mapreduce-pipeline", "Map → Shuffle → Reduce over a distributed filesystem."),
     rw("Early Twitter and LinkedIn analytics ran on Hadoop MapReduce over HDFS. Today AWS EMR and Databricks run Spark over S3 — same map-shuffle-reduce idea, but in-memory stages avoid writing every intermediate to disk. Immutable Parquet files on S3 replaced HDFS for most new data lakes."),
     app("LinkedIn", "Early member analytics and ad targeting ran on Hadoop MapReduce over HDFS — immutable input files, parallel map tasks, shuffle by key, reduce aggregates. The pattern scaled to petabytes before Spark replaced disk-bound intermediates."),
     code("Spark batch over immutable Parquet", TS.sparkBatch),
     sys("system-google-search", "Batch indexing pipeline: map-shuffle-reduce over distributed storage — the Google-scale pattern behind web crawls and analytics.")],
    ["MapReduce", "Spark", "HDFS", "S3", "shuffle", "batch job"]),

  L("beyond-mapreduce", "ch10-batch-processing", "Beyond MapReduce",
    "Modern batch engines add iterative processing, higher-level APIs, and faster in-memory execution.",
    ["Materializing intermediate state to disk (MapReduce) is slow for iterative algorithms.", "Spark keeps data in memory across stages for faster iteration.", "High-level APIs (Spark SQL, DataFrames) decouple logic from execution.", "Graph processing (Pregel) uses message-passing between vertices.", "Batch and stream processing are converging into unified engines.", "Apache Spark, Apache Flink, and Snowflake's elastic compute supersede classic MapReduce."],
    [{ type: "paragraph", text: "MapReduce's rigid map-shuffle-reduce cycle forces disk writes between every stage. Modern engines materialize less, push computation to data, and expose declarative APIs — while retaining fault tolerance through lineage graphs." },
     rw("Databricks runs Apache Spark for ETL and ML training over terabytes in memory. Apache Flink unifies batch and stream processing in one runtime. Snowflake separates storage (S3/Azure) from elastic compute warehouses — you write SQL, not MapReduce jobs. dbt layers transformations on top of Snowflake or BigQuery with version-controlled SQL models."),
     app("Netflix", "Recommendation model training runs on Spark over viewing-history Parquet in S3 — iterative in-memory stages replace MapReduce's disk-bound shuffle between every step."),
     code("Declarative warehouse SQL", TS.snowflakeQuery)],
    ["Spark", "Flink", "Snowflake", "dbt", "DataFrame", "dataflow engine"]),

  // Chapter 11
  L("transmitting-event-streams", "ch11-stream-processing", "Transmitting Event Streams",
    "Event streams deliver records continuously — via message brokers, partitioned logs, or direct sockets.",
    ["Message brokers (RabbitMQ) route messages to consumers with optional persistence.", "Partitioned logs (Kafka) retain messages for replay and multiple consumer groups.", "Producers append; consumers track their offset in the log.", "Backpressure and buffering handle speed mismatches between producers and consumers.", "Exactly-once processing semantics require idempotent consumers, transactional commits, or deduplication.", "Kafka, RabbitMQ, AWS SQS/SNS, WebSockets, and SSE cover async and real-time delivery."],
    [{ type: "paragraph", text: "Unlike request-response, event streams deliver a sequence of records over time. Message brokers decouple producers and consumers. Partitioned logs add durability and replay — consumers can re-read history at their own pace." },
     dia("event-stream", "Producers append to a partitioned log; consumer groups read at independent offsets."),
     rw("Apache Kafka is the default partitioned log for microservices — order events, audit logs, and CDC streams. RabbitMQ and AWS SQS route task queues with at-least-once delivery. For browser real-time updates, WebSockets (bidirectional) and Server-Sent Events (server push over HTTP) complement the async backend. Kafka transactions plus idempotent producers achieve exactly-once processing semantics within a cluster."),
     app("WhatsApp", "Message delivery events append to a partitioned log so multiple consumer groups — push notifications, analytics, moderation — read the same stream at independent offsets without competing for messages."),
     code("Kafka consumer group", TS.kafkaConsumer),
     sys("system-whatsapp", "Partitioned event log for message streams: producers append, consumers replay at their own pace.")],
    ["Kafka", "RabbitMQ", "WebSocket", "SSE", "partitioned log", "consumer group", "offset"]),

  L("databases-and-streams", "ch11-stream-processing", "Databases and Streams",
    "Databases and streams are two views of the same data — and keeping them in sync is the integration challenge.",
    ["Change Data Capture (CDC) streams database writes to downstream systems.", "Event sourcing stores state changes as an immutable log of events.", "The log is the system of record; materialized views are derived state.", "Dual writes to database and queue risk inconsistency.", "Transactional outbox pattern writes events atomically with state changes.", "Debezium, Kafka Connect, and the transactional outbox with PostgreSQL are production CDC patterns."],
    [{ type: "paragraph", text: "A database holds current state; a stream holds the history of changes. CDC bridges them by tailing the replication log. Event sourcing inverts the model: the log is primary, and current state is a derived view rebuilt by replay." },
     rw("Debezium reads PostgreSQL WAL changes and publishes to Kafka — powering search index updates, cache invalidation, and data warehouses without dual writes. The transactional outbox pattern writes events to an outbox table in the same PostgreSQL transaction as the business row, then a relay process publishes to Kafka. EventStoreDB and Marten (.NET) implement full event sourcing for audit-heavy domains."),
     app("Shopify", "Order rows and outbox events commit in the same PostgreSQL transaction — a relay publishes OrderPlaced to Kafka for search indexing and warehouse sync without risky dual writes."),
     code("Transactional outbox pattern", TS.cdcOutbox),
     sys("system-airbnb", "Database state and event streams stay in sync: CDC and outbox relay derived views without dual-write races.")],
    ["CDC", "Debezium", "Kafka", "PostgreSQL", "event sourcing", "transactional outbox"]),

  L("processing-streams", "ch11-stream-processing", "Processing Streams",
    "Stream processors apply transformations to unbounded data — windowing time is the hard part.",
    ["Uses: notifications, search indexing, metrics, fraud detection, recommendations.", "Event time (when it happened) vs processing time (when observed) diverge.", "Windowing groups events by time ranges for aggregation.", "Stream joins combine two streams or a stream with a table.", "Fault tolerance via checkpointing and replay from durable logs.", "Apache Flink, Kafka Streams, ksqlDB, and Materialize process streams in production."],
    [{ type: "paragraph", text: "Stream processing applies computations to data in motion. Unlike batch, the input is unbounded. Key challenges: handling out-of-order events, defining time windows, and maintaining state across failures." },
     rw("Flink powers real-time fraud detection at banks — joining a payment stream against a Redis feature store within millisecond windows. Kafka Streams embeds processing in JVM microservices without a separate cluster. ksqlDB lets analysts write SQL over Kafka topics. Materialize maintains incrementally updated SQL views — like a live data warehouse fed by streams."),
     app("Uber", "Surge pricing aggregates ride demand in 5-minute tumbling windows over a geo-partitioned event stream — event time, not processing time, defines when a window closes."),
     code("Flink tumbling window aggregation", TS.flinkWindow)],
    ["Flink", "Kafka Streams", "ksqlDB", "Materialize", "stream processing", "windowing", "checkpoint"]),

  // Chapter 12
  L("data-integration", "ch12-future-of-data-systems", "Data Integration",
    "Modern architectures combine specialized tools by deriving data through unbundled pipelines.",
    ["No single database does everything well — compose specialized systems.", "Derive views, indexes, and analytics from an immutable event log.", "Batch and stream processing both feed derived data systems.", "Unbundling the database separates storage, indexing, querying, and processing.", "Dataflow-oriented design makes integration explicit in the architecture.", "Lambda → Kappa architecture with Kafka; microservices with Postgres + Elasticsearch + Redis + Snowflake."],
    [{ type: "paragraph", text: "The future is not one database to rule them all. Instead, systems specialize: OLTP for transactions, search index for full-text, warehouse for analytics, cache for speed. An event log connects them, and derived data flows keep views consistent." },
     rw("A modern e-commerce stack: PostgreSQL for orders, Redis for session cache and rate limiting, Elasticsearch for product search, Kafka for order events, Snowflake for analytics, and S3 for image storage — all synced via CDC and stream processors. Kubernetes and Docker package each service; Envoy or nginx routes traffic at the edge. Authentication flows through OAuth 2.0 / OpenID Connect (Auth0, Keycloak, AWS Cognito)."),
     app("Airbnb", "Listings live in PostgreSQL, search in Elasticsearch, sessions in Redis, analytics in Snowflake — all derived from an immutable Kafka event log via CDC. No single database does everything."),
     code("CDC outbox to Kafka", TS.cdcOutbox),
     sys("system-modern-stack", "Unbundled data stack: specialized stores connected by event log and derived pipelines.")],
    ["data integration", "PostgreSQL", "Kafka", "Elasticsearch", "Redis", "Snowflake", "unbundling"]),

  L("aiming-for-correctness", "ch12-future-of-data-systems", "Aiming for Correctness",
    "End-to-end guarantees, constraints, and verification — correctness requires deliberate design.",
    ["The end-to-end argument: low-level reliability alone does not ensure application correctness.", "Enforce constraints at the data layer where possible (unique, foreign key, check).", "Timeliness and integrity: data must be correct and arrive when needed.", "Audit trails and checksums enable trust-but-verify patterns.", "Formal verification and testing at the system boundary catch integration bugs.", "Stripe idempotency keys, PostgreSQL constraints, and SAGA patterns enforce correctness end-to-end."],
    [{ type: "paragraph", text: "Correctness is not accidental. It requires end-to-end reasoning: the database can enforce constraints, but the application must define invariants. Auditing, idempotency, and deterministic replay help verify that derived systems match the source of truth." },
     rw("Stripe's API requires Idempotency-Key headers so network retries never double-charge. PostgreSQL UNIQUE and FOREIGN KEY constraints catch bugs at the database layer. In microservices, the SAGA pattern coordinates multi-service transactions with compensating actions (cancel shipment if payment fails). OpenTelemetry traces verify that an event published to Kafka was processed by every downstream consumer."),
     app("Stripe", "Every charge API call accepts an Idempotency-Key header — network retries return the original result instead of double-charging. Correctness is enforced end-to-end, not just at the TCP layer."),
     code("Idempotent payment retries", TS.idempotencyStripe)],
    ["end-to-end argument", "idempotency", "PostgreSQL", "SAGA", "OpenTelemetry", "correctness"]),

  L("doing-the-right-thing", "ch12-future-of-data-systems", "Doing the Right Thing",
    "Data systems have societal impact — predictive analytics, privacy, and the ethics of data collection.",
    ["Predictive systems amplify biases present in training data.", "Privacy requires limiting collection, retention, and correlation of personal data.", "Tracking and surveillance capitalism erode user trust.", "Engineers have responsibility for how data is used, not just how it is stored.", "Regulation (GDPR) and privacy-by-design are becoming engineering requirements.", "GDPR, AWS data residency, and on-device ML (Apple) reflect engineering responses to privacy."],
    [{ type: "paragraph", text: "Building data systems is not value-neutral. Recommendation engines shape behavior. Predictive policing encodes historical bias. Tracking infrastructure enables surveillance. Engineers must consider who benefits, who is harmed, and what data is truly necessary." },
     { type: "callout", title: "Privacy by design", text: "Collect minimum data, encrypt at rest and in transit, provide deletion mechanisms, and make data practices transparent to users.", variant: "warning" },
     rw("GDPR requires deletion APIs and data processing agreements — engineering teams implement right-to-erasure in PostgreSQL with soft-delete + purge jobs. AWS offers region-locked storage (data residency) for regulated industries. Snowflake column masking and row access policies enforce authorization at the warehouse layer. Recommendation systems at Netflix and TikTok raise ongoing questions about filter bubbles and engagement optimization vs user wellbeing."),
     app("Netflix", "Recommendation models trained on viewing history must honor GDPR deletion requests — purge user rows from warehouses and retrain without retained PII. OAuth scopes limit which services access profile data."),
     code("OAuth 2.0 authorization flow", TS.oauthAuth)],
    ["privacy", "GDPR", "AWS", "Snowflake", "authorization", "ethics"]),
];

const ch01 = loadCh01();
const index: Record<string, LessonSection> = { ...ch01 };

for (const lesson of [...newLessons, ...systemDesignLessons]) {
  index[lesson.id] = migrateLesson({ ...lesson, media: lesson.media ?? {} });
}

writeFileSync(path.join(lessonsDir, "index.json"), JSON.stringify(index, null, 2) + "\n");

for (const [id, lesson] of Object.entries(index)) {
  writeFileSync(path.join(lessonsDir, `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}

console.log(`Wrote ${Object.keys(index).length} lessons to content/lessons/index.json and per-lesson JSON files`);