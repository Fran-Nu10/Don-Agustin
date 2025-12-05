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
import { QuotationPage } from './pages/QuotationPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AdminTripsPage } from './pages/admin/TripsPage';
import { BlogsPage } from './pages/admin/BlogsPage';
import { ClientsPage } from './pages/admin/ClientsPage';
import { QuotationsPage } from './pages/admin/QuotationsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import WhatsAppFloat from "./components/WhatsAppFloat";

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
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/cotizacion" element={<QuotationPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/viajes" element={<AdminTripsPage />} />
        <Route path="/admin/clientes" element={<ClientsPage />} />
        <Route path="/admin/cotizaciones" element={<QuotationsPage />} />
        <Route path="/admin/reportes" element={<ReportsPage />} />
        <Route path="/admin/blog" element={<BlogsPage />} />
      </Routes>

       {/* Botón flotante (fuera de Routes) */}
      <WhatsAppFloat
        phone="+59891339099"
        message="Hola VIP Turismo, quiero información sobre paquetes de viaje."
        bottomOffset={18}
        side="right"
      />
    </AuthProvider>
  );
}

export default App;