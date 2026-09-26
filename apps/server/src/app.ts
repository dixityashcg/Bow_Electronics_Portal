import 'reflect-metadata';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { Global, Module, type DynamicModule, type LoggerService, type Type } from '@nestjs/common';
import { APP_GUARD, NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { existsSync } from 'node:fs';
import { AccessGuard } from './access/access.guard.ts';
import { AccessModule } from './access/access.module.ts';
import type { Clock } from './adapters/clock.ts';
import type { SignInAdapter } from './adapters/sign-in.ts';
import { CatalogModule } from './catalog/catalog.module.ts';
import type { PortalConfig } from './config.ts';
import type { Db } from './db/database.ts';
import { CLOCK, CONFIG, DB, SIGN_IN } from './tokens.ts';
import { PageAwareExceptionFilter, PagesController, WEB_INDEX } from './web/pages.ts';

export interface AppDependencies {
  config: PortalConfig;
  db: Db;
  clock: Clock;
  signIn: SignInAdapter;
  indexHtml: string;
  /** The built browser application's assets directory, if built. */
  assetsDir?: string;
  /** The Stage 1 stand-in pages; absent in production. */
  devModule?: Type;
  logger?: LoggerService | false;
}

/** The largest ERP spreadsheet the load accepts. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function createApp(deps: AppDependencies): Promise<NestFastifyApplication> {
  @Global()
  @Module({})
  class PlatformModule {}

  const platform: DynamicModule = {
    module: PlatformModule,
    global: true,
    providers: [
      { provide: CONFIG, useValue: deps.config },
      { provide: DB, useValue: deps.db },
      { provide: CLOCK, useValue: deps.clock },
      { provide: SIGN_IN, useValue: deps.signIn },
      { provide: WEB_INDEX, useValue: deps.indexHtml },
    ],
    exports: [CONFIG, DB, CLOCK, SIGN_IN, WEB_INDEX],
  };

  @Module({})
  class AppModule {}

  const root: DynamicModule = {
    module: AppModule,
    imports: [platform, AccessModule, CatalogModule, ...(deps.devModule ? [deps.devModule] : [])],
    controllers: [PagesController],
    providers: [{ provide: APP_GUARD, useClass: AccessGuard }],
  };

  const app = await NestFactory.create<NestFastifyApplication>(root, new FastifyAdapter({ bodyLimit: 1024 * 1024 }), {
    logger: deps.logger ?? ['log', 'warn', 'error'],
  });
  await app.register(fastifyCookie);
  await app.register(fastifyMultipart, { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } });
  if (deps.assetsDir && existsSync(deps.assetsDir)) {
    await app.register(fastifyStatic, { root: deps.assetsDir, prefix: '/assets/', decorateReply: false });
  }
  app.useGlobalFilters(new PageAwareExceptionFilter());
  await app.init();
  return app;
}
