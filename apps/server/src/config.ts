/**
 * Configuration and the start-up guard (architecture §4.7, T-23).
 *
 * The guard refuses the present-but-wrong configuration, not only the missing
 * one (practice lessons, voltway-returns-portal and voltway-warranty-claims,
 * 2026-09-23): a stand-in on a public address, a stand-in in production mode,
 * and real and local adapters mixed by accident.
 */

type AdapterChoice = 'local' | 'real';

export interface PortalConfig {
  mode: 'local' | 'production';
  publicUrl: URL;
  port: number;
  signIn: AdapterChoice;
  database: AdapterChoice;
  email: AdapterChoice;
  clock: AdapterChoice;
  profile: string | null;
  databaseFile: string;
  /** Bow's business time zone for showing times (architecture §5.2; the zone itself is Q-03, still open). */
  businessTimeZone: string;
}

export class ConfigRefused extends Error {}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/** The one mixed configuration Stage 2 needs, named so it is never assembled by accident. */
const NAMED_PROFILES: Record<string, Partial<Record<'signIn' | 'database' | 'email' | 'clock', AdapterChoice>>> = {
  'stage2-local-email': { signIn: 'real', database: 'real', email: 'local', clock: 'real' },
};

function choice(env: NodeJS.ProcessEnv, name: string, fallback: AdapterChoice): AdapterChoice {
  const value = env[name] ?? fallback;
  if (value !== 'local' && value !== 'real') {
    throw new ConfigRefused(`${name} must be "local" or "real", not "${value}"`);
  }
  return value;
}

export function readConfig(env: NodeJS.ProcessEnv): PortalConfig {
  const mode = env.PORTAL_MODE ?? 'local';
  if (mode !== 'local' && mode !== 'production') {
    throw new ConfigRefused(`PORTAL_MODE must be "local" or "production", not "${mode}"`);
  }
  let publicUrl: URL;
  try {
    publicUrl = new URL(env.PORTAL_PUBLIC_URL ?? 'http://localhost:3000');
  } catch {
    throw new ConfigRefused(`PORTAL_PUBLIC_URL is not an address: "${env.PORTAL_PUBLIC_URL}"`);
  }
  // URL.port is empty for a scheme's default port (https://… is 443), so fall back to the listening default.
  const port = Number(env.PORT ?? (publicUrl.port || 3000));
  if (!Number.isInteger(port) || port <= 0) throw new ConfigRefused(`PORT is not a port number: "${env.PORT}"`);

  const config: PortalConfig = {
    mode,
    publicUrl,
    port,
    signIn: choice(env, 'SIGN_IN_ADAPTER', 'local'),
    database: choice(env, 'DATABASE_ADAPTER', 'local'),
    email: choice(env, 'EMAIL_ADAPTER', 'local'),
    clock: choice(env, 'CLOCK_ADAPTER', 'local'),
    profile: env.PORTAL_PROFILE ?? null,
    databaseFile: env.DATABASE_FILE ?? '.local/portal.db',
    businessTimeZone: env.BUSINESS_TIME_ZONE ?? 'UTC',
  };
  guard(config);
  return config;
}

export function guard(config: PortalConfig): void {
  const standIns = (['signIn', 'database', 'email', 'clock'] as const).filter((k) => config[k] === 'local');
  const settingName = { signIn: 'SIGN_IN_ADAPTER', database: 'DATABASE_ADAPTER', email: 'EMAIL_ADAPTER', clock: 'CLOCK_ADAPTER' };
  const named = standIns.map((k) => `${settingName[k]}=local`).join(', ');

  if (standIns.length > 0 && !LOCAL_HOSTS.has(config.publicUrl.hostname)) {
    throw new ConfigRefused(
      `PORTAL_PUBLIC_URL is ${config.publicUrl.origin}, but local stand-ins are selected (${named}). Stand-ins may only run on localhost or 127.0.0.1.`,
    );
  }
  if (config.mode === 'production' && standIns.length > 0) {
    throw new ConfigRefused(`PORTAL_MODE=production, but local stand-ins are selected (${named}).`);
  }
  if (config.signIn !== config.database) {
    throw new ConfigRefused(
      `SIGN_IN_ADAPTER=${config.signIn} with DATABASE_ADAPTER=${config.database}: real sign-in and the local database (or the reverse) are never mixed.`,
    );
  }
  if (config.profile !== null) {
    const profile = NAMED_PROFILES[config.profile];
    if (!profile) throw new ConfigRefused(`PORTAL_PROFILE "${config.profile}" is not a named profile.`);
    for (const [key, want] of Object.entries(profile) as [keyof typeof settingName, AdapterChoice][]) {
      if (config[key] !== want) {
        throw new ConfigRefused(`PORTAL_PROFILE ${config.profile} needs ${settingName[key]}=${want}, not ${config[key]}.`);
      }
    }
  } else if (config.database === 'real' && standIns.length > 0) {
    throw new ConfigRefused(
      `The real database is selected with local stand-ins (${named}). A mixed configuration must be named with PORTAL_PROFILE.`,
    );
  }
}
