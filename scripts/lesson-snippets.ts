import type { ContentBlock } from "../src/types/content";

export function rw(text: string): ContentBlock {
  return { type: "callout", title: "In practice", text, variant: "info" };
}

export function app(name: string, text: string): ContentBlock {
  return { type: "callout", title: `${name} at scale`, text, variant: "tip" };
}

export function code(caption: string, snippet: string): ContentBlock {
  return { type: "code", language: "typescript", code: snippet, caption };
}

export function sys(diagramId: string, caption: string): ContentBlock {
  return { type: "diagram", diagramId, caption };
}

export const TS = {
  latencyPercentiles: `// Track tail latency like Google SRE handbooks recommend
const durations: number[] = [];

function recordRequest(ms: number) {
  durations.push(ms);
}

function percentile(p: number): number {
  const sorted = [...durations].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// p99 >> average is why Canva optimizes slow exports, not mean load time
console.log({ p50: percentile(50), p99: percentile(99) });`,

  prismaVsMongo: `// Airbnb-style booking: relational joins across tables (PostgreSQL + Prisma)
const booking = await prisma.booking.findUnique({
  where: { id: bookingId },
  include: { listing: true, guest: true, payments: true },
});

// Canva-style design doc: nested document (MongoDB)
const design = await db.collection("designs").findOne({
  _id: designId,
  // layers, fonts, assets embedded — one read for the whole canvas
});`,

  hashPartition: `// Kafka / DynamoDB-style partition routing
function partitionForKey(userId: string, partitionCount: number): number {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % partitionCount;
}

// WhatsApp routes messages by chat_id to the same shard for ordering
const partition = partitionForKey(chatId, 128);`,

  readYourOwnWrites: `// Facebook / Instagram: route reads to primary after posting
async function createPost(userId: string, text: string) {
  const post = await db.primary.posts.create({ data: { userId, text } });
  // Sticky session: next reads hit primary or caught-up replica
  session.set("readFromPrimaryUntil", Date.now() + 5_000);
  return post;
}

async function getFeed(userId: string) {
  const client = session.get("readFromPrimaryUntil") > Date.now()
    ? db.primary
    : db.replica;
  return client.feed.findMany({ where: { userId } });
}`,

  prismaTransaction: `// Airbnb booking: debit guest + credit host atomically
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({
    data: { listingId, guestId, checkIn, checkOut },
  });
  await tx.payment.create({
    data: { bookingId: booking.id, amountCents, status: "CAPTURED" },
  });
  await tx.availability.update({
    where: { listingId_date: { listingId, date: checkIn } },
    data: { available: false },
  });
});`,

  idempotencyStripe: `// Stripe-style idempotency — safe retries over unreliable networks
async function chargeCard(req: Request) {
  const idempotencyKey = req.headers.get("Idempotency-Key");
  const existing = await redis.get(\`idem:\${idempotencyKey}\`);
  if (existing) return JSON.parse(existing);

  const result = await paymentService.charge(/* ... */);
  await redis.setex(\`idem:\${idempotencyKey}\`, 86400, JSON.stringify(result));
  return result;
}`,

  kafkaConsumer: `// LinkedIn / Uber-style Kafka consumer with offset tracking
async function consumeMessages(groupId: string) {
  const consumer = kafka.consumer({ groupId });
  await consumer.subscribe({ topic: "user-events" });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const event = JSON.parse(message.value!.toString());
      await processEvent(event); // must be idempotent for at-least-once
      // offset committed after processing (or in transaction with side effect)
    },
  });
}`,

  redisCache: `// Facebook feed cache-aside pattern
async function getFeed(userId: string): Promise<Post[]> {
  const cacheKey = \`feed:\${userId}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const posts = await db.posts.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  await redis.setex(cacheKey, 300, JSON.stringify(posts));
  return posts;
}`,

  websocketCanva: `// Canva-style real-time collaboration over WebSocket
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req) => {
  const designId = new URL(req.url!, "http://x").searchParams.get("designId");
  ws.on("message", (raw) => {
    const op = JSON.parse(raw.toString()) as DesignOperation;
    // Apply CRDT / OT merge, then broadcast to all peers on this design
    const merged = collabEngine.apply(designId!, op);
    broadcast(designId!, { type: "sync", state: merged });
  });
});`,

  cdcOutbox: `// Transactional outbox — Airbnb / Shopify event publishing
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderInput });
  await tx.outboxEvent.create({
    data: {
      aggregateId: order.id,
      type: "OrderPlaced",
      payload: JSON.stringify(order),
    },
  });
});
// Separate relay process reads outbox → publishes to Kafka`,

  sagaBooking: `// Microservice SAGA — compensate if payment fails (Airbnb-style)
async function bookListing(input: BookingInput) {
  const hold = await inventoryService.reserve(input); // step 1
  try {
    const payment = await paymentService.charge(input); // step 2
    await notificationService.sendConfirmation(input); // step 3
    return { hold, payment };
  } catch (err) {
    await inventoryService.release(hold.id); // compensating transaction
    throw err;
  }
}`,

  snowflakeQuery: `// Google BigQuery / Snowflake — declarative OLAP over columnar storage
const revenueByRegion = await snowflake.execute(\`
  SELECT d.region, SUM(f.revenue_cents) AS total
  FROM fact_orders f
  JOIN dim_date d ON f.order_date = d.date_key
  WHERE d.year = 2025
  GROUP BY d.region
  ORDER BY total DESC
\`);
// Optimizer reads only region + revenue columns — not full rows`,

  cypherGraph: `// LinkedIn-style graph traversal (Cypher / Neo4j pattern)
const mutualConnections = await graph.run(\`
  MATCH (me:User {id: $userId})-[:CONNECTED_TO]-(friend)-[:CONNECTED_TO]-(fof)
  WHERE fof.id <> $userId AND NOT (me)-[:CONNECTED_TO]-(fof)
  RETURN DISTINCT fof.id, fof.name LIMIT 50
\`, { userId });
// Multi-hop in one declarative query — expensive as SQL recursive CTE`,

  lsmVsBtree: `// Storage engine trade-off: LSM append vs B-tree in-place update
// LSM (RocksDB / Cassandra): batch writes to memtable → SSTable segments
await rocksdb.put(key, value); // append-only, compaction merges later

// B-tree (PostgreSQL InnoDB): update page in place on disk
await db.query("UPDATE users SET balance = $1 WHERE id = $2", [newBal, id]);
// Predictable reads; random writes cost more on spinning disks`,

  protobufEncode: `// Canva / gRPC — Protocol Buffers with forward-compatible field tags
// message Design { string id = 1; repeated Layer layers = 2; string title = 3; }
const payload = Design.encode({
  id: designId,
  layers: canvasLayers,
  title: "Untitled",
}).finish();
// New field tag 4 added in v2 — old clients ignore unknown tags`,

  grpcDataflow: `// Airbnb microservices — synchronous gRPC between booking services
const listing = await listingsClient.getListing({ id: listingId });
const availability = await calendarClient.checkDates({
  listingId,
  checkIn,
  checkOut,
});
// REST/GraphQL for browsers; gRPC for internal service-to-service calls`,

  walReplication: `// WhatsApp-style leader → follower replication via write-ahead log
async function replicateWrite(entry: WalEntry) {
  await leader.appendWal(entry);
  for (const follower of followers) {
    follower.streamWal((e) => follower.apply(e)); // async tail of leader log
  }
  return leader.confirmWrite(entry.lsn);
}`,

  quorumRead: `// DynamoDB-style quorum: W + R > N ensures read/write overlap
const N = 3, W = 2, R = 2;
async function write(key: string, value: VersionedValue) {
  const nodes = pickNodes(key, N);
  await Promise.all(nodes.slice(0, W).map((n) => n.put(key, value)));
}
async function read(key: string) {
  const nodes = pickNodes(key, N);
  const versions = await Promise.all(nodes.slice(0, R).map((n) => n.get(key)));
  return versions.sort((a, b) => b.version - a.version)[0];
}`,

  consistentHashing: `// Netflix / Cassandra — consistent hashing limits key movement on rebalance
function hashRing(key: string, nodes: string[]): string {
  const ring = nodes.flatMap((n) =>
    Array.from({ length: 128 }, (_, i) => ({ hash: hash(\`\${n}:\${i}\`), node: n }))
  ).sort((a, b) => a.hash - b.hash);
  const h = hash(key);
  return ring.find((e) => e.hash >= h)?.node ?? ring[0].node;
}
// Adding one node moves only ~1/N of keys — not hash(key) % N`,

  scatterGather: `// Airbnb search — secondary index scatter-gather across shards
async function searchByCity(city: string): Promise<Listing[]> {
  const shards = await router.allShards();
  const partial = await Promise.all(
    shards.map((s) => s.query("SELECT * FROM listings WHERE city = $1", [city]))
  );
  return partial.flat().sort((a, b) => b.rating - a.rating).slice(0, 50);
}`,

  routeToPartition: `// Twitter/X routing — gateway caches partition map, forwards by key
function routeRequest(userId: string, partitionMap: Map<number, string>) {
  const partition = hashPartition(userId, partitionMap.size);
  const host = partitionMap.get(partition)!;
  return proxy.forward(host, { userId }); // mongos / Envoy style
}`,

  isolationLevels: `// PostgreSQL isolation — pick the weakest level that is safe
await db.query("BEGIN ISOLATION LEVEL READ COMMITTED");
const row = await db.query("SELECT stock FROM inventory WHERE sku = $1", [sku]);
if (row.stock < qty) throw new Error("insufficient stock");
await db.query("UPDATE inventory SET stock = stock - $1 WHERE sku = $2", [qty, sku]);
await db.query("COMMIT");
// SERIALIZABLE or SELECT FOR UPDATE needed to prevent write skew`,

  serializableSSI: `// Google Spanner / PostgreSQL SSI — detect conflicts at commit time
await db.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
const seats = await db.query(
  "SELECT COUNT(*) FROM bookings WHERE flight_id = $1 AND seat_taken = true", [flightId]
);
if (seats.count >= maxSeats) throw new Error("flight full");
await db.query("INSERT INTO bookings (flight_id, user_id) VALUES ($1, $2)", [flightId, userId]);
await db.query("COMMIT"); // aborts if concurrent txn created a serializability conflict`,

  grpcTimeout: `// Uber microservices — gRPC deadlines detect slow/dead peers
const deadline = Date.now() + 3_000;
const trip = await tripClient.getTrip(
  { tripId },
  { deadline }, // client aborts after 3s — cannot distinguish slow vs dead
);
// Envoy retry policy + circuit breaker stops cascading timeouts`,

  monotonicClock: `// Kafka / Flink — never order events by NTP wall clock alone
const start = process.hrtime.bigint(); // monotonic — safe for timeouts
await doWork();
const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;

// Event time from producer timestamp; processing time = when consumer sees it
const window = tumblingWindow(event.timestamp, Duration.ofMinutes(5));`,

  fencingToken: `// Shopify leader election — fencing token blocks stale primary writes
const token = await etcd.getLease().then((l) => l.fencingToken);
async function writeToSharedStore(key: string, value: string) {
  const current = await storage.getFencingToken(key);
  if (token < current) throw new Error("stale leader — fenced");
  await storage.put(key, value, { fencingToken: token });
}`,

  tunableConsistency: `// Meta / DynamoDB — tune read consistency per request
// Eventual (default): fast, may return stale replica
const feed = await dynamodb.get({ Key: { userId }, ConsistentRead: false });

// Strong: R + W > N — waits for quorum overlap
const balance = await dynamodb.get({ Key: { accountId }, ConsistentRead: true });`,

  compareAndSet: `// LinkedIn distributed lock — linearizable compare-and-set
async function acquireLock(resource: string): Promise<boolean> {
  const ok = await etcd.put(resource, nodeId, {
    prevExist: "false", // only succeeds if key absent — atomic
  });
  return ok;
}
// Stale leader cannot steal lock without seeing current holder`,

  unixPipeline: `// Google SRE log triage — composable Unix-style pipeline
// cat access.log | grep '" 5' | awk '{print $7}' | sort | uniq -c | sort -rn
const lines = await readFile("access.log", "utf8");
const errors = lines.split("\\n")
  .filter((l) => l.includes('" 5'))
  .map((l) => l.split(" ")[6]);
const counts = Object.fromEntries(
  [...new Set(errors)].map((p) => [p, errors.filter((e) => e === p).length])
);`,

  sparkBatch: `// LinkedIn analytics — Spark batch over immutable Parquet on S3
const dailyActive = spark.read.parquet("s3://events/dt=2025-06-01/")
  .filter(col("event") === "login")
  .groupBy("user_id")
  .agg(count("*").as("logins"));
dailyActive.write.mode("overwrite").parquet("s3://metrics/dau/");
// Lineage graph retries failed stages — no full job restart`,

  flinkWindow: `// Uber surge pricing — Flink tumbling window on ride stream
stream
  .keyBy((event) => event.geoHash)
  .window(TumblingEventTimeWindows.of(Time.minutes(5)))
  .aggregate({
    add: (acc, ride) => ({ count: acc.count + 1, fare: acc.fare + ride.fare }),
    getResult: (acc) => acc,
  })
  .filter((stats) => stats.count > demandThreshold)
  .map((stats) => ({ geoHash: stats.key, surgeMultiplier: 1.5 }));`,

  oauthAuth: `// Netflix / Auth0 — OAuth 2.0 authorization code flow for user identity
const authUrl = oauth.authorizeUrl({
  clientId: process.env.OAUTH_CLIENT_ID!,
  redirectUri: "https://app.example/callback",
  scope: "openid profile email",
  state: crypto.randomUUID(),
});
// Token exchange happens server-side; access token scoped to minimum permissions`,

  olapEtl: `// Shopify OLTP → OLAP — never run heavy scans on production Postgres
// Step 1: CDC from Aurora PostgreSQL
const changes = debezium.stream("shopify.orders");
// Step 2: land in Snowflake star schema for BI dashboards
await snowflake.merge("fact_orders", changes, { key: "order_id" });`,
};