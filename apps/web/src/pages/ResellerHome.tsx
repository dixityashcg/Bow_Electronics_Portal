import { Spinner, Text, Title2 } from '@fluentui/react-components';
import { Navigate } from 'react-router';
import { useSession } from '../api.ts';

/** The reseller entrance. Its screens (search, request, My requests) arrive with epic-02. */
export function ResellerHome() {
  const session = useSession();
  if (session.isPending) return <Spinner label="Loading" />;
  const user = session.data?.user;
  if (!user) return <Navigate to="/sign-in" replace />;
  if (user.kind === 'internal') return <Navigate to="/sales" replace />;
  return (
    <>
      <Title2>Welcome, {user.name}</Title2>
      <Text>Product search and quote requests arrive with the next release of the portal.</Text>
    </>
  );
}
