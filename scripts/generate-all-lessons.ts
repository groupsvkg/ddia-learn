import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LessonSection } from "../src/types/content";

const root = path.resolve(import.meta.dirname, "..");
const lessonsDir = path.join(root, "content/lessons");

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
    result[lesson.id] = lesson;
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
    ["Relational databases normalize data into tables with foreign-key relationships.", "Document databases embed related data together for locality of reference.", "One-to-many and many-to-many relationships are easier in relational schemas.", "Schema flexibility favors documents for rapidly evolving product data.", "Neither model is universally superior — match the model to your query patterns."],
    [{ type: "paragraph", text: "At the heart of every database is a data model: the abstraction it exposes to applications. For decades, the relational model dominated. The rise of web applications brought document databases back into focus, each arguing they better fit modern development." },
     { type: "heading", text: "The Object-Relational Mismatch", level: 2 },
     { type: "paragraph", text: "Object-oriented code thinks in nested structures; relational tables are flat rows. ORMs bridge this gap but introduce impedance mismatch — awkward joins, N+1 queries, and schema migrations that fight your object model." },
     { type: "callout", title: "When documents win", text: "If your application mostly reads or writes whole records together (user profile + settings + preferences), embedding in a document avoids joins and maps naturally to JSON APIs.", variant: "tip" },
     { type: "list", items: ["Relational: strong for ad-hoc queries, joins, and enforcing referential integrity.", "Document: strong for hierarchical data, flexible schemas, and horizontal scaling.", "Graph: strong when relationships are the primary query pattern (covered next)."] }],
    ["relational model", "document model", "normalization", "impedance mismatch"]),

  L("query-languages", "ch02-data-models-query-languages", "Query Languages for Data",
    "Declarative query languages let you describe what you want; the engine figures out how to get it.",
    ["SQL is the canonical declarative language — describe the result, not the algorithm.", "MapReduce expresses batch computation as map and reduce phases over datasets.", "Graph query languages (Cypher, SPARQL) traverse relationships declaratively.", "Imperative code in application layers duplicates logic that belongs in the data layer.", "Choosing a query language constrains which access patterns are efficient."],
    [{ type: "paragraph", text: "A query language defines how applications read and transform data. Declarative languages like SQL separate the what from the how: you specify the desired result set, and the query optimizer chooses indexes, join order, and execution plan." },
     { type: "heading", text: "Declarative vs Imperative", level: 2 },
     { type: "paragraph", text: "Imperative code fetches rows and loops in application memory. Declarative queries push work to the database where indexes and statistics enable efficient execution. This separation is why SQL survived decades of hype cycles." },
     { type: "callout", title: "MapReduce", text: "MapReduce brought declarative batch processing to distributed files: map functions extract key-value pairs, shuffle groups by key, reduce aggregates. Modern engines (Spark, Flink) evolved beyond the strict two-phase model.", variant: "info" }],
    ["SQL", "declarative query", "MapReduce", "query optimizer"]),

  L("graph-like-data-models", "ch02-data-models-query-languages", "Graph-Like Data Models",
    "When connections between entities matter more than the entities themselves, graph models are the natural fit.",
    ["Property graphs store nodes, edges, and properties — ideal for social networks and recommendations.", "Triple-stores represent facts as (subject, predicate, object) for semantic web data.", "Graph traversals replace expensive multi-table joins in relational schemas.", "Cypher and SPARQL express path queries declaratively.", "Graph databases trade specialized traversal for weaker bulk analytics."],
    [{ type: "paragraph", text: "Many domains are inherently connected: social graphs, supply chains, knowledge bases, fraud detection. Representing these as relational tables with join tables works but makes traversal queries verbose and slow." },
     { type: "heading", text: "Property Graphs", level: 2 },
     { type: "paragraph", text: "In a property graph, vertices represent entities and edges represent relationships, both carrying key-value properties. Finding friends-of-friends or shortest paths becomes a native index traversal rather than a recursive SQL query." },
     { type: "list", items: ["Cypher (Neo4j): pattern-matching syntax for graph traversal.", "SPARQL: W3C standard for RDF triple-stores.", "Datalog: logic-based queries with recursive rules."] }],
    ["property graph", "triple-store", "Cypher", "SPARQL", "graph traversal"]),

  // Chapter 3
  L("data-structures", "ch03-storage-and-retrieval", "Data Structures That Power Your Database",
    "Under every database API lies a storage engine choosing between log-structured and B-tree designs.",
    ["Hash indexes suit exact key lookups on memory-resident data.", "SSTables and LSM-trees batch writes into sorted segments for high write throughput.", "B-trees maintain sorted pages on disk for balanced read/write performance.", "LSM-trees trade read amplification for write throughput; B-trees do the opposite.", "Compaction in LSM-trees merges segments in the background."],
    [{ type: "paragraph", text: "Storage engines are the library components that databases use to store and retrieve bytes on disk. The two dominant families are log-structured merge (LSM) trees and B-trees — each optimizing for different workloads." },
     { type: "heading", text: "LSM-Trees vs B-Trees", level: 2 },
     { type: "paragraph", text: "B-trees update pages in place — predictable read latency, but random writes can be slow on spinning disks. LSM-trees append writes to a log, then compact sorted segments — excellent write throughput at the cost of occasional read amplification during compaction." },
     { type: "callout", title: "Real-world engines", text: "RocksDB and LevelDB use LSM-trees. PostgreSQL and MySQL InnoDB use B-trees. Choosing an engine is choosing a read/write trade-off.", variant: "info" }],
    ["LSM-tree", "B-tree", "SSTable", "storage engine", "compaction"]),

  L("transaction-processing-or-analytics", "ch03-storage-and-retrieval", "Transaction Processing or Analytics?",
    "OLTP and OLAP systems optimize for opposite access patterns — and mixing them hurts both.",
    ["OLTP handles many small, fast transactions: inserts, updates, point lookups.", "OLAP runs large aggregation scans over historical data.", "Data warehouses use column-oriented storage and star/snowflake schemas.", "ETL pipelines copy OLTP data into warehouses for analytics.", "Trying to run analytics on OLTP databases overloads production traffic."],
    [{ type: "paragraph", text: "Transaction processing (OLTP) systems power live applications: checkout, account updates, messaging. Analytics (OLAP) systems answer business questions over months of history. Their hardware, schema, and storage layouts diverge completely." },
     { type: "heading", text: "Data Warehousing", level: 2 },
     { type: "paragraph", text: "A data warehouse ingests copies of production data via ETL, denormalizes into star schemas (fact tables surrounded by dimension tables), and optimizes for scan-heavy aggregation — not millisecond point lookups." }],
    ["OLTP", "OLAP", "data warehouse", "star schema", "ETL"]),

  L("column-oriented-storage", "ch03-storage-and-retrieval", "Column-Oriented Storage",
    "Column stores excel at analytics by reading only the columns a query needs.",
    ["Row-oriented storage reads entire rows even when you need one column.", "Column-oriented storage stores each column contiguously on disk.", "Column compression is far more effective due to similar values in a column.", "Sort order in column storage enables efficient range scans and merges.", "Materialized views and data cubes pre-aggregate common queries."],
    [{ type: "paragraph", text: "In a row store, all fields of a record sit together — great for fetching a whole user profile. In a column store, all values for a given field sit together — great for SUM(revenue) across millions of rows." },
     { type: "list", items: ["Read only columns referenced in SELECT — less I/O.", "Run-length and dictionary encoding compress repetitive column data.", "Vectorized execution processes columns in SIMD-friendly batches."] }],
    ["column store", "column compression", "materialized view", "data cube"]),

  // Chapter 4
  L("formats-for-encoding", "ch04-encoding-and-evolution", "Formats for Encoding Data",
    "How you encode data determines compatibility, schema evolution, and cross-language interoperability.",
    ["JSON and XML are human-readable but verbose and weakly typed.", "Thrift and Protocol Buffers use tagged field numbers for compact binary encoding.", "Avro requires a schema for reading — enabling compact encoding without field tags.", "Forward and backward compatibility let old and new code coexist during deploys.", "Schema registries manage evolution in production systems."],
    [{ type: "paragraph", text: "Programs in memory represent data as objects and structs. To send data over a network or store it on disk, you must encode it as bytes. The encoding format determines size, speed, and — critically — whether schemas can evolve without breaking consumers." },
     { type: "callout", title: "Compatibility modes", text: "Forward compatibility: old code reads new data. Backward compatibility: new code reads old data. Field tags (Protobuf) and union schemas (Avro) enable both.", variant: "tip" }],
    ["JSON", "Protocol Buffers", "Avro", "schema evolution", "serialization"]),

  L("modes-of-dataflow", "ch04-encoding-and-evolution", "Modes of Dataflow",
    "Data moves between processes via databases, service calls, and message queues — each with different trade-offs.",
    ["Database-as-mediator: processes write and read shared tables asynchronously.", "REST and RPC: synchronous request/response between services.", "Message queues: asynchronous, buffered delivery with at-least-once semantics.", "Event-driven architectures decouple producers and consumers in time.", "The encoding format must be agreed upon across all participants."],
    [{ type: "paragraph", text: "When one process needs to share data with another, the dataflow pattern matters. Writing to a shared database is the oldest integration pattern. RPC calls offer synchronous coupling. Message queues add buffering and decouple availability." },
     { type: "list", items: ["Database: simple but creates tight schema coupling.", "REST/RPC: real-time but requires both sides to be available.", "Message queue: resilient to spikes but adds delivery guarantees complexity."] }],
    ["REST", "RPC", "message queue", "event-driven", "data integration"]),

  // Chapter 5
  L("leaders-and-followers", "ch05-replication", "Leaders and Followers",
    "Leader-based replication funnels all writes through one node and copies them to followers.",
    ["One replica is the leader; all writes go to it.", "Followers replicate the leader's write log and serve read traffic.", "Synchronous replication waits for follower ack before confirming writes.", "Asynchronous replication is faster but risks data loss on leader failure.", "New followers bootstrap by copying a snapshot then tailing the log."],
    [{ type: "paragraph", text: "Replication keeps copies of data on multiple machines for fault tolerance and read scaling. The simplest scheme designates one leader that accepts writes and broadcasts changes to follower replicas." },
     { type: "diagram", diagramId: "leader-follower", caption: "Writes flow to the leader; followers replicate the log and serve reads." }],
    ["leader", "follower", "replication log", "synchronous replication"]),

  L("replication-lag", "ch05-replication", "Problems with Replication Lag",
    "Asynchronous followers may lag behind the leader, creating stale reads and subtle consistency bugs.",
    ["Read-your-own-writes: users must see their own recent changes.", "Monotonic reads: users never see time go backward across requests.", "Consistent prefix reads: causal order of writes is preserved.", "Replication lag is normal — applications must explicitly handle it.", "Sticky sessions route a user to one replica to improve consistency."],
    [{ type: "paragraph", text: "When followers lag seconds behind the leader, users experience anomalies: posting a comment and not seeing it, or seeing newer data followed by older data. These are not failures — they are consequences of eventual consistency." },
     { type: "diagram", diagramId: "replication-lag", caption: "A write reaches the leader immediately but followers may serve stale data for seconds." },
     { type: "callout", title: "Fixes", text: "Read from leader after writes, use sticky sessions, or wait for follower catch-up before serving reads.", variant: "tip" }],
    ["replication lag", "read-your-own-writes", "monotonic reads", "eventual consistency"]),

  L("multi-leader-replication", "ch05-replication", "Multi-Leader Replication",
    "Multiple leaders accept writes in different datacenters — but conflict resolution becomes necessary.",
    ["Each datacenter has a local leader for low-latency writes.", "Leaders replicate to each other asynchronously.", "Concurrent writes to the same record on different leaders create conflicts.", "Conflict resolution: last-write-wins, custom merge, or conflict-free replicated data types.", "Multi-leader suits multi-datacenter deployments with offline tolerance."],
    [{ type: "paragraph", text: "Single-leader replication means cross-datacenter writes traverse WAN latency. Multi-leader allows each site to write locally, then replicate. The cost is write conflicts when two leaders modify the same data concurrently." }],
    ["multi-leader", "write conflict", "CRDT", "last-write-wins"]),

  L("leaderless-replication", "ch05-replication", "Leaderless Replication",
    "Dynamo-style systems let any replica accept writes and use quorums to detect inconsistency.",
    ["Clients write to multiple replicas in parallel (W replicas).", "Reads contact R replicas and pick the most recent version by version number.", "Quorum condition W + R > N ensures overlap between read and write sets.", "Sloppy quorums and hinted handoff maintain availability during partitions.", "Version vectors detect concurrent writes that need merging."],
    [{ type: "paragraph", text: "Leaderless replication (pioneered by Dynamo) removes the single-leader bottleneck. Any node can accept writes. On read, the client queries multiple replicas and reconciles versions. Quorum rules balance consistency against availability." },
     { type: "diagram", diagramId: "quorum-read-write", caption: "With N=3, W=2, R=2: writes and reads overlap on at least one node." }],
    ["quorum", "leaderless", "Dynamo", "version vector", "sloppy quorum"]),

  // Chapter 6
  L("partitioning-key-value", "ch06-partitioning", "Partitioning of Key-Value Data",
    "Partitioning splits a dataset across nodes so each machine handles a manageable subset.",
    ["Partitioning by key range assigns contiguous key ranges to nodes — risk of hot spots.", "Hash partitioning distributes keys evenly but loses range-scan efficiency.", "Skewed workloads need composite keys or random suffixes to spread hot keys.", "Partitioning is almost always combined with replication for fault tolerance.", "The partition function is hard to change after deployment."],
    [{ type: "paragraph", text: "A single machine cannot hold all data forever. Partitioning (sharding) divides the key space so each node owns a subset. The partition scheme determines load balance and query efficiency." },
     { type: "diagram", diagramId: "hash-partitioning", caption: "Hash of key mod N distributes records across partitions." }],
    ["partitioning", "sharding", "key range", "hash partitioning", "hot spot"]),

  L("secondary-indexes", "ch06-partitioning", "Partitioning and Secondary Indexes",
    "Secondary indexes on partitioned data require either local indexes per partition or a global index.",
    ["Partitioned by document: each partition maintains its own secondary indexes.", "Partitioned by term: the index itself is partitioned by the indexed value.", "Global indexes enable efficient lookups but add coordination overhead.", "Secondary index queries may scatter-gather across all partitions.", "Index maintenance on writes adds latency to every insert and update."],
    [{ type: "paragraph", text: "Primary key partitioning is straightforward — route by key hash. Secondary indexes (search by email, filter by date) complicate routing because the indexed value may live on a different partition than the record." }],
    ["secondary index", "scatter-gather", "global index", "local index"]),

  L("rebalancing", "ch06-partitioning", "Rebalancing Partitions",
    "When nodes join or leave the cluster, partitions must move — without excessive downtime.",
    ["Hash mod N breaks when N changes — most keys remap to new nodes.", "Consistent hashing minimizes key movement when nodes are added or removed.", "Fixed number of partitions with virtual nodes simplifies rebalancing.", "Automatic rebalancing risks cascading failures; manual triggers are safer.", "Rebalancing should move minimal data at bounded throughput."],
    [{ type: "paragraph", text: "Adding a machine should improve capacity, not invalidate your entire partition map. Naive hash mod N remaps almost every key when N changes. Better schemes use fixed partitions or consistent hashing to limit data movement." }],
    ["rebalancing", "consistent hashing", "virtual node", "fixed partitions"]),

  L("request-routing", "ch06-partitioning", "Request Routing",
    "Clients must find the right partition for each request — via routing tier, gateway, or aware clients.",
    ["Naive approach: send all requests to a routing tier that forwards to the right node.", "Gateway: stateless proxy that knows the partition map.", "Partition-aware clients cache the routing table and connect directly.", "The partition map must update when rebalancing occurs.", "ZooKeeper, gossip protocols, or config services distribute routing metadata."],
    [{ type: "paragraph", text: "Given a key, which node owns it? A routing layer answers this question. Centralized gateways are simple but can bottleneck. Smart clients avoid the hop but must handle map updates." }],
    ["request routing", "partition map", "gateway", "ZooKeeper"]),

  // Chapter 7
  L("slippery-concept", "ch07-transactions", "The Slippery Concept of a Transaction",
    "Transactions group operations into atomic units — but the guarantees vary widely across systems.",
    ["ACID: Atomicity, Consistency, Isolation, Durability — the classic transaction contract.", "Atomicity: all-or-nothing — partial failures roll back.", "Consistency: invariants hold (often enforced by application logic, not the DB).", "Isolation: concurrent transactions do not interfere.", "Durability: committed data survives crashes.", "Single-object vs multi-object transactions have very different costs."],
    [{ type: "paragraph", text: "A transaction is a logical unit of work that succeeds or fails as a whole. ACID properties define the promise, but real systems implement them with varying strictness — especially in distributed settings." },
     { type: "callout", title: "Consistency in ACID", text: "Unlike the other three properties, consistency depends on application-defined invariants (e.g., account balance >= 0). The database provides tools; the application defines the rules.", variant: "info" }],
    ["ACID", "atomicity", "transaction", "durability"]),

  L("weak-isolation", "ch07-transactions", "Weak Isolation Levels",
    "Most databases default to weak isolation for performance — accepting anomalies most apps never notice.",
    ["Read committed: no dirty reads; each query sees only committed data.", "Snapshot isolation: each transaction sees a consistent point-in-time snapshot.", "Repeatable read prevents non-repeatable reads within a transaction.", "Write skew: two transactions read overlapping data and write disjoint rows.", "Phantoms: new rows appear in a re-executed range query."],
    [{ type: "paragraph", text: "Serial execution of transactions is safe but slow. Weak isolation levels allow concurrency by permitting certain anomalies. Understanding which anomalies your application can tolerate is essential." },
     { type: "diagram", diagramId: "isolation-levels", caption: "Stronger isolation prevents more anomalies but reduces concurrency." }],
    ["read committed", "snapshot isolation", "write skew", "phantom read"]),

  L("serializability", "ch07-transactions", "Serializability",
    "The strongest isolation guarantee: transactions execute as if they ran one at a time.",
    ["Actual serial execution: run transactions on a single thread — simple but limited throughput.", "Two-phase locking (2PL): readers and writers acquire locks; risk of deadlocks.", "Serializable Snapshot Isolation (SSI): optimistic detection of conflicts at commit.", "Serializability prevents all anomalies but costs latency and throughput.", "Distributed serializability requires coordination across partitions."],
    [{ type: "paragraph", text: "Serializable isolation is the gold standard: the result is identical to some serial execution order. Achieving it without sacrificing all concurrency is one of database engineering's hardest problems." }],
    ["serializability", "two-phase locking", "SSI", "deadlock"]),

  // Chapter 8
  L("faults-and-partial-failures", "ch08-trouble-with-distributed-systems", "Faults and Partial Failures",
    "In distributed systems, only part of the system can fail — making failures harder to reason about.",
    ["Single-machine systems fail entirely; distributed systems have partial failures.", "Cloud datacenters have better redundancy than single machines but shared failure domains.", "Supercomputers assume reliable components; cloud systems assume failure is routine.", "You cannot assume a remote node is alive without evidence.", "Design for the case where any node, link, or rack can fail independently."],
    [{ type: "paragraph", text: "On one machine, a crash stops everything — easy to detect. In a distributed system, one node may crash while others continue. A network link may drop while processes on both ends are healthy. This ambiguity makes distributed failure modes uniquely subtle." }],
    ["partial failure", "fault tolerance", "cloud computing", "failure domain"]),

  L("unreliable-networks", "ch08-trouble-with-distributed-systems", "Unreliable Networks",
    "Network packets get lost, delayed, and reordered — and you often cannot tell which happened.",
    ["TCP provides reliable delivery within a connection but cannot detect peer crashes.", "Timeouts are the only way to detect failure — but choosing the right timeout is hard.", "Network partitions split the cluster into islands that cannot communicate.", "Synchronous networks (e.g., internal datacenter) are more predictable than the public internet.", "You must design for messages that never arrive or arrive twice."],
    [{ type: "paragraph", text: "The network is not reliable. Packets drop, switches fail, and congestion causes unbounded delays. Distributed protocols must handle lost messages, duplicate messages, and the inability to distinguish slow responses from dead nodes." },
     { type: "callout", title: "The two generals problem", text: "Two armies must agree to attack simultaneously via messengers who may be captured. Proves that consensus is impossible with unreliable communication.", variant: "warning" }],
    ["network partition", "timeout", "TCP", "message loss"]),

  L("unreliable-clocks", "ch08-trouble-with-distributed-systems", "Unreliable Clocks",
    "Clocks drift, jump backward after NTP sync, and are meaningless across machines without careful use.",
    ["Time-of-day clocks (NTP) synchronize to UTC but can jump backward.", "Monotonic clocks measure elapsed time and never go backward — good for timeouts.", "Clock skew between machines makes event ordering by timestamp unreliable.", "Logical clocks (Lamport, vector clocks) track causality without wall-clock time.", "Never use wall-clock timestamps alone for ordering in distributed systems."],
    [{ type: "paragraph", text: "Applications use clocks for timeouts, deadlines, and event ordering. But NTP adjustments can jump time backward, quartz drift causes skew, and leap seconds create surprises. Relying on synchronized wall clocks for correctness is dangerous." }],
    ["NTP", "clock skew", "monotonic clock", "Lamport clock", "vector clock"]),

  L("knowledge-truth-lies", "ch08-trouble-with-distributed-systems", "Knowledge, Truth, and Lies",
    "In a distributed system, nodes operate with incomplete information — and must make decisions anyway.",
    ["The majority quorum defines what is true in leaderless systems.", "Byzantine faults: nodes that deliberately lie or behave arbitrarily.", "System models (crash-stop vs Byzantine) define what failures to tolerate.", "Fencing tokens prevent stale leaders from corrupting shared resources.", "Truth is a agreement among nodes — not an absolute property."],
    [{ type: "paragraph", text: "A node cannot know global system state — it only knows what it has observed. Decisions based on partial knowledge (is the leader dead? did my write succeed?) are inherently uncertain. Protocols define rules for reaching sufficient agreement to act." }],
    ["Byzantine fault", "quorum", "fencing token", "system model"]),

  // Chapter 9
  L("consistency-guarantees", "ch09-consistency-and-consensus", "Consistency Guarantees",
    "Consistency models define what reads can return after writes — from eventual to linearizable.",
    ["Eventual consistency: replicas converge if no new writes occur.", "Causal consistency preserves cause-and-effect ordering.", "Linearizability: every operation appears instantaneous at some point between start and end.", "Stronger guarantees cost latency and availability during partitions.", "Choose the weakest consistency model that satisfies your application invariants."],
    [{ type: "paragraph", text: "When data is replicated, reads may not reflect the latest write. Consistency models formalize what clients can expect. The spectrum runs from eventual (replicas converge eventually) to linearizable (behaves like a single copy)." }],
    ["eventual consistency", "causal consistency", "linearizability", "consistency model"]),

  L("linearizability", "ch09-consistency-and-consensus", "Linearizability",
    "Linearizability makes a replicated system behave as if there were only one copy of the data.",
    ["Every operation appears to take effect atomically at some instant.", "Once a write completes, all subsequent reads see it.", "Compare-and-set and distributed locks require linearizability.", "Implementing linearizability requires coordination — often a single leader.", "The CAP theorem: during a partition, choose consistency or availability."],
    [{ type: "paragraph", text: "Linearizability (also called strong consistency or atomic consistency) is the strongest single-object guarantee. It makes concurrent operations appear to execute in some sequential order that respects real-time ordering." },
     { type: "callout", title: "Cost", text: "Linearizability requires consensus on every operation — adding latency and reducing availability during network partitions.", variant: "warning" }],
    ["linearizability", "CAP theorem", "compare-and-set", "strong consistency"]),

  L("ordering-guarantees", "ch09-consistency-and-consensus", "Ordering Guarantees",
    "Ordering events is fundamental to consistency, causality, and replication.",
    ["Causality: if A caused B, every node must see A before B.", "Sequence numbers assign a total order within one leader.", "Total order broadcast delivers the same messages in the same order to all nodes.", "Lamport timestamps provide partial ordering without a central sequencer.", "Consistent ordering simplifies replication and conflict resolution."],
    [{ type: "paragraph", text: "If event B depends on event A, all observers must process A before B. Establishing global order in a distributed system requires either a single sequencer (leader) or logical clocks that track causality." }],
    ["causality", "total order broadcast", "Lamport timestamp", "sequence number"]),

  L("distributed-consensus", "ch09-consistency-and-consensus", "Distributed Transactions and Consensus",
    "Consensus protocols let nodes agree on a value despite failures — powering distributed transactions.",
    ["Two-phase commit (2PC) coordinates atomic commit across participants.", "2PC blocks if the coordinator fails after prepare.", "Fault-tolerant consensus (Raft, Paxos, Zab) elects a leader and replicates a log.", "Consensus is required for leader election, atomic commit, and membership changes.", "Coordination services (ZooKeeper, etcd) provide consensus as a service."],
    [{ type: "paragraph", text: "Getting multiple nodes to agree on a single value — who is leader, whether to commit, what the next log entry is — is the consensus problem. Algorithms like Raft make this practical for production systems." },
     { type: "diagram", diagramId: "two-phase-commit", caption: "Coordinator asks participants to prepare, then commits or aborts." }],
    ["consensus", "two-phase commit", "Raft", "Paxos", "ZooKeeper"]),

  // Chapter 10
  L("unix-tools", "ch10-batch-processing", "Batch Processing with Unix Tools",
    "The Unix philosophy — composable tools over monolithic programs — scales to big data.",
    ["Small tools do one thing well and compose via pipes.", "stdin/stdout as a uniform interface decouples producers and consumers.", "Log analysis with awk, grep, and sort handles surprisingly large datasets.", "Immutability of input files enables retry and recomputation.", "The same patterns underpin Hadoop, Spark, and modern data pipelines."],
    [{ type: "paragraph", text: "Long before Hadoop, Unix pipelines processed data by chaining simple programs: extract fields with awk, filter with grep, aggregate with sort. Each tool is stateless, reads stdin, writes stdout — a pattern that scales to terabytes when parallelized." }],
    ["Unix philosophy", "batch processing", "pipeline", "immutability"]),

  L("mapreduce", "ch10-batch-processing", "MapReduce and Distributed Filesystems",
    "MapReduce brought Unix-style batch processing to clusters with automatic parallelization and fault tolerance.",
    ["Input files are split across cluster nodes; each runs a map function.", "Shuffle sorts and groups intermediate key-value pairs by key.", "Reduce functions aggregate all values for each key.", "Failed map/reduce tasks are automatically retried on other nodes.", "HDFS stores large immutable files replicated across the cluster."],
    [{ type: "paragraph", text: "MapReduce wraps the Unix pipeline in a fault-tolerant distributed runtime. Map tasks extract data in parallel; shuffle groups by key; reduce tasks aggregate. The runtime handles scheduling, retries, and data locality." },
     { type: "diagram", diagramId: "mapreduce-pipeline", caption: "Map → Shuffle → Reduce over a distributed filesystem." }],
    ["MapReduce", "HDFS", "shuffle", "reduce", "batch job"]),

  L("beyond-mapreduce", "ch10-batch-processing", "Beyond MapReduce",
    "Modern batch engines add iterative processing, higher-level APIs, and faster in-memory execution.",
    ["Materializing intermediate state to disk (MapReduce) is slow for iterative algorithms.", "Spark keeps data in memory across stages for faster iteration.", "High-level APIs (Spark SQL, DataFrames) decouple logic from execution.", "Graph processing (Pregel) uses message-passing between vertices.", "Batch and stream processing are converging into unified engines."],
    [{ type: "paragraph", text: "MapReduce's rigid map-shuffle-reduce cycle forces disk writes between every stage. Modern engines materialize less, push computation to data, and expose declarative APIs — while retaining fault tolerance through lineage graphs." }],
    ["Spark", "iterative processing", "DataFrame", "Pregel", "dataflow engine"]),

  // Chapter 11
  L("transmitting-event-streams", "ch11-stream-processing", "Transmitting Event Streams",
    "Event streams deliver records continuously — via message brokers, partitioned logs, or direct sockets.",
    ["Message brokers (RabbitMQ) route messages to consumers with optional persistence.", "Partitioned logs (Kafka) retain messages for replay and multiple consumer groups.", "Producers append; consumers track their offset in the log.", "Backpressure and buffering handle speed mismatches between producers and consumers.", "Exactly-once delivery requires idempotent consumers or transactional writes."],
    [{ type: "paragraph", text: "Unlike request-response, event streams deliver a sequence of records over time. Message brokers decouple producers and consumers. Partitioned logs add durability and replay — consumers can re-read history at their own pace." },
     { type: "diagram", diagramId: "event-stream", caption: "Producers append to a partitioned log; consumer groups read at independent offsets." }],
    ["message broker", "Kafka", "partitioned log", "consumer group", "offset"]),

  L("databases-and-streams", "ch11-stream-processing", "Databases and Streams",
    "Databases and streams are two views of the same data — and keeping them in sync is the integration challenge.",
    ["Change Data Capture (CDC) streams database writes to downstream systems.", "Event sourcing stores state changes as an immutable log of events.", "The log is the system of record; materialized views are derived state.", "Dual writes to database and queue risk inconsistency.", "Transactional outbox pattern writes events atomically with state changes."],
    [{ type: "paragraph", text: "A database holds current state; a stream holds the history of changes. CDC bridges them by tailing the replication log. Event sourcing inverts the model: the log is primary, and current state is a derived view rebuilt by replay." }],
    ["CDC", "event sourcing", "materialized view", "transactional outbox"]),

  L("processing-streams", "ch11-stream-processing", "Processing Streams",
    "Stream processors apply transformations to unbounded data — windowing time is the hard part.",
    ["Uses: notifications, search indexing, metrics, fraud detection, recommendations.", "Event time (when it happened) vs processing time (when observed) diverge.", "Windowing groups events by time ranges for aggregation.", "Stream joins combine two streams or a stream with a table.", "Fault tolerance via checkpointing and replay from durable logs."],
    [{ type: "paragraph", text: "Stream processing applies computations to data in motion. Unlike batch, the input is unbounded. Key challenges: handling out-of-order events, defining time windows, and maintaining state across failures." }],
    ["stream processing", "event time", "windowing", "stream join", "checkpoint"]),

  // Chapter 12
  L("data-integration", "ch12-future-of-data-systems", "Data Integration",
    "Modern architectures combine specialized tools by deriving data through unbundled pipelines.",
    ["No single database does everything well — compose specialized systems.", "Derive views, indexes, and analytics from an immutable event log.", "Batch and stream processing both feed derived data systems.", "Unbundling the database separates storage, indexing, querying, and processing.", "Dataflow-oriented design makes integration explicit in the architecture."],
    [{ type: "paragraph", text: "The future is not one database to rule them all. Instead, systems specialize: OLTP for transactions, search index for full-text, warehouse for analytics, cache for speed. An event log connects them, and derived data flows keep views consistent." }],
    ["data integration", "unbundling", "derived data", "specialized tools"]),

  L("aiming-for-correctness", "ch12-future-of-data-systems", "Aiming for Correctness",
    "End-to-end guarantees, constraints, and verification — correctness requires deliberate design.",
    ["The end-to-end argument: low-level reliability alone does not ensure application correctness.", "Enforce constraints at the data layer where possible (unique, foreign key, check).", "Timeliness and integrity: data must be correct and arrive when needed.", "Audit trails and checksums enable trust-but-verify patterns.", "Formal verification and testing at the system boundary catch integration bugs."],
    [{ type: "paragraph", text: "Correctness is not accidental. It requires end-to-end reasoning: the database can enforce constraints, but the application must define invariants. Auditing, idempotency, and deterministic replay help verify that derived systems match the source of truth." }],
    ["end-to-end argument", "integrity", "constraint", "audit trail", "correctness"]),

  L("doing-the-right-thing", "ch12-future-of-data-systems", "Doing the Right Thing",
    "Data systems have societal impact — predictive analytics, privacy, and the ethics of data collection.",
    ["Predictive systems amplify biases present in training data.", "Privacy requires limiting collection, retention, and correlation of personal data.", "Tracking and surveillance capitalism erode user trust.", "Engineers have responsibility for how data is used, not just how it is stored.", "Regulation (GDPR) and privacy-by-design are becoming engineering requirements."],
    [{ type: "paragraph", text: "Building data systems is not value-neutral. Recommendation engines shape behavior. Predictive policing encodes historical bias. Tracking infrastructure enables surveillance. Engineers must consider who benefits, who is harmed, and what data is truly necessary." },
     { type: "callout", title: "Privacy by design", text: "Collect minimum data, encrypt at rest and in transit, provide deletion mechanisms, and make data practices transparent to users.", variant: "warning" }],
    ["privacy", "bias", "predictive analytics", "GDPR", "ethics"]),
];

const ch01 = loadCh01();
const index: Record<string, LessonSection> = { ...ch01 };

for (const lesson of newLessons) {
  index[lesson.id] = { ...lesson, media: lesson.media ?? {} };
}

writeFileSync(path.join(lessonsDir, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`Wrote ${Object.keys(index).length} lessons to content/lessons/index.json`);
