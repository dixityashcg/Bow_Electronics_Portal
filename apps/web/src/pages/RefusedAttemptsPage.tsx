import { Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Text, Title2 } from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { api, formatTime, useSession } from '../api.ts';
import { ErrorBar, InternalOnly } from '../components/Layout.tsx';

interface RefusedAttempt {
  id: number;
  userKind: string;
  user: string;
  action: string;
  at: string;
}

/** The refused attempts list (story-01-04 c4; architecture §9.2), for internal admins. */
export function RefusedAttemptsPage() {
  const session = useSession();
  const attempts = useQuery({ queryKey: ['refused-attempts'], queryFn: () => api.get<RefusedAttempt[]>('/api/sales/refused-attempts') });
  const zone = session.data?.businessTimeZone ?? 'UTC';
  return (
    <InternalOnly>
      <Title2>Refused attempts</Title2>
      <ErrorBar error={attempts.error} />
      {attempts.isPending && <Spinner label="Loading" />}
      {attempts.data && attempts.data.length === 0 && <Text>Nothing has been refused.</Text>}
      {attempts.data && attempts.data.length > 0 && (
        <Table aria-label="Refused attempts" size="small">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>The user</TableHeaderCell>
              <TableHeaderCell>The page or action attempted</TableHeaderCell>
              <TableHeaderCell>Date and time</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.data.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  {a.user} <Text size={200}>({a.userKind})</Text>
                </TableCell>
                <TableCell>{a.action}</TableCell>
                <TableCell>{formatTime(a.at, zone)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </InternalOnly>
  );
}
