import { Button, Field, Input, Text, Title2 } from '@fluentui/react-components';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { addProductSchema } from '@bow/shared';
import { api, useSession } from '../../api.ts';
import { ErrorBar, InternalOnly } from '../../components/Layout.tsx';
import type { Product } from './types.ts';

export function AddProductPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ partNumber: '', description: '', price: '' });
  const [invalid, setInvalid] = useState<string | null>(null);
  const add = useMutation({
    mutationFn: () => api.post<Product>('/api/sales/store/products', form),
    onSuccess: (product) => navigate(`/sales/store/products/${product.id}`),
  });
  const named = session.data?.user?.roles.includes('price maintainer') ?? false;

  function submit(event: FormEvent) {
    event.preventDefault();
    const checked = addProductSchema.safeParse(form);
    setInvalid(checked.success ? null : checked.error.issues.map((i) => i.message).join('; '));
    if (checked.success) add.mutate();
  }

  return (
    <InternalOnly>
      <Title2>Add a product</Title2>
      {!named && <Text>You are not named to maintain prices; adding a product will be refused.</Text>}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
        <Field label="Part number" required>
          <Input value={form.partNumber} onChange={(_, d) => setForm({ ...form, partNumber: d.value })} />
        </Field>
        <Field label="Description" required>
          <Input value={form.description} onChange={(_, d) => setForm({ ...form, description: d.value })} />
        </Field>
        <Field label="Price" required hint="A plain number, up to 4 decimal places, for example 12.50 or 0.0040">
          <Input value={form.price} onChange={(_, d) => setForm({ ...form, price: d.value })} inputMode="decimal" />
        </Field>
        <ErrorBar error={invalid} />
        <ErrorBar error={add.error} />
        <div>
          <Button type="submit" appearance="primary" disabled={add.isPending}>Save</Button>
        </div>
      </form>
    </InternalOnly>
  );
}
