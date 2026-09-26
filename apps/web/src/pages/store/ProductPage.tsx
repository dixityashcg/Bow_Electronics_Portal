import {
  Badge,
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
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
import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { api, formatTime, useSession } from '../../api.ts';
import { ErrorBar, InternalOnly } from '../../components/Layout.tsx';
import type { Product } from './types.ts';

interface HistoryLine {
  oldPrice: string;
  newPrice: string;
  changedBy: string;
  changedAt: string;
}

/** The product page (story-01-02, story-01-03): change the price, close for quoting, and the price history. */
export function ProductPage() {
  const { id } = useParams();
  const session = useSession();
  const queryClient = useQueryClient();
  const product = useQuery({ queryKey: ['product', id], queryFn: () => api.get<Product>(`/api/sales/store/products/${id}`) });
  const history = useQuery({
    queryKey: ['price-history', id],
    queryFn: () => api.get<HistoryLine[]>(`/api/sales/store/products/${id}/price-history`),
  });
  const [price, setPrice] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const refresh = () => queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
  const changePrice = useMutation({
    mutationFn: () => api.post<Product>(`/api/sales/store/products/${id}/price`, { price }),
    onSuccess: (p) => {
      close.reset();
      setDone(`Price changed to ${p.priceText}.`);
      setPrice('');
      void refresh();
    },
    onError: () => setDone(null),
  });
  const close = useMutation({
    mutationFn: () => api.post<Product>(`/api/sales/store/products/${id}/close`),
    onSuccess: () => {
      changePrice.reset();
      setDone('Closed for quoting.');
      void refresh();
    },
    onError: () => setDone(null),
  });
  const zone = session.data?.businessTimeZone ?? 'UTC';
  const named = session.data?.user?.roles.includes('price maintainer') ?? false;

  function submitPrice(event: FormEvent) {
    event.preventDefault();
    changePrice.mutate();
  }

  if (product.isPending) return <Spinner label="Loading" />;
  const p = product.data;
  return (
    <InternalOnly>
      <ErrorBar error={product.error} />
      {p && (
        <>
          <Title2>{p.partNumber}</Title2>
          <Text>{p.description}</Text>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Text size={500} weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{p.priceText}</Text>
            <Badge appearance="filled" color={p.status === 'Closed' ? 'danger' : 'success'} aria-label={`Status: ${p.status}`}>
              {p.status}
            </Badge>
          </div>
          {!named && <Text size={200}>You are not named to maintain prices; changes you make here will be refused.</Text>}
          {done && (
            <MessageBar intent="success">
              <MessageBarBody>{done}</MessageBarBody>
            </MessageBar>
          )}
          <ErrorBar error={changePrice.error ?? close.error} />
          <form onSubmit={submitPrice} style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
            <Field label="New price" hint="A plain number, up to 4 decimal places">
              <Input value={price} onChange={(_, d) => setPrice(d.value)} inputMode="decimal" />
            </Field>
            <Button type="submit" appearance="primary" disabled={!price || changePrice.isPending}>Change price</Button>
          </form>
          {p.status !== 'Closed' && (
            <div>
              <Button onClick={() => close.mutate()} disabled={close.isPending}>Close for quoting</Button>
            </div>
          )}
          <Title3>Price history</Title3>
          <ErrorBar error={history.error} />
          {history.data && history.data.length === 0 ? (
            <Text>The price has not been changed since this product entered the store.</Text>
          ) : (
            <Table aria-label="Price history" size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ textAlign: 'right' }}>Old price</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right' }}>New price</TableHeaderCell>
                  <TableHeaderCell>Who made the change</TableHeaderCell>
                  <TableHeaderCell>Date and time</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data?.map((line, i) => (
                  <TableRow key={i}>
                    <TableCell style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{line.oldPrice}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{line.newPrice}</TableCell>
                    <TableCell>{line.changedBy}</TableCell>
                    <TableCell>{formatTime(line.changedAt, zone)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </InternalOnly>
  );
}
