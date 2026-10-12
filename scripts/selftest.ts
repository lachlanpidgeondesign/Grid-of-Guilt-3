// Grid of Guilt — self-test runner.
//
// A flat list of named assertions, run in order. Each prints `PASS <name>` or
// `FAIL <name>: <reason>`. The run ends with `SELFTEST PASS (n)` when all pass,
// or `SELFTEST FAIL (k of n)` and exit code 1 when any fail.
//
// Pure logic only: no DOM, no React. New phases append assertions here.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// loadLevel() fetches its JSON by URL. Under Node there is no file: fetch, so
// install a minimal shim that serves file: URLs from disk and defers anything
// else to the platform fetch. This lets the self-test exercise loadLevel for
// real (URL building, buildLevel, clue validation) rather than side-stepping it.
const nativeFetch = globalThis.fetch?.bind(globalThis);
globalThis.fetch = (async (input: any, init?: any) => {
  const url = typeof input === "string" ? input : input?.url ?? String(input);
  if (url.startsWith("file:")) {
    try {
      const body = await readFile(fileURLToPath(url), "utf8");
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(body),
        text: async () => body,
      } as Response;
    } catch (error) {
      return {
        ok: false,
        status: 404,
        json: async () => { throw error; },
        text: async () => { throw error; },
      } as Response;
    }
  }
  if (!nativeFetch) throw new Error(`No fetch available for ${url}`);
  return nativeFetch(input, init);
}) as typeof fetch;

import { loadLevel, type LevelId } from "../src/app/levels/loadLevel";

// ── Tiny assertion harness ─────────────────────────────────────────────────
type Check = () => void | Promise<void>;
interface Assertion { name: string; check: Check; }

const assertions: Assertion[] = [];
function test(name: string, check: Check): void {
  assertions.push({ name, check });
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

// ── Assertions ─────────────────────────────────────────────────────────────

const LEVEL_SIZES: Record<LevelId, number> = { easy: 5, medium: 7, hard: 9 };

test("all three levels load via loadLevel", async () => {
  for (const id of ["easy", "medium", "hard"] as LevelId[]) {
    const level = await loadLevel(id);
    assert(level.N === LEVEL_SIZES[id], `${id}: expected N=${LEVEL_SIZES[id]}, got ${level.N}`);
    assert(level.clues.length === level.N, `${id}: expected ${level.N} clues, got ${level.clues.length}`);
    assert(level.sol.length === level.N, `${id}: expected ${level.N} solution cells, got ${level.sol.length}`);
  }
});

// ── Runner ─────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  let failures = 0;
  for (const { name, check } of assertions) {
    try {
      await check();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures++;
      console.log(`FAIL ${name}: ${(error as Error).message}`);
    }
  }
  const total = assertions.length;
  if (failures === 0) {
    console.log(`SELFTEST PASS (${total})`);
  } else {
    console.log(`SELFTEST FAIL (${failures} of ${total})`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
