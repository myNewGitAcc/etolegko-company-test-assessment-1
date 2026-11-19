#!/usr/bin/env node
/**
 * Usage: pnpm run fetch --url <url> --queries <number>
 * Requires Node.js 18+ (built-in fetch).
 */

import { parseArgs as parseNodeArgs } from "node:util";

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

const USAGE = `Usage: pnpm run fetch --url <url> --queries <number>

Options:
  --url      URL to fetch (required)
  --queries  Number of sequential requests to make (required, positive integer)
  --help     Show this message

Example:
  pnpm run fetch --url 'https://example.com/file.zip' --queries 10`;

function fail(message: string): never {
  console.error(`Error: ${message}\n\n${USAGE}`);
  process.exit(1);
}

function parseArgs(): { url: string; maxAttempts: number } {
  let parsed: {
    values: { url?: string; queries?: string; help?: boolean };
    positionals: string[];
  };
  
  try {
    parsed = parseNodeArgs({
      options: {
        url: { type: "string" },
        queries: { type: "string" },
        help: { type: "boolean" },
      },
      allowPositionals: true, // so we can give a clear error for bare values
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
  
  const { values, positionals } = parsed;
  
  if (values.help) {
    console.log(USAGE);
    process.exit(0);
  }
  
  if (positionals.length > 0) {
    fail(
      `unexpected value(s) without a name: ${positionals.join(" ")}. ` +
      "Pass them as --url <url> --queries <number>."
    );
  }
  
  const { url, queries: attempts } = values;
  
  if (!url) fail("missing required --url");
  if (!attempts) fail("missing required --queries");
  
  try {
    new URL(url);
  } catch {
    fail(`--url is not a valid URL: ${url}`);
  }
  
  const maxAttempts = Number(attempts);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    fail(`--queries must be a positive integer, got: ${attempts}`);
  }
  
  return { url, maxAttempts };
}

async function main(): Promise<void> {
  const { url, maxAttempts } = parseArgs();
  
  let successfulAttempts = 0;
  let totalTimeMs = 0; // time spent on successful requests only
  let totalBytes = 0;
  
  for (let i = 1; i <= maxAttempts; i++) {
    const start = performance.now();
    try {
      const response = await fetch(url);
      const body = await response.arrayBuffer(); // wait for full download
      const elapsed = performance.now() - start;
      
      if (!response.ok) {
        console.error(`Attempt ${i}/${maxAttempts}: HTTP ${response.status}`);
        continue;
      }
      
      successfulAttempts++;
      totalTimeMs += elapsed;
      totalBytes += body.byteLength;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Attempt ${i}/${maxAttempts}: ${message}`);
    }
  }
  
  const avgTimeMs = successfulAttempts ? totalTimeMs / successfulAttempts : 0;
  const speed = totalTimeMs ? totalBytes / (totalTimeMs / 1000) : 0;
  
  console.log(`Successful requests: ${successfulAttempts}/${maxAttempts}`);
  console.log(`Average time of request processing: ${avgTimeMs.toFixed(2)} ms`);
  console.log(`Total downloaded size: ${formatBytes(totalBytes)}`);
  console.log(`Download speed: ${formatBytes(speed)}/s`);
}

void main();
