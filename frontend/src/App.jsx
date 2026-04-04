import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MaterialProvider } from './context/MaterialContext';
import { CourseProvider } from './context/CourseContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseExplorer from './pages/CourseExplorer';
import MaterialDetail from './pages/MaterialDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AboutUs from './pages/AboutUs';
import Admin from './pages/Admin';
import AIAssistant from './pages/AIAssistant';
import MasterclassPlayer from './pages/MasterclassPlayer';
import HoneyTeacher from './pages/HoneyTeacher';
import HoneyInterviewer from './pages/HoneyInterviewer';

function AuthGate({ children, fallback }) {
  const { authLoading } = useAuth();
  if (authLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      )
    );
  }
  return children;
}

function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-14 sm:pt-16">
          <AuthGate>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/honey-teacher" element={<HoneyTeacher />} />
              <Route path="/honey-interviewer" element={<PrivateRoute><HoneyInterviewer /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/courses" element={<PrivateRoute><CourseExplorer /></PrivateRoute>} />
              <Route path="/materials/:id" element={<MaterialDetail />} />
              <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/ai-assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
              <Route path="/masterclass/:id" element={<MasterclassPlayer />} />
            </Routes>
          </AuthGate>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CourseProvider>
            <MaterialProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </MaterialProvider>
          </CourseProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
