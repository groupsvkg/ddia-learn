import { Window } from "happy-dom";
import mermaid from "mermaid";
import { MERMAID_SEQ } from "./mermaid-diagrams";

const window = new Window();
Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
});

mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });

/** Mermaid treats semicolons as statement terminators in sequence diagram messages. */
function checkSequenceSyntax(id: string, source: string): string | null {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!/^(->>|-->>|-x>>|x-->>)/.test(trimmed)) continue;
    const msg = trimmed.split(/:(.+)/)[1]?.trim();
    if (msg && /;/.test(msg) && !msg.startsWith('"')) {
      return `${id}: unquoted semicolon in message "${msg}"`;
    }
  }
  return null;
}

let failures = 0;

for (const [id, source] of Object.entries(MERMAID_SEQ)) {
  const trimmed = source.trim();
  try {
    const syntaxErr = checkSequenceSyntax(id, trimmed);
    if (syntaxErr) throw new Error(syntaxErr);
    await mermaid.parse(trimmed);
    console.log(`✓ sequence ${id}`);
  } catch (err) {
    failures++;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✗ sequence ${id}`);
    console.error(`  ${message.split("\n")[0]}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} sequence diagram(s) failed validation.`);
  process.exit(1);
}

console.log(`\nAll ${Object.keys(MERMAID_SEQ).length} sequence diagrams validated.`);