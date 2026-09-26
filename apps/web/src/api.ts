import { useQuery } from '@tanstack/react-query';
import type { Role } from '@bow/shared';

export interface SessionInfo {
  businessTimeZone: string;
  user: { kind: 'internal' | 'reseller'; name: string; roles: Role[]; isAdmin: boolean } | null;
  csrfToken: string | null;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

let csrfToken: string | null = null;

async function call<T>(method: string, url: string, body?: unknown | FormData): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== 'GET' && csrfToken) headers['x-csrf-token'] = csrfToken;
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const response = await fetch(url, { method, headers, body: payload, credentials: 'same-origin' });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.message === 'string' ? data.message : `The portal answered ${response.status}.`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}

export const api = {
  get: <T,>(url: string) => call<T>('GET', url),
  post: <T,>(url: string, body?: unknown) => call<T>('POST', url, body ?? {}),
  delete: <T,>(url: string) => call<T>('DELETE', url),
  upload: <T,>(url: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return call<T>('POST', url, form);
  },
};

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const session = await api.get<SessionInfo>('/api/session');
      csrfToken = session.csrfToken;
      return session;
    },
  });
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone,
    timeZoneName: 'short',
  }).format(new Date(iso));
}
