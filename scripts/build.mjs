import { execSync } from 'child_process';
import { cpSync, rmSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SRC = join(ROOT, 'Translate');

function ensureNodeInPath() {
  const nodeDir = dirname(process.execPath);
  const pathSep = process.platform === 'win32' ? ';' : ':';
  if (!process.env.PATH.split(pathSep).includes(nodeDir)) {
    process.env.PATH = nodeDir + pathSep + process.env.PATH;
  }
}

function buildJS() {
  console.log('📦 Building JS with rollup...');
  ensureNodeInPath();
  const rollupBin = join(ROOT, 'node_modules', '.bin', 'rollup');
  execSync(`"${rollupBin}" -c`, { cwd: ROOT, stdio: 'inherit' });
}

function buildTarget(target) {
  const targetDir = join(DIST, target);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  const items = readdirSync(SRC);
  for (const item of items) {
    const srcPath = join(SRC, item);
    const isDir = statSync(srcPath).isDirectory();

    if (isDir && item === 'src') continue;

    if (item === 'manifest.json') {
      if (target === 'firefox') continue;
      copyFileSync(srcPath, join(targetDir, 'manifest.json'));
      continue;
    }

    if (item === 'manifest.firefox.json') {
      if (target !== 'firefox') continue;
      copyFileSync(srcPath, join(targetDir, 'manifest.json'));
      continue;
    }

    if (isDir) {
      cpSync(srcPath, join(targetDir, item), { recursive: true });
    } else {
      copyFileSync(srcPath, join(targetDir, item));
    }
  }

  console.log(`✅ Built ${target} extension → dist/${target}/`);
}

buildJS();

const target = process.argv[2];
if (target === 'firefox') {
  buildTarget('firefox');
} else if (target === 'chrome') {
  buildTarget('chrome');
} else {
  buildTarget('chrome');
  buildTarget('firefox');
}
