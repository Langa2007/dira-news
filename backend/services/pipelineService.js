import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function resolveRepoRoot() {
  const cwd = process.cwd();
  const up = path.resolve(cwd, '..');

  if (fs.existsSync(path.join(cwd, 'python'))) return cwd;
  if (fs.existsSync(path.join(up, 'python'))) return up;
  return cwd;
}

function startBackgroundCommand(command, cwd) {
  const child = spawn(command, { shell: true, cwd, stdio: 'ignore', detached: true });
  child.unref();
  return child.pid;
}

async function startPipeline() {
  const repoRoot = resolveRepoRoot();

  const cmd = 'python -m python.acquisition.run_scraper --limit 20 && python -m python.ai_core.run_pipeline';

  const pid = startBackgroundCommand(cmd, repoRoot);

  console.log(`Started pipeline (pid=${pid}) from ${repoRoot}`);

  return { pid };
}

export default { startPipeline };
