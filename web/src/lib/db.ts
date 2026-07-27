import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { Pool, type QueryResultRow } from "pg";

type QueryResult<T> = { rows: T[]; rowCount: number | null };

export type DbClient = {
  mode: "pglite" | "postgres";
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => Promise<QueryResult<T>>;
};

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  score INTEGER,
  summary_critical INTEGER NOT NULL DEFAULT 0,
  summary_serious INTEGER NOT NULL DEFAULT 0,
  summary_moderate INTEGER NOT NULL DEFAULT 0,
  summary_minor INTEGER NOT NULL DEFAULT 0,
  wcag_level_target TEXT NOT NULL DEFAULT 'AA',
  error_message TEXT
)`,
  `CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  rule_id TEXT,
  wcag_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL,
  impact TEXT NOT NULL,
  category TEXT NOT NULL,
  selector TEXT NOT NULL,
  html_snippet TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  help_url TEXT,
  ai_explanation TEXT,
  ai_remediation TEXT,
  ai_confidence DOUBLE PRECISION,
  sort_order INTEGER NOT NULL DEFAULT 0
)`,
  `CREATE INDEX IF NOT EXISTS issues_scan_id_idx ON issues (scan_id)`,
];

const globalDb = globalThis as typeof globalThis & {
  __lumenDbPromise?: Promise<DbClient>;
};

function pgliteDataDir(): string {
  return (
    process.env.PGLITE_DATA_DIR ||
    path.join(process.cwd(), "data", "lumen-pg")
  );
}

async function createPGliteClient(): Promise<DbClient> {
  const dataDir = pgliteDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  const pglite = new PGlite(dataDir);

  return {
    mode: "pglite",
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      params: unknown[] = [],
    ) {
      const result = await pglite.query<T>(text, params);
      return {
        rows: result.rows ?? [],
        rowCount: result.affectedRows ?? result.rows?.length ?? 0,
      };
    },
  };
}

async function createPostgresClient(connectionString: string): Promise<DbClient> {
  const pool = new Pool({ connectionString });
  return {
    mode: "postgres",
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      params: unknown[] = [],
    ) {
      const result = await pool.query<T>(text, params);
      return { rows: result.rows, rowCount: result.rowCount };
    },
  };
}

async function migrate(db: DbClient): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.query(statement);
  }
}

export async function getDb(): Promise<DbClient> {
  if (!globalDb.__lumenDbPromise) {
    globalDb.__lumenDbPromise = (async () => {
      const databaseUrl = process.env.DATABASE_URL?.trim();
      const db = databaseUrl
        ? await createPostgresClient(databaseUrl)
        : await createPGliteClient();
      await migrate(db);
      return db;
    })().catch((error) => {
      globalDb.__lumenDbPromise = undefined;
      throw error;
    });
  }
  return globalDb.__lumenDbPromise;
}

export function getDbModeLabel(): string {
  return process.env.DATABASE_URL?.trim() ? "postgres" : "pglite";
}
