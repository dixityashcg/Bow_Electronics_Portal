import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { startPortal, type Portal } from './harness.ts';

/** T-23: without the dev module (the production shape), the stand-in pages do not exist. */
describe('the portal without its Stage 1 stand-in pages', () => {
  let portal: Portal;
  beforeAll(async () => {
    portal = await startPortal({ devPages: false });
  });
  afterAll(async () => {
    await portal?.close();
  });

  test.each(['/dev/sign-in', '/dev/mailbox', '/dev/api/people', '/dev'])('%s is not found', async (url) => {
    expect((await portal.anonymous().get(url)).status).toBe(404);
  });

  test('signing in through the stand-in is not possible', async () => {
    const response = await portal.anonymous().post('/dev/api/sign-in', { audience: 'staff', subjectId: 'local-staff-pat' });
    expect(response.status).toBe(404);
  });

  test('an unknown interface route is not found as JSON, not served the browser application', async () => {
    const response = await portal.anonymous().get('/api/nothing-here');
    expect(response.status).toBe(404);
    expect(response.json.statusCode).toBe(404);
  });
});
