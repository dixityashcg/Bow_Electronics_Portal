import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { NamedUsersPage } from './pages/NamedUsersPage.tsx';
import { RefusedAttemptsPage } from './pages/RefusedAttemptsPage.tsx';
import { ResellerHome } from './pages/ResellerHome.tsx';
import { ResellersPage } from './pages/ResellersPage.tsx';
import { SalesHome } from './pages/SalesHome.tsx';
import { SignInPage } from './pages/SignInPage.tsx';
import { AddProductPage } from './pages/store/AddProductPage.tsx';
import { LoadSummaryPage } from './pages/store/LoadSummaryPage.tsx';
import { ProductPage } from './pages/store/ProductPage.tsx';
import { StorePage } from './pages/store/StorePage.tsx';

// Stage 1 only: the constant is false in the production build, so the
// development sign-in page is not in the bundle at all (architecture §4.7).
const DevSignInPage = __LOCAL_STANDINS__ ? lazy(() => import('./pages/DevSignInPage.tsx')) : null;

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme} style={{ minHeight: '100vh' }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<ResellerHome />} />
                <Route path="/sign-in" element={<SignInPage />} />
                {DevSignInPage && <Route path="/dev/sign-in" element={<DevSignInPage />} />}
                <Route path="/sales" element={<SalesHome />} />
                <Route path="/sales/store" element={<StorePage />} />
                <Route path="/sales/store/load-summary" element={<LoadSummaryPage />} />
                <Route path="/sales/store/products/new" element={<AddProductPage />} />
                <Route path="/sales/store/products/:id" element={<ProductPage />} />
                <Route path="/sales/named-users" element={<NamedUsersPage />} />
                <Route path="/sales/resellers" element={<ResellersPage />} />
                <Route path="/sales/refused-attempts" element={<RefusedAttemptsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </FluentProvider>
  </StrictMode>,
);
