/** The named-user lists (story-01-05; architecture §5.1 role_assignment). */
export const ROLES = ['price maintainer', 'discount setter', 'internal admin', 'role manager'] as const;
export type Role = (typeof ROLES)[number];

/** The two lists the named users screen changes (story-01-05). */
export const NAMEABLE_ROLES = ['price maintainer', 'discount setter'] as const satisfies readonly Role[];
export type NameableRole = (typeof NAMEABLE_ROLES)[number];
