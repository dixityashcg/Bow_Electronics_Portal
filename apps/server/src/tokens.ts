/** Injection tokens. Constructor parameters name their token explicitly, because the build does not emit decorator metadata. */
export const DB = Symbol('Db');
export const CONFIG = Symbol('PortalConfig');
export { CLOCK } from './adapters/clock.ts';
export { SIGN_IN } from './adapters/sign-in.ts';
