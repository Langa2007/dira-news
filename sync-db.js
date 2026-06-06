import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import dotenv from "dotenv";
import { getDatabaseConfig, localConnectionArgs, localConnectionEnv } from "./database.config.js";

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dumpFile = path.join(__dirname, "dira_dump.sql");

function sanitizeDatabaseUrl(rawUrl) {
  const url = new URL(rawUrl);
  const allowedParams = new Set(["sslmode", "sslcert", "sslkey", "sslrootcert", "channel_binding", "connect_timeout"]);

  for (const key of [...url.searchParams.keys()]) {
    if (!allowedParams.has(key)) {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: options.env || process.env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    let stderr = "";

    if (options.stdin) {
      options.stdin.pipe(child.stdin);
    } else {
      child.stdin.end();
    }

    if (options.stdout) {
      options.stdout.on("finish", resolve);
      child.stdout.pipe(options.stdout);
    }

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
        return;
      }

      if (!options.stdout) {
        resolve();
      }
    });
  });
}

async function syncDatabase() {
  const local = getDatabaseConfig("local");
  const neon = getDatabaseConfig("neon");

  if (!neon.url) {
    throw new Error("Missing Neon URL. Set DATABASE_URL_NEON in .env or database.config.js.");
  }

  console.log(`Starting sync from local "${local.database}" -> Neon...`);
  console.log("Dumping local DB...");

  await runCommand("pg_dump", ["--no-owner", "--no-privileges", ...localConnectionArgs(local)], {
    env: localConnectionEnv(local),
    stdout: createWriteStream(dumpFile)
  });

  console.log("Local DB dump complete:", dumpFile);
  console.log("Uploading dump to Neon...");

  await runCommand("psql", [sanitizeDatabaseUrl(neon.url)], {
    stdin: createReadStream(dumpFile)
  });

  console.log("Neon DB successfully synced with local DB!");
}

syncDatabase().catch((error) => {
  console.error("Database sync failed:", error.message);
  process.exit(1);
});
