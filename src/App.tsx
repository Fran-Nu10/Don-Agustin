import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { TripsPage } from './pages/TripsPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AdminTripsPage } from './pages/admin/TripsPage';
import { BookingsPage } from './pages/admin/BookingsPage';
import { BlogsPage } from './pages/admin/BlogsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/viajes" element={<TripsPage />} />
        <Route path="/viajes/:id" element={<TripDetailPage />} />
        <Route path="/sobre-nosotros" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/viajes" element={<AdminTripsPage />} />
        <Route path="/admin/agendados" element={<BookingsPage />} />
        <Route path="/admin/blog" element={<BlogsPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;