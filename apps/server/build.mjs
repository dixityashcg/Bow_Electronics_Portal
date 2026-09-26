// The production server build: one bundle, with process.env.PORTAL_BUILD fixed to
// "production" so the Stage 1 /dev module is left out of it altogether
// (architecture §4.7). Dependencies stay external.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/main.ts'],
  outfile: 'dist/main.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  packages: 'external',
  define: { 'process.env.PORTAL_BUILD': '"production"' },
  logLevel: 'info',
});
