import 'reflect-metadata';
import { resolve } from 'node:path';
import type { Type } from '@nestjs/common';
import { LocalClock, SystemClock } from './adapters/clock.ts';
import { LocalSignIn } from './adapters/sign-in.ts';
import { createApp } from './app.ts';
import { ConfigRefused, readConfig, type PortalConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { localDirectory } from './seed/people.ts';
import { loadIndexHtml } from './web/pages.ts';

/**
 * process.env.PORTAL_BUILD is replaced with "production" by the production
 * build (build.mjs), which then drops the /dev branch below as dead code, so
 * the stand-in module is not in the bundle at all.
 */

function refuseToStart(message: string): never {
  console.error(`\nThe portal refused to start: ${message}\n`);
  process.exit(1);
}

function readConfigOrRefuse(): PortalConfig {
  try {
    return readConfig(process.env);
  } catch (error) {
    if (error instanceof ConfigRefused) refuseToStart(error.message);
    throw error;
  }
}

async function main() {
  const config = readConfigOrRefuse();
  const real = (['signIn', 'database', 'email', 'clock'] as const).filter((k) => config[k] === 'real');
  if (real.length > 0) {
    refuseToStart(`the real ${real.join(', ')} adapter${real.length > 1 ? 's are' : ' is'} Stage 2 work and not built yet (architecture §4.7).`);
  }
  if (process.env.PORTAL_BUILD === 'production') refuseToStart('this is a production build, and it has no local stand-ins to run with.');

  const { db } = openDatabase(resolve(config.databaseFile));
  const webDist = process.env.WEB_DIST_DIR ?? resolve(import.meta.dirname, '../../web/dist');
  let devModule: Type | undefined;
  if (process.env.PORTAL_BUILD !== 'production') devModule = (await import('./dev/dev.module.ts')).DevModule;

  const app = await createApp({
    config,
    db,
    clock: config.clock === 'local' ? new LocalClock() : new SystemClock(),
    signIn: new LocalSignIn(localDirectory()),
    indexHtml: loadIndexHtml(resolve(webDist, 'index.html')),
    assetsDir: resolve(webDist, 'assets'),
    devModule,
  });
  // Stand-ins listen on the loopback address only.
  await app.listen({ port: config.port, host: '127.0.0.1' });
  console.log(`\nBow Reseller Portal (Stage 1, local stand-ins) on ${config.publicUrl.origin}`);
  console.log(`  Sign in:  ${config.publicUrl.origin}/dev/sign-in\n`);
}

void main();
