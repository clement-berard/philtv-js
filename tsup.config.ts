import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    constants: 'src/constants/index.ts',
    utils: 'src/utils/index.ts',
    'bin/pairing': 'src/bin/pairing.ts',
  },
  clean: true,
  bundle: true,
  dts: true,
  minify: true,
  treeshake: true,
  format: ['cjs', 'esm'],
});
