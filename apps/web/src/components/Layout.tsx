import { Button, Link, MessageBar, MessageBarBody, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router';
import { ApiError, api, useSession } from '../api.ts';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    padding: '12px 24px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  brand: { fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400, marginRight: 'auto' },
  headerLink: { color: tokens.colorNeutralForegroundOnBrand, ':hover': { color: tokens.colorNeutralForegroundOnBrand } },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: '16px' },
});

export function Layout() {
  const styles = useStyles();
  const session = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = session.data?.user;

  async function signOut() {
    await api.post('/api/sign-out');
    await queryClient.invalidateQueries();
    navigate('/sign-in');
  }

  return (
    <>
      <header className={styles.header}>
        <Text className={styles.brand}>Bow Reseller Portal</Text>
        {user?.kind === 'internal' && (
          <>
            <Link as="a" className={styles.headerLink} href="/sales">Internal sales</Link>
            <Link as="a" className={styles.headerLink} href="/sales/store">Catalog and pricing store</Link>
          </>
        )}
        {user && (
          <>
            <Text>{user.name}</Text>
            <Button size="small" onClick={signOut}>Sign out</Button>
          </>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

/**
 * Wraps a page for internal users. The server decides every call; this only
 * keeps the internal screens from rendering for anyone else, whatever the
 * address was typed as.
 */
export function InternalOnly({ children }: { children: ReactNode }) {
  const session = useSession();
  if (session.isPending) return <Spinner label="Loading" />;
  if (session.data?.user && session.data.user.kind !== 'internal') {
    return (
      <MessageBar intent="error">
        <MessageBarBody>You do not have access to this page.</MessageBarBody>
      </MessageBar>
    );
  }
  if (!session.data?.user) {
    return (
      <MessageBar intent="warning">
        <MessageBarBody>
          You are signed out. <RouterLink to="/sign-in">Sign in</RouterLink>
        </MessageBarBody>
      </MessageBar>
    );
  }
  return <>{children}</>;
}

export function ErrorBar({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof ApiError || error instanceof Error ? error.message : String(error);
  return (
    <MessageBar intent="error">
      <MessageBarBody>{message}</MessageBarBody>
    </MessageBar>
  );
}
