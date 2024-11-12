import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    constants: 'src/constants/index.ts',
    api: 'src/lib/PhilTVApi.ts',
    pairing: 'src/lib/PhilTVPairing.ts',
    utils: 'src/utils/index.ts',
  },
  clean: true,
  bundle: true,
  dts: true,
  minify: true,
  treeshake: true,
  format: ['cjs', 'esm'],
});
