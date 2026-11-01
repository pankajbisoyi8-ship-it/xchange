import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore.ts';
import { api } from './lib/api.ts';

// Common Components
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { RoleGuard } from './components/common/RoleGuard.tsx';

// Public & User Pages
import { HomePage } from './pages/HomePage.tsx';
import { BrowsePage } from './pages/BrowsePage.tsx';
import { ListingDetailPage } from './pages/ListingDetailPage.tsx';
import { CreateListingPage } from './pages/CreateListingPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { OrderDetailPage } from './pages/OrderDetailPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { AdminLoginPage } from './pages/auth/AdminLoginPage.tsx';
import { AgentLoginPage } from './pages/auth/AgentLoginPage.tsx';

// Agent Pages
import { AgentDashboardPage } from './pages/agent/AgentDashboardPage.tsx';
import { AgentTaskDetailPage } from './pages/agent/AgentTaskDetailPage.tsx';
import { AgentCashPage } from './pages/agent/AgentCashPage.tsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminListingsPage } from './pages/admin/AdminListingsPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminLedgerPage } from './pages/admin/AdminLedgerPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminAuditPage } from './pages/admin/AdminAuditPage.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const { data } = await api.post('/auth/refresh');
        setAuth(data.data.user, data.data.accessToken);
      } catch (err) {
        clearAuth();
      }
    }
    checkAuthSession();
  }, [setAuth, clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main Layout routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />

            {/* Authenticated User Routes */}
            <Route
              path="/listings/new"
              element={
                <RoleGuard>
                  <CreateListingPage />
                </RoleGuard>
              }
            />
            <Route
              path="/orders"
              element={
                <RoleGuard>
                  <OrdersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <RoleGuard>
                  <OrderDetailPage />
                </RoleGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <RoleGuard>
                  <ProfilePage />
                </RoleGuard>
              }
            />

            {/* Agent Protected Routes */}
            <Route
              path="/agent"
              element={
                <RoleGuard allowedRoles={['AGENT']}>
                  <AgentDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/agent/tasks/:id"
              element={
                <RoleGuard allowedRoles={['AGENT']}>
                  <AgentTaskDetailPage />
                </RoleGuard>
              }
            />
            <Route
              path="/agent/cash"
              element={
                <RoleGuard allowedRoles={['AGENT']}>
                  <AgentCashPage />
                </RoleGuard>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/listings"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminListingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminOrdersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/ledger"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminLedgerPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminAuditPage />
                </RoleGuard>
              }
            />
          </Route>

          {/* Authentication Portals */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/agent/login" element={<AgentLoginPage />} />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

