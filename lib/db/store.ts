import { promises as fs } from "fs";
import path from "path";

/**
 * Lightweight file-based data store.
 *
 * This is a working local/demo persistence layer so the admin panel is fully
 * functional out of the box with zero external services configured.
 *
 * PRODUCTION NOTE: Vercel's filesystem is read-only/ephemeral outside of
 * /tmp, so this store will NOT persist across deploys or serverless
 * invocations in production. Before going live, swap this module for the
 * Neon Postgres + Drizzle ORM setup described in README.md ("Upgrading to
 * production persistence"). The function signatures below were kept
 * deliberately simple (readAll/writeAll per collection) so that swap is a
 * localized change — only this file needs to be replaced with Drizzle
 * queries, nothing that imports it needs to change.
 */

const DB_DIR = path.join(process.cwd(), "data", "db");

async function ensureDir() {
  await fs.mkdir(DB_DIR, { recursive: true });
}

async function readAll<T>(collection: string, fallback: T[]): Promise<T[]> {
  await ensureDir();
  const file = path.join(DB_DIR, `${collection}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    await fs.writeFile(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeAll<T>(collection: string, data: T[]): Promise<void> {
  await ensureDir();
  const file = path.join(DB_DIR, `${collection}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export const store = { readAll, writeAll };
