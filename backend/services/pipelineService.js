import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const jobs = new Map();
let nextJobId = 1;

function resolveRepoRoot() {
  const cwd = process.cwd();
  const up = path.resolve(cwd, '..');

  if (fs.existsSync(path.join(cwd, 'python'))) return cwd;
  if (fs.existsSync(path.join(up, 'python'))) return up;
  return cwd;
}

function spawnPipeline(cmd, cwd, jobId) {
  const child = spawn(cmd, { shell: true, cwd });

  const job = jobs.get(jobId);

  child.stdout.on('data', (chunk) => {
    const text = String(chunk);
    job.logs.push({ ts: Date.now(), stream: 'stdout', text });
  });

  child.stderr.on('data', (chunk) => {
    const text = String(chunk);
    job.logs.push({ ts: Date.now(), stream: 'stderr', text });
  });

  child.on('exit', (code, signal) => {
    job.status = code === 0 ? 'completed' : 'failed';
    job.exitedAt = Date.now();
    job.exitCode = code;
    job.exitSignal = signal;
    job.logs.push({ ts: Date.now(), stream: 'status', text: `Process exited code=${code} signal=${signal}` });
  });

  job.pid = child.pid;
  job.startedAt = Date.now();
  job.status = 'running';

  return child.pid;
}

async function startPipeline() {
  const repoRoot = resolveRepoRoot();

  const cmd = 'python -m python.acquisition.run_scraper --limit 20 && python -m python.ai_core.run_pipeline';

  const jobId = String(nextJobId++);
  jobs.set(jobId, { id: jobId, pid: null, startedAt: null, status: 'queued', logs: [] });

  try {
    const pid = spawnPipeline(cmd, repoRoot, jobId);
    console.log(`Started pipeline job=${jobId} pid=${pid} from ${repoRoot}`);
    return { jobId, pid };
  } catch (err) {
    const job = jobs.get(jobId);
    job.status = 'failed';
    job.logs.push({ ts: Date.now(), stream: 'status', text: `Failed to spawn: ${err.message}` });
    throw err;
  }
}

function getJob(jobId) {
  return jobs.get(String(jobId)) || null;
}

function listJobs() {
  return Array.from(jobs.values()).sort((a, b) => b.startedAt - a.startedAt);
}

export default { startPipeline, getJob, listJobs };
