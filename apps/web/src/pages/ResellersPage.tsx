import { Button, Input, Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Text, Title2 } from '@fluentui/react-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, useSession } from '../api.ts';
import { ErrorBar, InternalOnly } from '../components/Layout.tsx';

interface Reseller {
  id: number;
  name: string;
  standardDiscount: number | null;
  standardDiscountText: string;
}

/**
 * Resellers and their standard discounts — only the set action story-01-05
 * c3/c4 need. The full resellers page (story-04-01) arrives with epic-04.
 */
export function ResellersPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const resellers = useQuery({ queryKey: ['resellers'], queryFn: () => api.get<Reseller[]>('/api/sales/resellers') });
  const [draft, setDraft] = useState<Record<number, string>>({});
  const set = useMutation({
    mutationFn: (v: { id: number; percent: string }) => api.post<Reseller>(`/api/sales/resellers/${v.id}/standard-discount`, { percent: v.percent }),
    onSuccess: (_, v) => {
      setDraft({ ...draft, [v.id]: '' });
      void queryClient.invalidateQueries({ queryKey: ['resellers'] });
    },
  });
  const named = session.data?.user?.roles.includes('discount setter') ?? false;

  return (
    <InternalOnly>
      <Title2>Resellers and standard discounts</Title2>
      {!named && <Text>You are not named to set discounts; a change you make will be refused.</Text>}
      <ErrorBar error={resellers.error ?? set.error} />
      {resellers.isPending && <Spinner label="Loading" />}
      <Table aria-label="Resellers" size="small">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Reseller</TableHeaderCell>
            <TableHeaderCell>Standard discount</TableHeaderCell>
            <TableHeaderCell>Set a new standard discount (%)</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resellers.data?.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.standardDiscountText}</TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    aria-label={`New standard discount for ${r.name}`}
                    size="small"
                    style={{ width: 90 }}
                    value={draft[r.id] ?? ''}
                    onChange={(_, d) => setDraft({ ...draft, [r.id]: d.value })}
                  />
                  <Button size="small" disabled={!draft[r.id]} onClick={() => set.mutate({ id: r.id, percent: draft[r.id]! })}>
                    Set
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </InternalOnly>
  );
}
