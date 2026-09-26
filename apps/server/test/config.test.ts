import { describe, expect, test } from 'vitest';
import { ConfigRefused, readConfig } from '../src/config.ts';

/** The start-up guard (architecture §4.7, T-23): each bad configuration refuses, naming the setting. */
describe('the start-up guard', () => {
  test('the local configuration starts', () => {
    const config = readConfig({});
    expect(config).toMatchObject({ mode: 'local', signIn: 'local', database: 'local', email: 'local', clock: 'local' });
    expect(readConfig({ PORTAL_PUBLIC_URL: 'http://127.0.0.1:3000' }).publicUrl.hostname).toBe('127.0.0.1');
  });

  test.each([
    [{ PORTAL_PUBLIC_URL: 'https://portal.bow.example' }, /PORTAL_PUBLIC_URL/],
    [{ PORTAL_PUBLIC_URL: 'http://0.0.0.0:3000' }, /PORTAL_PUBLIC_URL/],
    [{ PORTAL_PUBLIC_URL: 'http://192.168.1.20:3000' }, /PORTAL_PUBLIC_URL/],
    [{ PORTAL_MODE: 'production', PORTAL_PUBLIC_URL: 'http://localhost:3000' }, /PORTAL_MODE=production/],
    [{ SIGN_IN_ADAPTER: 'real' }, /SIGN_IN_ADAPTER=real with DATABASE_ADAPTER=local/],
    [{ DATABASE_ADAPTER: 'real' }, /SIGN_IN_ADAPTER=local with DATABASE_ADAPTER=real/],
    [{ SIGN_IN_ADAPTER: 'real', DATABASE_ADAPTER: 'real', PORTAL_PUBLIC_URL: 'https://portal.bow.example', EMAIL_ADAPTER: 'real' }, /CLOCK_ADAPTER=local/],
    [{ SIGN_IN_ADAPTER: 'real', DATABASE_ADAPTER: 'real', CLOCK_ADAPTER: 'real' }, /PORTAL_PROFILE/],
    [{ PORTAL_PROFILE: 'anything-goes' }, /not a named profile/],
    [{ SIGN_IN_ADAPTER: 'yes' }, /SIGN_IN_ADAPTER must be/],
    [{ PORTAL_MODE: 'staging' }, /PORTAL_MODE must be/],
  ])('refuses %o', (env, message) => {
    expect(() => readConfig(env)).toThrow(ConfigRefused);
    expect(() => readConfig(env)).toThrow(message);
  });

  test('the one mixed configuration Stage 2 needs starts only when named', () => {
    const env = { SIGN_IN_ADAPTER: 'real', DATABASE_ADAPTER: 'real', CLOCK_ADAPTER: 'real', EMAIL_ADAPTER: 'local' };
    expect(() => readConfig(env)).toThrow(/PORTAL_PROFILE/);
    expect(readConfig({ ...env, PORTAL_PROFILE: 'stage2-local-email' }).email).toBe('local');
  });

  test('the fully real configuration passes the guard', () => {
    const env = { PORTAL_MODE: 'production', PORTAL_PUBLIC_URL: 'https://portal.bow.example', SIGN_IN_ADAPTER: 'real', DATABASE_ADAPTER: 'real', EMAIL_ADAPTER: 'real', CLOCK_ADAPTER: 'real' };
    expect(readConfig(env).mode).toBe('production');
  });
});
