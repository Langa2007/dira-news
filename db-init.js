import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { localConnectionArgs, localConnectionEnv, getDatabaseConfig } from "./database.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationName = "20260605180823_phase_one_backend";
const migrationPath = path.join(__dirname, "backend", "prisma", "migrations", migrationName, "migration.sql");

const seedSql = `
INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('perm-users-read', 'users.read', 'users.read'),
  ('perm-sources-manage', 'sources.manage', 'sources.manage'),
  ('perm-articles-write', 'articles.write', 'articles.write'),
  ('perm-articles-review', 'articles.review', 'articles.review'),
  ('perm-articles-publish', 'articles.publish', 'articles.publish'),
  ('perm-ai-outputs-read', 'ai.outputs.read', 'ai.outputs.read'),
  ('perm-recommendations-manage', 'recommendations.manage', 'recommendations.manage'),
  ('perm-publishing-manage', 'publishing.manage', 'publishing.manage')
ON CONFLICT ("key") DO UPDATE SET "description" = EXCLUDED."description";

INSERT INTO "Role" ("id", "key", "name") VALUES
  ('role-reader', 'reader', 'Reader'),
  ('role-editor', 'editor', 'Editor'),
  ('role-editor-in-chief', 'editor_in_chief', 'Editor in Chief'),
  ('role-admin', 'admin', 'Admin')
ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
  ('role-editor', 'perm-articles-write'),
  ('role-editor', 'perm-articles-review'),
  ('role-editor', 'perm-ai-outputs-read'),
  ('role-editor-in-chief', 'perm-articles-write'),
  ('role-editor-in-chief', 'perm-articles-review'),
  ('role-editor-in-chief', 'perm-articles-publish'),
  ('role-editor-in-chief', 'perm-ai-outputs-read'),
  ('role-editor-in-chief', 'perm-publishing-manage'),
  ('role-admin', 'perm-users-read'),
  ('role-admin', 'perm-sources-manage'),
  ('role-admin', 'perm-articles-write'),
  ('role-admin', 'perm-articles-review'),
  ('role-admin', 'perm-articles-publish'),
  ('role-admin', 'perm-ai-outputs-read'),
  ('role-admin', 'perm-recommendations-manage'),
  ('role-admin', 'perm-publishing-manage')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "Topic" ("id", "name", "slug", "category") VALUES
  ('topic-local', 'Local', 'local', 'LOCAL'),
  ('topic-world', 'World', 'world', 'WORLD'),
  ('topic-politics', 'Politics', 'politics', 'POLITICS'),
  ('topic-business', 'Business', 'business', 'BUSINESS'),
  ('topic-technology', 'Technology', 'technology', 'TECHNOLOGY'),
  ('topic-sports', 'Sports', 'sports', 'SPORTS'),
  ('topic-entertainment', 'Entertainment', 'entertainment', 'ENTERTAINMENT'),
  ('topic-health', 'Health', 'health', 'HEALTH'),
  ('topic-education', 'Education', 'education', 'EDUCATION'),
  ('topic-opinion', 'Opinion', 'opinion', 'OPINION')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "category" = EXCLUDED."category";
`;

function runPsql({ sql, stdin, label }) {
  const local = getDatabaseConfig("local");

  return new Promise((resolve, reject) => {
    const child = spawn("psql", localConnectionArgs(local), {
      env: localConnectionEnv(local),
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";

    if (stdin) {
      stdin.pipe(child.stdin);
    } else {
      child.stdin.end(sql || "");
    }

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        if (stdout.trim()) {
          console.log(stdout.trim());
        }
        resolve(stdout);
        return;
      }

      reject(new Error(`${label} failed:\n${stderr || stdout}`));
    });
  });
}

async function migrationChecksum() {
  const { createHash } = await import("node:crypto");
  const sql = await readFile(migrationPath);

  return createHash("sha256").update(sql).digest("hex");
}

async function main() {
  const local = getDatabaseConfig("local");
  const reset = process.argv.includes("--reset");

  console.log(`Connecting to local database "${local.database}" at ${local.host}:${local.port} as ${local.user}`);

  await runPsql({
    label: "Connection check",
    sql: "select current_database() as database, current_user as user_name;"
  });

  if (reset) {
    console.log("Resetting public schema...");
    await runPsql({
      label: "Schema reset",
      sql: 'drop schema if exists public cascade; create schema public;'
    });
  }

  console.log("Applying Prisma migration SQL...");
  await runPsql({
    label: "Schema migration",
    stdin: createReadStream(migrationPath)
  });

  console.log("Recording Prisma migration history...");
  const checksum = await migrationChecksum();
  await runPsql({
    label: "Migration history",
    sql: `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES
  ('20260605180823-phase-one-backend', '${checksum}', now(), '${migrationName}', NULL, NULL, now(), 1)
ON CONFLICT ("id") DO UPDATE SET
  "checksum" = EXCLUDED."checksum",
  "finished_at" = EXCLUDED."finished_at",
  "migration_name" = EXCLUDED."migration_name",
  "applied_steps_count" = EXCLUDED."applied_steps_count";
`
  });

  console.log("Seeding roles, permissions, and topics...");
  await runPsql({
    label: "Seed",
    sql: seedSql
  });

  console.log("Verifying database...");
  await runPsql({
    label: "Verification",
    sql: `
select count(*) as public_tables from information_schema.tables where table_schema = 'public';
select count(*) as roles from "Role";
select count(*) as permissions from "Permission";
select count(*) as topics from "Topic";
`
  });

  console.log("Local database initialized.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
