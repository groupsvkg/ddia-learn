# DDIA Learn

An interactive study companion for [*Designing Data-Intensive Applications*](https://dataintensive.net/) by Martin Kleppmann. Built with **Next.js 16**, **shadcn/ui**, and **Bun** — deployed to **Cloudflare Workers** via OpenNext.

**Live site:** [ddia-learn.exactcover.workers.dev](https://ddia-learn.exactcover.workers.dev/)

## Screenshots

### Home & curriculum

Browse all 12 DDIA chapters plus 10 system design case studies across 4 parts. Every chapter is available with structured lessons, key takeaways, and navigation.

![Home page with curriculum overview and sidebar navigation](docs/screenshots/home.png)

### Lesson page

Each lesson combines explanatory prose, real-world company examples, and related concepts — with a collapsible sidebar for quick chapter hopping.

![Lesson page — Thinking About Data Systems with sidebar and callouts](docs/screenshots/lesson-overview.png)

### Technical & system diagrams

Concept diagrams (replication, partitioning, quorums) and architecture overviews for products like Airbnb, WhatsApp, and Canva — rendered as code-built SVGs. Case studies add **Mermaid** architecture and sequence diagrams with step-by-step walkthroughs.

![Leader-follower replication diagram with In practice callout](docs/screenshots/lesson-diagram.png)

![Modern SaaS data stack system diagram — PostgreSQL, Redis, Kafka, Elasticsearch, Snowflake](docs/screenshots/system-diagram-full.png)

### TypeScript code examples

Lessons include copy-ready TypeScript snippets: Prisma transactions, Kafka consumers, idempotency keys, circuit breakers, and more — tied to how Stripe, Airbnb, and Google build production systems.

![Lesson with TypeScript code block and Stripe at scale example](docs/screenshots/lesson-code.png)

## Features

- **79 lessons** across **22 chapters** in **4 parts** — DDIA book content (Parts 1–3) plus a **System Design** track (Part 4)
- **10 case studies** — YouTube, WhatsApp, reservation booking, voting, multiplayer games, puzzle games, multistep workflows, collaboration tools, and multistep forms
- **Requirements & back-of-the-envelope** lessons for every case study
- **Mermaid diagrams** — architecture and sequence diagrams (client-side rendered)
- **Technical diagrams** — leader-follower, hash partitioning, quorums, MapReduce, event streams (code-built SVG)
- **TypeScript examples** in every lesson with real-world tooling (PostgreSQL, Redis, Kafka, Kubernetes, etc.)
- **Company at scale** callouts — WhatsApp, Facebook, Google, Canva, Airbnb, Stripe, Uber, Netflix
- **Expandable, resizable sidebar** with chapter navigation
- **Cloudflare Workers** — fully static generation with edge-cached prerendered pages

## Quick start

```bash
bun install
bun run dev          # Next.js dev server → http://localhost:3000
bun run preview      # Cloudflare workerd preview → http://localhost:8787
bun run deploy       # Build + deploy to Cloudflare Workers
```

## Content

| Path | Description |
|------|-------------|
| `content/curriculum.json` | Book structure — parts, chapters, sections |
| `content/lessons/{lesson-id}.json` | Per-lesson bodies (loaded individually at build/runtime) |
| `content/lessons/index.json` | Combined lesson index (generated) |
| `content/lessons/ch01-*.json` | Chapter 1 source lessons |
| `scripts/generate-all-lessons.ts` | Regenerate all lesson JSON from definitions |
| `scripts/system-design-lessons.ts` | System design case study lesson definitions |
| `scripts/mermaid-diagrams.ts` | Mermaid architecture & sequence diagram sources |
| `scripts/architecture-walkthrough.ts` | Numbered step-by-step diagram walkthroughs |
| `scripts/capacity-estimates.ts` | Back-of-the-envelope estimation blocks |
| `scripts/tech-choices.ts` | "Why this technology?" rationale blocks |
| `scripts/validate-mermaid.ts` | Validate sequence diagram syntax before build |
| `scripts/lesson-snippets.ts` | Shared TypeScript snippets and content helpers |
| `public/media/` | Grok Imagine concept images (ch01) |
| `src/components/ddia/technical-diagram.tsx` | Code-built SVG technical & system diagrams |
| `src/components/ddia/mermaid-diagram-lazy.tsx` | Client-only Mermaid renderer |

Regenerate lesson content:

```bash
bun run content:validate  # Check Mermaid sequence diagrams parse correctly
bun run content:build     # Validate + regenerate index.json and per-lesson files
bun run content:media     # Update media manifest
```

Add shadcn components:

```bash
bunx shadcn@latest add <component>
```

## Deploy to Cloudflare

Production: [https://ddia-learn.exactcover.workers.dev/](https://ddia-learn.exactcover.workers.dev/)

```bash
export CLOUDFLARE_API_TOKEN=your_token
bun run deploy
```

Deploy runs `opennextjs-cloudflare build` then `deploy`, which:

1. Pre-renders all 109 routes at build time (SSG)
2. Populates **static assets incremental cache** (`cdn-cgi/_next_cache/`) so navigation is served from edge cache instead of re-rendering in the Worker
3. Uploads the Worker bundle and static assets via Wrangler

This cache is configured in `open-next.config.ts` and is required for reliable client-side navigation on Workers (without it, concurrent RSC requests can return 503 errors).

## Tech stack

- **Runtime / package manager:** Bun
- **Framework:** Next.js 16 (App Router, SSG)
- **UI:** shadcn/ui + Tailwind CSS
- **Diagrams:** Mermaid (client-side), custom SVG components
- **Deploy:** `@opennextjs/cloudflare` + Wrangler

## Disclaimer

Inspired by [*Designing Data-Intensive Applications*](https://dataintensive.net/) by Martin Kleppmann — use alongside your own copy of the book. Independent study companion; not affiliated with O'Reilly Media or the author.