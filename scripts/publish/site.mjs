#!/usr/bin/env node
// Safe, explicit Obsidian -> generated content -> Git workflow.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { publish } from './index.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: repo, encoding: 'utf8', stdio: options.inherit ? 'inherit' : 'pipe' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr?.trim() || 'see preceding output'}`);
  return result.stdout ?? '';
}
const owned = ['src/content/posts/obsidian', 'public/media/obsidian'];
function parseArgs(args) {
  let vault, dryRun = false, commit = false, push = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vault' && args[i + 1] && !args[i+1].startsWith('--')) vault = args[++i];
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--commit') commit = true;
    else if (args[i] === '--push') push = true;
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  if (!vault || (push && !commit) || (dryRun && (commit || push))) {
    throw new Error('Usage: npm run publish:site -- --vault /absolute/path [--dry-run | --commit [--push]]');
  }
  return { vault: path.resolve(vault), dryRun, commit, push };
}
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const status = run('git', ['status', '--porcelain', '--untracked-files=all']);
  if (status.trim()) throw new Error('Git working tree must be clean before publishing; commit or stash existing changes first');
  if (args.push) {
    const branch = run('git', ['branch', '--show-current']).trim();
    if (branch !== 'main') throw new Error('Automatic push is only permitted from main. Use the manual Git workflow for other branches');
  }
  // Dry-run resolves references and checks safety without any output writes.
  const result = await publish({ vault: args.vault, repo, dryRun: args.dryRun });
  console.log(JSON.stringify(result, null, 2));
  if (args.dryRun) return;
  // Do not stage anything until both validation and build succeed.
  run('npm', ['run', 'check'], { inherit: true });
  run('npm', ['run', 'build'], { inherit: true });
  const changes = run('git', ['status', '--porcelain', '--untracked-files=all']).trim();
  // With a clean starting tree, only changes in exporter-owned paths are allowed.
  if (changes) {
    const paths = run('git', ['status', '--porcelain', '-z', '--untracked-files=all']).split('\0').filter(Boolean).map(line => line.slice(3));
    for (const file of paths) {
      if (!owned.some(directory => file.startsWith(directory + '/'))) {
        throw new Error(`Unrelated file changed during publish: ${file}. Review manually; no commit or push performed`);
      }
    }
  }
  if (!args.commit) {
    console.log('Export verified locally. Inspect generated Markdown and binary assets, then run again with --commit (and optional --push).');
    return;
  }
  if (!changes) { console.log('No generated content changes to commit.'); return; }
  run('git', ['add', '--', ...owned], { inherit: true });
  const staged = run('git', ['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean);
  if (!staged.length || staged.some(file => !owned.some(dir => file.startsWith(dir + '/')))) {
    throw new Error('Unexpected staged paths; aborting commit');
  }
  console.log('Staged generated files:', staged.join(', '));
  run('git', ['commit', '-m', 'content: publish approved Obsidian notes'], { inherit: true });
  if (args.push) {
    run('git', ['push', 'origin', 'main'], { inherit: true });
    console.log('Pushed to main. Confirm GitHub Actions and Vercel status before treating the articles as live.');
  } else console.log('Local commit created. Push explicitly when ready: git push origin main');
}
main().catch(error => { console.error('Publishing halted:', error.message); process.exitCode = 1; });
