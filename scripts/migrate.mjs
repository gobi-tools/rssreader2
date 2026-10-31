/**
 * Applies pending drizzle migrations using production dependencies only
 * (drizzle-kit is a devDependency and is not in the runtime image).
 *
 * Run inside the container:
 *   docker compose -f docker-compose.prod.yml exec app node scripts/migrate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const url = process.env.DATABASE_URL ?? './data/app.sqlite';

fs.mkdirSync(path.dirname(url), { recursive: true });

const sqlite = new Database(url);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle' });

console.log(`[migrate] migrations up to date (${url})`);
sqlite.close();
