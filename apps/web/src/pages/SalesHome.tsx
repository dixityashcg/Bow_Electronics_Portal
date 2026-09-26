import { Card, CardHeader, Text, Title2 } from '@fluentui/react-components';
import { Link } from 'react-router';
import { useSession } from '../api.ts';
import { InternalOnly } from '../components/Layout.tsx';

export function SalesHome() {
  const session = useSession();
  const roles = session.data?.user?.roles ?? [];
  const entries = [
    { to: '/sales/store', title: 'Catalog and pricing store', text: 'Products, prices, price history, the ERP load summary.' },
    { to: '/sales/resellers', title: 'Resellers and standard discounts', text: 'Each reseller’s standard discount.' },
    { to: '/sales/named-users', title: 'Named users', text: 'Who may maintain prices and who may set discounts.' },
    ...(roles.includes('internal admin')
      ? [{ to: '/sales/refused-attempts', title: 'Refused attempts', text: 'Every attempt the portal refused, with who, what and when.' }]
      : []),
  ];
  return (
    <InternalOnly>
      <Title2>Internal sales</Title2>
      <Text>You are named: {roles.length > 0 ? roles.join(', ') : 'for nothing (rep)'}.</Text>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {entries.map((e) => (
          <Card key={e.to}>
            <CardHeader header={<Link to={e.to}>{e.title}</Link>} description={<Text size={200}>{e.text}</Text>} />
          </Card>
        ))}
      </div>
    </InternalOnly>
  );
}
