import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      constants: 'src/constants/index.ts',
      utils: 'src/utils/index.ts',
    },
    clean: true,
    dts: true,
    minify: true,
    treeshake: true,
    format: ['cjs', 'esm'],
  },
  {
    entry: {
      'bin/pairing': 'src/bin/pairing.ts',
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
    clean: true,
    dts: false,
    minify: true,
    treeshake: true,
    format: ['cjs'],
    target: 'node16',
    noExternal: ['is-ip'],
  },
]);
