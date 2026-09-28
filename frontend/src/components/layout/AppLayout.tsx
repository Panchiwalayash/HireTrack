import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataProvider, useData } from '../../context/DataContext';
import { Navbar } from './Navbar';
import { Briefcase } from 'lucide-react';

const AppLayoutInner: React.FC = () => {
  const { user } = useAuth();
  const { isDataLoading, handleImportOptimizedJobs } = useData();

  const location = useLocation();

  useEffect(() => {
    if (user) {
      const pending = sessionStorage.getItem('pending_portfolio_import');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (Array.isArray(parsed) && parsed.length > 0) {
            handleImportOptimizedJobs(parsed);
            sessionStorage.removeItem('pending_portfolio_import');
          }
        } catch (e) {
          console.error('Failed to import pending portfolio:', e);
        }
      }
    }
  }, [user, handleImportOptimizedJobs]);

  return (
    <div className="app-container">
      {/* Living Ambient Glowing Orbs on every page */}
      <div className="global-orb global-orb--1" aria-hidden="true" />
      <div className="global-orb global-orb--2" aria-hidden="true" />
      <Navbar />
      <main key={location.pathname} className="main-content page-enter-animation">
        {isDataLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <span
              style={{ fontSize: '0.78rem', color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#06B6D4',
                  display: 'inline-block',
                }}
              />
              Syncing records...
            </span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <DataProvider>
      <AppLayoutInner />
    </DataProvider>
  );
};

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Briefcase size={44} color="#6366F1" style={{ animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Job Hunt OS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
};
