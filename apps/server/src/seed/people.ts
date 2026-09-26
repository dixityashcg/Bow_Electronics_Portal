import type { Role } from '@bow/shared';
import type { SignInClaims } from '../adapters/sign-in.ts';

/**
 * The fictional people of Stage 1 (architecture §4.8). No real Bow person,
 * reseller or product appears in the repository. Morgan stands in for Jensen
 * Huang as role manager.
 */

export interface SeedStaff {
  subjectId: string;
  name: string;
  email: string;
  /** False for Chris: a Bow employee the portal's internal users list does not hold (T-05). */
  onInternalUsersList: boolean;
  roles: Role[];
}

export const seedStaff: SeedStaff[] = [
  { subjectId: 'local-staff-sam', name: 'Sam (rep)', email: 'sam@bow.example', onInternalUsersList: true, roles: [] },
  { subjectId: 'local-staff-alex', name: 'Alex (rep)', email: 'alex@bow.example', onInternalUsersList: true, roles: [] },
  {
    subjectId: 'local-staff-pat',
    name: 'Pat (rep)',
    email: 'pat@bow.example',
    onInternalUsersList: true,
    roles: ['price maintainer'],
  },
  {
    subjectId: 'local-staff-lee',
    name: 'Lee (rep)',
    email: 'lee@bow.example',
    onInternalUsersList: true,
    roles: ['discount setter'],
  },
  {
    subjectId: 'local-staff-jo',
    name: 'Jo (internal admin)',
    email: 'jo@bow.example',
    onInternalUsersList: true,
    roles: ['internal admin'],
  },
  {
    subjectId: 'local-staff-morgan',
    name: 'Morgan (role manager)',
    email: 'morgan@bow.example',
    onInternalUsersList: true,
    roles: ['role manager'],
  },
  { subjectId: 'local-staff-chris', name: 'Chris (Bow, not on the list)', email: 'chris@bow.example', onInternalUsersList: false, roles: [] },
];

export interface SeedResellerUser {
  subjectId: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface SeedReseller {
  name: string;
  users: SeedResellerUser[];
  /** A signed standard discount, in hundredths of a percent, recorded as set by rep Lee. */
  standardDiscount: number | null;
}

export const seedResellers: SeedReseller[] = [
  {
    name: 'Demo Reseller A',
    standardDiscount: null,
    users: [
      { subjectId: 'local-reseller-a-admin', name: 'Riley (Reseller A, admin)', email: 'riley@reseller-a.example', isAdmin: true },
      { subjectId: 'local-reseller-a-casey', name: 'Casey (Reseller A, buyer)', email: 'casey@reseller-a.example', isAdmin: false },
      { subjectId: 'local-reseller-a-drew', name: 'Drew (Reseller A, buyer)', email: 'drew@reseller-a.example', isAdmin: false },
    ],
  },
  {
    name: 'Demo Reseller B',
    standardDiscount: null,
    users: [{ subjectId: 'local-reseller-b-emery', name: 'Emery (Reseller B)', email: 'emery@reseller-b.example', isAdmin: false }],
  },
  {
    name: 'Demo Reseller C',
    standardDiscount: 1000,
    users: [{ subjectId: 'local-reseller-c-admin', name: 'Quinn (Reseller C, admin)', email: 'quinn@reseller-c.example', isAdmin: true }],
  },
  {
    name: 'Demo Reseller D',
    standardDiscount: 1250,
    users: [{ subjectId: 'local-reseller-d-admin', name: 'Rowan (Reseller D, admin)', email: 'rowan@reseller-d.example', isAdmin: true }],
  },
  {
    name: 'Demo Reseller E',
    standardDiscount: 800,
    users: [{ subjectId: 'local-reseller-e-admin', name: 'Sky (Reseller E, admin)', email: 'sky@reseller-e.example', isAdmin: true }],
  },
];

/** Everyone the local sign-in stand-in can vouch for: the whole fictional directory. */
export function localDirectory(): SignInClaims[] {
  return [
    ...seedStaff.map((s) => ({ subjectId: s.subjectId, name: s.name, email: s.email, audience: 'staff' as const })),
    ...seedResellers.flatMap((r) =>
      r.users.map((u) => ({ subjectId: u.subjectId, name: u.name, email: u.email, audience: 'reseller' as const })),
    ),
  ];
}
