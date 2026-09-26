import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout, ProtectedRoute } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FitScorerPage } from './pages/FitScorerPage';
import { MatrixPage } from './pages/MatrixPage';
import { JobsPage } from './pages/JobsPage';
import { AddJobPage } from './pages/AddJobPage';
import { EditJobPage } from './pages/EditJobPage';
import { ContactsPage } from './pages/ContactsPage';
import { AddContactPage } from './pages/AddContactPage';
import { EditContactPage } from './pages/EditContactPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/optimizer',
        element: <FitScorerPage />,
      },
      {
        path: '/fit-scorer',
        element: <FitScorerPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/matrix',
            element: <MatrixPage />,
          },
          {
            path: '/jobs',
            element: <JobsPage />,
          },
          {
            path: '/jobs/new',
            element: <AddJobPage />,
          },
          {
            path: '/jobs/:id/edit',
            element: <EditJobPage />,
          },
          {
            path: '/contacts',
            element: <ContactsPage />,
          },
          {
            path: '/contacts/new',
            element: <AddContactPage />,
          },
          {
            path: '/contacts/:id/edit',
            element: <EditContactPage />,
          },
          {
            path: '/schools',
            element: <JobsPage />,
          },
          {
            path: '/schools/new',
            element: <AddJobPage />,
          },
          {
            path: '/schools/:id/edit',
            element: <EditJobPage />,
          },
          {
            path: '/recommenders',
            element: <ContactsPage />,
          },
          {
            path: '/recommenders/new',
            element: <AddContactPage />,
          },
          {
            path: '/recommenders/:id/edit',
            element: <EditContactPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
