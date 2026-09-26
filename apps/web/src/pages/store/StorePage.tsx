import {
  Badge,
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title2,
} from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../../api.ts';
import { ErrorBar, InternalOnly } from '../../components/Layout.tsx';
import type { Product } from './types.ts';

export function StorePage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [text, setText] = useState(q);
  const products = useQuery({
    queryKey: ['store-search', q],
    queryFn: () => api.get<Product[]>(`/api/sales/store/products?q=${encodeURIComponent(q)}`),
  });

  function search(event: FormEvent) {
    event.preventDefault();
    setParams(text.trim() ? { q: text.trim() } : {});
  }

  return (
    <InternalOnly>
      <Title2>Catalog and pricing store</Title2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/sales/store/load-summary">ERP load summary</Link>
        <Link to="/sales/store/products/new">Add a product</Link>
      </div>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Input
          aria-label="Part number or description"
          placeholder="Part number or description words"
          value={text}
          onChange={(_, d) => setText(d.value)}
          style={{ minWidth: 320, flex: 1 }}
        />
        <Button type="submit" appearance="primary">Search</Button>
      </form>
      <ErrorBar error={products.error} />
      {products.isPending ? (
        <Spinner label="Searching" />
      ) : products.data && products.data.length === 0 ? (
        <Text>{q ? 'No products match.' : 'The store is empty. Open the ERP load summary to load the ERP.'}</Text>
      ) : (
        <Table aria-label="Products" size="small">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Part number</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell style={{ textAlign: 'right' }}>Price</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link to={`/sales/store/products/${p.id}`}>{p.partNumber}</Link>
                </TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.priceText}</TableCell>
                <TableCell>
                  <Badge appearance="tint" color={p.status === 'Closed' ? 'danger' : 'success'}>{p.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </InternalOnly>
  );
}
