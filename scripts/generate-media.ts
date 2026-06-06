/**
 * Grok Imagine media pipeline manifest.
 * Run image_gen / image_to_video in Grok Build, then copy outputs into public/media/.
 * Videos require image_to_video from a generated first frame (6s shots).
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

const manifest = {
  styleGuide:
    "Dark editorial tech illustration, teal/amber accents, no text labels, 16:9 for heroes.",
  chapters: {
    ch01: [
      {
        id: "data-systems-hero",
        tool: "image_gen",
        prompt:
          "Abstract isometric illustration of interconnected data system components with database, cache, queue, and search nodes.",
        output: "public/media/ch01/data-systems-hero.png",
        status: "generated",
      },
      {
        id: "scaling-load",
        tool: "image_gen",
        prompt:
          "Horizontal scaling metaphor with load balancer distributing traffic across server racks.",
        output: "public/media/ch01/scaling-load.png",
        status: "generated",
      },
      {
        id: "complexity-metaphor",
        tool: "image_gen",
        prompt: "Tangled wires transforming into organized circuit board — complexity management metaphor.",
        output: "public/media/ch01/complexity-metaphor.png",
        status: "generated",
      },
      {
        id: "scaling-video",
        tool: "image_to_video",
        prompt: "Slow camera push-in over glowing traffic streams flowing across server racks.",
        output: "public/media/ch01/scaling-load-6s.mp4",
        status: "pending",
        note: "Requires image_to_video tool; generate from scaling-load frame.",
      },
    ],
  },
};

writeFileSync(
  path.join(path.resolve(import.meta.dirname, ".."), "content/media-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

console.log("Media manifest written to content/media-manifest.json");
