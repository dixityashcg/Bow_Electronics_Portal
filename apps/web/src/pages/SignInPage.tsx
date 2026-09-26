import { Button, Card, CardHeader, Text, Title2 } from '@fluentui/react-components';

/**
 * The two sign-in entrances (ADR-03). In Stage 1 both lead to the development
 * sign-in page; in Stage 2 they start sign-in with Entra ID and External ID.
 */
export function SignInPage() {
  const next = new URLSearchParams(window.location.search).get('next');
  const devHref = `/dev/sign-in${next ? `?next=${encodeURIComponent(next)}` : ''}`;
  return (
    <>
      <Title2>Sign in</Title2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card style={{ width: 320 }}>
          <CardHeader header={<Text weight="semibold">Bow staff</Text>} description="Sign in with your Bow Microsoft 365 account." />
          <Button appearance="primary" as="a" href={devHref}>Sign in</Button>
        </Card>
        <Card style={{ width: 320 }}>
          <CardHeader header={<Text weight="semibold">Resellers</Text>} description="Sign in with the account your invitation set up." />
          <Button appearance="primary" as="a" href={devHref}>Sign in</Button>
        </Card>
      </div>
      {__LOCAL_STANDINS__ && <Text size={200}>Stage 1: both entrances use the local development sign-in.</Text>}
    </>
  );
}
