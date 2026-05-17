import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, 'src');
const DIST = resolve(__dirname, 'dist');
const ROOT = resolve(__dirname, '..');

if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

const MODULES = [
  'shared/constants.js',
  'shared/theme.js',
  'shared/tts.js',
  'background/translate-google.js',
  'background/translate-bing.js',
  'background/translate-engine.js',
  'background/settings.js',
  'background/rules-data.js',
  'background/message-handler.js',
  'background/index.js',
  'content/ui/icons.js',
  'content/ui/components.js',
  'content/input-translate.js',
  'content/sel-translate.js',
  'content/page-translate.js',
  'content/universal-rules.js',
  'content/index.js',
  'options/i18n.js',
  'options/settings-ui.js',
  'options/index.js',
];

function stripImports(code) {
  return code
    .replace(/^import\s+.*?from\s+['"].*?['"]\s*;?\n?/gm, '')
    .replace(/^import\s+['"].*?['"]\s*;?\n?/gm, '')
    .replace(/^export\s+(function|const|let|var|async\s+function)\s+/gm, '$1 ')
    .replace(/^export\s*\{\s*[^}]+\s*\}\s*;?\n?/gm, '')
    .replace(/^export\s+default\s+/gm, '');
}

let bundle = '';

bundle += `// ==UserScript==
// @name         EZ-Translate
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  轻量级划词翻译 - 选中文字即可即时翻译 (EZ-Translate Userscript Port)
// @author       mitcehub
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      translate.googleapis.com
// @connect      www.bing.com
// @connect      raw.githubusercontent.com
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAARlSURBVFiF7ZdLbFRVGMd/59w7M+1MO9OHlBZKSwuFQoGCtIBiwCw0ISpGYyI+ogvjRrNw4caFGzeaiAt3JmriAokLI4EWEkxAAoFACy20QGmh00Kn0+m8ztcF0+k8mDu3hZ+6yL8493zn/N//+33fd4EMP8ww/hdgGA3fyyDMd/t0H4L/fRD+pxL4Nwh8P59L8E8I/Gdp5r0ECPefDfnaU7AEFvz0K4mX/4cMlED/M0jh5HqSr++i/+zvDA3lCDUvwPdNcmWg65eXKD72IlTyiUS3IIUs4+Rqlt8/TM/1E6i6nYr/MNmhIFqLxh9vRHV76d5zCa1rJcG8QEl5IZ1Xb+L2OFGBE3id64kOtODNbeLqG0FU+T+9N2+m68vz1G14BF+aSs2Fehr2uJi3sYbFMx/h3JWNBOwcMX1EuzcSX7INpZy1LKjhzmfMd66HC0dGuPpCHH+tBVduU7pvYN2LEjaX/BiGbPyzidhSE8ViYQsfYBgG/QeTtG8PE88tJ4D0yh4JK5N3Kk44bJFIpnEHmiAdxGu5XHG4+zYzP9iG5U8G88fH6P0kTCx7D/QLazjnzVw4mMAwJN5QMV7ToPVMmO5KHFkUwYh14sr309JSBBiYhUEMuxIk2qX0efpjP2P1y8bfwjQLbln74PKJVVw6nKJ53uDuHIlDB/C4I4Tz2imr8ROpX0Xzpm0YUJQjCGU6srAJp+LIw4pxs5Pm+Ajk+yir1KmtmM+n61oQQrRsXU0TPsh2H8oH5bMRHwC5vl56SSLLo4Ayo8RAOo6rqgZ/zkqUEDgL/JjGKbQjhoUxVQILQp4FSsmUEKi+EC73OPGyaob/vENvvRWLAIM0AkIYCPwYpp9UWqKUAikkQghKiiIsyJ1Bc16EYXmH+0+2ka2tZSBRTs36mYz+KYUUQhBfsJD25DjBpkUM+J4m0HQNM+ZAr7mHptS7LKicS9mSXTSd2kLF/HmY7mxSYR/Jrs2ku1sZ0Nspbe3DGJ0Cg0GqFuxn/9cKqbj21BF4chcFPR202S0oKcEMl5JdNIfhPVuQ5Y2oogdQjSKMCGXdZcxYDOEKkCr7PobhBmDb60AKSWCygnT8X4BX48rOYbBqFxQFEOWA45h/LkAQKGPA0U3DO1M7ZxmYB2E0FoUNqKFITZBqCqLqB0j0BzECkZQYKeWrYnZkOAG3y4mqXoQq/hiR/wlR2UGwmnczfH0X3tp/U90TQiFmbz4xwwMpSBGB0smo4tlQ6gEdXohpCxDrfYqE4QbApSq4I+8Bm5n1mQACQeHrEHk5y9Q5QCT3J9gBKkYPzxz4k42zTKpa8ujkBnj5QQJTKZJVNhI+gqPmB/LhRpKTKUHB5B9TpAH4X/XBMJhGCWR2OZ2HEkTaDCrbDPx5v8LtN5HFuzmI4/L1Ptz/SSZ3yTANeH19OC4//VSe0CCFsJ8r5+fTfPXMpB5gsUy8K5eB1xW4vwcng5PLwOu/AZgKCIGm2VCHUwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wMi0yMVQxNzowNjoyMCswMDowMNvWrGkAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMDItMjFUMTc6MDY6MjArMDA6MDC/H9KGAAAAAElFTkSuQmCC
// ==/UserScript==
/* eslint-disable */
(function () {
'use strict';

`;

// Load rules.json as JS variable
const rulesPath = resolve(ROOT, 'Translate', 'src', 'rules.json');
try {
  const rulesJson = readFileSync(rulesPath, 'utf-8');
  bundle += `\n// ===== rules.json (BUNDLED_RULES) =====\nconst BUNDLED_RULES = ${rulesJson};\n`;
} catch (e) {
  bundle += `\n// ===== rules.json (BUNDLED_RULES) =====\nconst BUNDLED_RULES = [];\n`;
  console.error(`Warning: Could not read rules.json. ${e.message}`);
}

// Read and concatenate each module
for (const mod of MODULES) {
  const filePath = resolve(SRC, mod);
  try {
    const code = readFileSync(filePath, 'utf-8');
    const stripped = stripImports(code);
    bundle += `\n// ===== ${mod} =====\n${stripped}\n`;
  } catch (e) {
    const origPath = resolve(ROOT, 'Translate', 'src', mod);
    try {
      const code = readFileSync(origPath, 'utf-8');
      const stripped = stripImports(code);
      bundle += `\n// ===== ${mod} (from Translate/src) =====\n${stripped}\n`;
    } catch (e2) {
      console.error(`Warning: Could not read ${filePath}, skipping. ${e.message}`);
    }
  }
}

// Inject content.css (options.css is only loaded when settings panel opens)
try {
  const css = readFileSync(resolve(ROOT, 'Translate/static/css/content.css'), 'utf-8').replace(/`/g, '\\`');
  bundle += `\n// ===== CSS Injection (content.css) =====\n(function() { const s = document.createElement('style'); s.textContent = \`${css}\`; document.head.appendChild(s); })();\n`;
} catch { }

// Inline PNG assets as data URIs
const ASSETS_DIR = resolve(ROOT, 'Translate', 'assets');
let icon256 = '';
let iconDark256 = '';
try {
  icon256 = readFileSync(resolve(ASSETS_DIR, '256.png')).toString('base64');
  iconDark256 = readFileSync(resolve(ASSETS_DIR, 'dark-256.png')).toString('base64');
} catch { }

bundle += `
// ===== Assets (inline) =====
const ASSETS = {
  light: 'data:image/png;base64,${icon256 || ""}',
  dark: 'data:image/png;base64,${iconDark256 || ""}',
};

// ===== Init =====
initBackground();

// Register menu command for settings
if (typeof GM_registerMenuCommand !== 'undefined') {
  GM_registerMenuCommand('⚙ EZ-Translate 设置', () => {
    showOptionsPanel();
  });
  GM_registerMenuCommand('🌐 翻译页面', () => {
    startPageTranslate();
  });
}

// Wait for DOM then init content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch(console.error);
  });
} else {
  init().catch(console.error);
}

})();
`;

writeFileSync(resolve(DIST, 'ez-translate.user.js'), bundle, 'utf-8');
console.log('Built: dist/ez-translate.user.js');
console.log('Size:', (bundle.length / 1024).toFixed(0), 'KB');
