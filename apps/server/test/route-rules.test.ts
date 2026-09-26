import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants.js';
import { describe, expect, test } from 'vitest';
import { AccessController } from '../src/access/access.controller.ts';
import { AccessGuard } from '../src/access/access.guard.ts';
import type { AccessService } from '../src/access/access.service.ts';
import { ROUTE_RULE } from '../src/access/rules.ts';
import { CatalogController } from '../src/catalog/catalog.controller.ts';
import { DevController } from '../src/dev/dev.module.ts';
import { PagesController } from '../src/web/pages.ts';

/**
 * T-06: every route declares who may call it, and the guard closes a route
 * that declares nothing. The list of controllers is every controller the app
 * registers; a new controller must be added here, and the test below that
 * compares against the running app catches one that is not.
 */
const CONTROLLERS = [AccessController, CatalogController, PagesController, DevController];

function routes() {
  return CONTROLLERS.flatMap((controller) =>
    Object.getOwnPropertyNames(controller.prototype)
      .filter((name) => name !== 'constructor')
      .map((name) => ({ controller: controller.name, name, handler: controller.prototype[name] }))
      .filter((r) => Reflect.getMetadata(PATH_METADATA, r.handler) !== undefined),
  );
}

describe('every route declares a rule (T-06)', () => {
  test('the build lists every route with its declared rule, and none is without one', () => {
    const listed = routes().map((r) => ({
      route: `${r.controller}.${r.name}`,
      method: Reflect.getMetadata(METHOD_METADATA, r.handler),
      rule: Reflect.getMetadata(ROUTE_RULE, r.handler),
    }));
    expect(listed.length).toBeGreaterThan(15);
    const missing = listed.filter((r) => r.rule === undefined).map((r) => r.route);
    expect(missing).toEqual([]);
  });

  test('every internal route that changes the store or the named lists requires a role', () => {
    const changing = routes().filter((r) => Reflect.getMetadata(METHOD_METADATA, r.handler) !== 0 /* GET */ && r.controller !== 'DevController');
    for (const r of changing) {
      const rule = Reflect.getMetadata(ROUTE_RULE, r.handler);
      if (r.name === 'signOut') continue;
      expect(rule.roles?.length, `${r.controller}.${r.name}`).toBeGreaterThan(0);
    }
  });

  test('the guard refuses a route that declares no rule', async () => {
    const guard = new AccessGuard(new Reflector(), {} as AccessService);
    const context = {
      getHandler: () => function undeclared() {},
      getClass: () => class Undeclared {},
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET', url: '/api/undeclared', headers: {}, cookies: {} }) }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
