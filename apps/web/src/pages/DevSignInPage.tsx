import { Button, Card, CardHeader, Text, Title2 } from '@fluentui/react-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api.ts';
import { ErrorBar } from '../components/Layout.tsx';

interface Person {
  subjectId: string;
  name: string;
  email: string;
  audience: 'staff' | 'reseller';
}

/** Stage 1 stand-in for Entra ID and External ID (architecture §4.7): pick a fictional person. */
export default function DevSignInPage() {
  const people = useQuery({ queryKey: ['dev-people'], queryFn: () => api.get<Person[]>('/dev/api/people') });
  const queryClient = useQueryClient();
  const [error, setError] = useState<unknown>(null);

  async function signIn(person: Person) {
    setError(null);
    try {
      await api.post('/dev/api/sign-in', { audience: person.audience, subjectId: person.subjectId });
      await queryClient.invalidateQueries();
      // Only a path on this site: parsed the way the browser will, then held to this origin (review R-8).
      const next = new URLSearchParams(window.location.search).get('next');
      let safeNext: string | null = null;
      if (next) {
        const target = new URL(next, window.location.origin);
        if (target.origin === window.location.origin) safeNext = `${target.pathname}${target.search}`;
      }
      window.location.assign(safeNext ?? (person.audience === 'staff' ? '/sales' : '/'));
    } catch (e) {
      setError(e);
    }
  }

  const group = (audience: Person['audience'], title: string) => (
    <Card>
      <CardHeader header={<Text weight="semibold">{title}</Text>} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {people.data
          ?.filter((p) => p.audience === audience)
          .map((p) => (
            <Button key={p.subjectId} onClick={() => signIn(p)} title={p.email}>
              {p.name}
            </Button>
          ))}
      </div>
    </Card>
  );

  return (
    <>
      <Title2>Development sign-in</Title2>
      <Text>Stage 1 only. Pick a fictional person to sign in as. This page does not exist in the production build.</Text>
      <ErrorBar error={error} />
      {group('staff', 'Bow staff (stands in for Entra ID)')}
      {group('reseller', 'Reseller users (stands in for Entra External ID)')}
    </>
  );
}
