/** The clock adapter (architecture §4.7). Every stored time comes from here, in UTC. */
export interface Clock {
  /** Now, as an ISO 8601 UTC timestamp. */
  now(): string;
}

export const CLOCK = Symbol('Clock');

export class SystemClock implements Clock {
  now(): string {
    return new Date().toISOString();
  }
}

/**
 * Stage 1 stand-in: the system clock plus an offset that the seed script and
 * the /dev page can move (used from epic-05 on). Never selectable in production:
 * the start-up guard refuses it.
 */
export class LocalClock implements Clock {
  private offsetMs = 0;

  now(): string {
    return new Date(Date.now() + this.offsetMs).toISOString();
  }

  setOffsetMs(offsetMs: number): void {
    this.offsetMs = offsetMs;
  }
}
