import fs from 'fs';
const c = fs.readFileSync('dist/ez-translate.user.js', 'utf-8');

function find(name, before, after) {
  const idx = c.indexOf(name);
  if (idx < 0) { console.log(name + ': NOT FOUND'); return; }
  console.log(name + ':');
  console.log(c.substring(Math.max(0, idx - before), idx + after));
  console.log('---end---\n');
}

find('async function showOptionsPanel', 0, 600);
find('async function initSettingsPanel', 0, 2400);
