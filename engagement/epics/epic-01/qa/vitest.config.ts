import { defineConfig } from 'vitest/config';

// QA's own runner config: only the epic-01 QA cases, one file at a time.
export default defineConfig({
  test: {
    root: new URL('../../../..', import.meta.url).pathname,
    include: ['engagement/epics/epic-01/qa/**/*.qa.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 180_000,
    hookTimeout: 120_000,
  },
});
