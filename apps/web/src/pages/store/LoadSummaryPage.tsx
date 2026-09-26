import {
  Button,
  Card,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title2,
  Title3,
} from '@fluentui/react-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, formatTime, useSession } from '../../api.ts';
import { ErrorBar, InternalOnly } from '../../components/Layout.tsx';
import type { LoadSummary } from './types.ts';

/** The load summary (story-01-01): what arrived, and every row that did not, with its reason. */
export function LoadSummaryPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const summary = useQuery({
    queryKey: ['load-summary'],
    queryFn: () => api.get<{ summary: LoadSummary | null }>('/api/sales/store/load-summary'),
  });
  const [file, setFile] = useState<File | null>(null);
  const load = useMutation({
    mutationFn: (f: File) => api.upload<{ summary: LoadSummary }>('/api/sales/store/load', f),
    onSuccess: () => queryClient.invalidateQueries(),
  });
  const zone = session.data?.businessTimeZone ?? 'UTC';
  const s = summary.data?.summary;
  const isPriceMaintainer = session.data?.user?.roles.includes('price maintainer') ?? false;

  return (
    <InternalOnly>
      <Title2>ERP load summary</Title2>
      <ErrorBar error={summary.error} />
      {summary.isPending && <Spinner label="Loading" />}
      {summary.data && !s && (
        <Card>
          <Text>The ERP has not been loaded. The load runs once, into an empty store.</Text>
          {!isPriceMaintainer && <Text size={200}>You are not named to maintain prices; a load will be refused.</Text>}
          <input
            type="file"
            aria-label="ERP spreadsheet"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div>
            <Button appearance="primary" disabled={!file || load.isPending} onClick={() => file && load.mutate(file)}>
              {load.isPending ? 'Loading…' : 'Load the ERP'}
            </Button>
          </div>
          <ErrorBar error={load.error} />
        </Card>
      )}
      {s && (
        <>
          <MessageBar intent={s.complete ? 'success' : 'warning'}>
            <MessageBarBody>
              <MessageBarTitle>{s.complete ? 'Complete' : 'Not complete'}</MessageBarTitle>
              {s.statusText}
            </MessageBarBody>
          </MessageBar>
          <Table aria-label="Load summary" size="small" style={{ maxWidth: 560 }}>
            <TableBody>
              <TableRow><TableCell>Product rows in the ERP</TableCell><TableCell style={{ textAlign: 'right' }}>{s.rowsInErp}</TableCell></TableRow>
              <TableRow><TableCell>Products loaded into the store</TableCell><TableCell style={{ textAlign: 'right' }}>{s.rowsLoaded}</TableCell></TableRow>
              <TableRow><TableCell>Rows not loaded</TableCell><TableCell style={{ textAlign: 'right' }}>{s.rowsNotLoaded}</TableCell></TableRow>
              <TableRow><TableCell>File</TableCell><TableCell style={{ textAlign: 'right' }}>{s.fileName}</TableCell></TableRow>
              <TableRow><TableCell>Loaded by</TableCell><TableCell style={{ textAlign: 'right' }}>{s.runBy}, {formatTime(s.runAt, zone)}</TableCell></TableRow>
            </TableBody>
          </Table>
          {s.notLoaded.length > 0 && (
            <>
              <Title3>Rows not loaded</Title3>
              <Table aria-label="Rows not loaded" size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>ERP row</TableHeaderCell>
                    <TableHeaderCell>Part number</TableHeaderCell>
                    <TableHeaderCell>Price as in the ERP</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s.notLoaded.map((r) => (
                    <TableRow key={r.rowNumber}>
                      <TableCell>{r.rowNumber}</TableCell>
                      <TableCell>{r.partNumber || '—'}</TableCell>
                      <TableCell>{r.price ?? '—'}</TableCell>
                      <TableCell>{r.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}
    </InternalOnly>
  );
}
