import resolve from '@rollup/plugin-node-resolve';

const outputDir = 'Translate/static/js';

export default [
  {
    input: 'Translate/src/content/index.js',
    output: {
      file: `${outputDir}/content.js`,
      format: 'iife',
      sourcemap: false,
    },
    plugins: [resolve()],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error(`Circular dependency detected: ${warning.message}`);
      }
      warn(warning);
    },
  },
  {
    input: 'Translate/src/background/index.js',
    output: {
      file: `${outputDir}/background.js`,
      format: 'iife',
      sourcemap: false,
    },
    plugins: [resolve()],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error(`Circular dependency detected: ${warning.message}`);
      }
      warn(warning);
    },
  },
  {
    input: 'Translate/src/options/index.js',
    output: {
      file: `${outputDir}/options.js`,
      format: 'iife',
      sourcemap: false,
    },
    plugins: [resolve()],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error(`Circular dependency detected: ${warning.message}`);
      }
      warn(warning);
    },
  },
];
