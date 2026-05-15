import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const target = process.argv[2];
const manifestPath = 'Translate/manifest.json';
const chromePath = 'Translate/manifest.json';
const firefoxPath = 'Translate/manifest-firefox.json';
const backupPath = 'Translate/manifest-chrome.json';

if (target === 'firefox') {
  copyFileSync(manifestPath, backupPath);
  const ff = JSON.parse(readFileSync(firefoxPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify(ff, null, 2) + '\n');
  console.log('Switched to Firefox manifest (MV2)');
} else if (target === 'chrome') {
  const ch = JSON.parse(readFileSync(backupPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify(ch, null, 2) + '\n');
  console.log('Switched back to Chrome manifest (MV3)');
} else {
  console.error('Usage: node switch-manifest.js [firefox|chrome]');
  process.exit(1);
}
