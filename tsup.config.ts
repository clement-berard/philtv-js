import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      constants: 'src/constants/index.ts',
      utils: 'src/utils/index.ts',
    },
    clean: true,
    bundle: true,
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
    bundle: true,
    dts: false,
    minify: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    treeshake: true,
    format: ['cjs'],
    target: 'node16',
    noExternal: ['is-ip'],
  },
]);
