import {
  Button,
  Card,
  CardHeader,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
  Title2,
} from '@fluentui/react-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { NameableRole, Role } from '@bow/shared';
import { api, useSession } from '../api.ts';
import { ErrorBar, InternalOnly } from '../components/Layout.tsx';

interface NamedUsers {
  roles: NameableRole[];
  users: { id: number; name: string; email: string; roles: Role[] }[];
}

const TITLES: Record<NameableRole, string> = {
  'price maintainer': 'Price maintainers — may add products, change prices and close products for quoting',
  'discount setter': 'Discount setters — may set a reseller’s standard discount',
};

/** The named users screen (story-01-05). The two lists are separate: being on one grants nothing on the other. */
export function NamedUsersPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const named = useQuery({ queryKey: ['named-users'], queryFn: () => api.get<NamedUsers>('/api/sales/named-users') });
  const [choice, setChoice] = useState<Partial<Record<NameableRole, string>>>({});
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['named-users'] });
  const add = useMutation({
    mutationFn: (v: { role: NameableRole; internalUserId: number }) => api.post('/api/sales/named-users', v),
    onMutate: (): void => remove.reset(),
    onSuccess: (_, v) => {
      setChoice((c) => ({ ...c, [v.role]: '' }));
      remove.reset();
      return refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (v: { role: NameableRole; internalUserId: number }) =>
      api.delete(`/api/sales/named-users/${v.internalUserId}/${encodeURIComponent(v.role)}`),
    onMutate: (): void => add.reset(),
    onSuccess: () => {
      add.reset();
      return refresh();
    },
  });
  const isRoleManager = session.data?.user?.roles.includes('role manager') ?? false;

  return (
    <InternalOnly>
      <Title2>Named users</Title2>
      {!isRoleManager && <Text>Only a role manager changes these lists; a change you make will be refused.</Text>}
      <ErrorBar error={named.error ?? add.error ?? remove.error} />
      {named.isPending && <Spinner label="Loading" />}
      {named.data?.roles.map((role) => {
        const members = named.data.users.filter((u) => u.roles.includes(role));
        const others = named.data.users.filter((u) => !u.roles.includes(role));
        return (
          <Card key={role}>
            <CardHeader header={<Text weight="semibold">{TITLES[role]}</Text>} />
            {members.length === 0 ? (
              <Text>Nobody is named.</Text>
            ) : (
              <Table aria-label={role} size="small">
                <TableBody>
                  {members.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => remove.mutate({ role, internalUserId: u.id })}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Select
                aria-label={`Add a ${role}`}
                value={choice[role] ?? ''}
                onChange={(_, d) => setChoice({ ...choice, [role]: d.value })}
              >
                <option value="">Choose someone to name…</option>
                {others.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
              <Button
                appearance="primary"
                disabled={!choice[role]}
                onClick={() => add.mutate({ role, internalUserId: Number(choice[role]) })}
              >
                Name
              </Button>
            </div>
          </Card>
        );
      })}
    </InternalOnly>
  );
}
