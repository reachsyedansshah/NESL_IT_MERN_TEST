import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuthStore } from './store/useAuthStore';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Posts = lazy(() => import('./pages/Posts'));
const Profile = lazy(() => import('./pages/Profile'));

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <Login />
            </Suspense>
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Posts />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Catch all route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <Navigate to="/" replace />
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes; 