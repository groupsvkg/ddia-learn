# DDIA Learn

An interactive study companion for *Designing Data-Intensive Applications* by Martin Kleppmann. Built with Next.js, shadcn/ui, and deployed to Cloudflare Workers via OpenNext.

## Quick start

```bash
bun install
bun run dev          # Next.js dev server (http://localhost:3000)
bun run preview      # Cloudflare workerd preview (http://localhost:8787)
bun run deploy       # Deploy to Cloudflare Workers
```

## Content

- Full curriculum scaffold: 12 chapters across 3 parts
- Chapter 1 lessons are fully authored (4 sections)
- Chapters 2–12 show "Coming Soon" placeholders

## Regenerate content assets

```bash
bun run content:build   # Regenerate lessons index from source definitions
bun run content:media   # Regenerate media manifest
```

Grok Imagine images live in `public/media/`. Technical diagrams with exact labels are code-built SVG components.

Add shadcn components with:

```bash
bunx shadcn@latest add <component>
```

## Deploy to Cloudflare

```bash
export CLOUDFLARE_API_TOKEN=your_token
bun run deploy
```

## Disclaimer

Inspired by DDIA by Martin Kleppmann. Independent study companion — not affiliated with O'Reilly Media.
