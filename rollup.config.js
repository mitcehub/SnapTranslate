import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

const outputDir = 'SnapTranslate/static/js';

function onwarn(warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    throw new Error(`Circular dependency detected: ${warning.message}`);
  }
  warn(warning);
}

const inputs = ['content', 'background', 'options'];
export default inputs.map((name) => ({
  input: `src/${name}/index.js`,
  output: { file: `${outputDir}/${name}.js`, format: 'iife', sourcemap: false },
  plugins: [resolve(), json()],
  onwarn,
}));
