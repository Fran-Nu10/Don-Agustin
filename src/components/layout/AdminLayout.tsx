import React, { ReactNode, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Map, Users, LogOut, ChevronRight, FileText, UserCheck, Calculator, BarChart3, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isOwner, isEmployee, logout, loading } = useAuth();
  
  console.log('AdminLayout rendering with user:', user);
  console.log('isOwner():', isOwner());
  console.log('isEmployee():', isEmployee());
  
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar - Updated with gradient background and toggle button */}
      <div 
        className={`hidden md:flex md:flex-col ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-gradient-to-b from-[#1A2238] to-[#121A2F] shadow-md transition-all duration-300`}
      >
        <div className="p-4 border-b border-secondary-700 flex items-center justify-between">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg text-[#E9D8B4]">
                TravelSuite360
              </span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-[#E9D8B4]" />
            </Link>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="text-white hover:text-[#E9D8B4] transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink
            to="/admin/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            isActive={isActive('/admin/dashboard')}
            collapsed={sidebarCollapsed}
          >
            Dashboard
          </SidebarLink>
          
          <SidebarLink
            to="/admin/viajes"
            icon={<Map className="h-5 w-5" />}
            isActive={isActive('/admin/viajes')}
            collapsed={sidebarCollapsed}
          >
            Paquetes
          </SidebarLink>
          
          {(isOwner() || isEmployee()) && (
            <>
              <SidebarLink
                to="/admin/clientes"
                icon={<UserCheck className="h-5 w-5" />}
                isActive={isActive('/admin/clientes')}
                collapsed={sidebarCollapsed}
              >
                CRM - Clientes
              </SidebarLink>
              
              <SidebarLink
                to="/admin/cotizaciones"
                icon={<Calculator className="h-5 w-5" />}
                isActive={isActive('/admin/cotizaciones')}
                collapsed={sidebarCollapsed}
              >
                Cotizaciones
              </SidebarLink>

              {isOwner() && (
                <>
                  <SidebarLink
                    to="/admin/reportes"
                    icon={<BarChart3 className="h-5 w-5" />}
                    isActive={isActive('/admin/reportes')}
                    collapsed={sidebarCollapsed}
                  >
                    Reportes Financieros
                  </SidebarLink>
                  
                  <SidebarLink
                    to="/admin/blog"
                    icon={<FileText className="h-5 w-5" />}
                    isActive={isActive('/admin/blog')}
                    collapsed={sidebarCollapsed}
                  >
                    Blog
                  </SidebarLink>
                </>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-secondary-700">
          <Button
            onClick={() => logout()}
            variant="ghost"
            className={`${sidebarCollapsed ? 'justify-center' : 'justify-start w-full'} text-white hover:text-white hover:bg-secondary-700`}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Updated with gradient background */}
        <header className="md:hidden bg-gradient-to-r from-[#1A2238] to-[#121A2F] shadow-md p-4 flex items-center justify-between">
          <div className="font-heading font-bold text-lg text-[#E9D8B4]">
            TravelSuite360
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </header>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-br from-[#1A2238]/95 via-[#121A2F]/95 to-[#1A2238]/95 pt-16">
            <nav className="p-4 space-y-2">
              <MobileNavLink
                to="/admin/dashboard"
                isActive={isActive('/admin/dashboard')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </MobileNavLink>
              
              <MobileNavLink
                to="/admin/viajes"
                isActive={isActive('/admin/viajes')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Map className="h-5 w-5 mr-3" />
                Paquetes
              </MobileNavLink>
              
              {(isOwner() || isEmployee()) && (
                <>
                  <MobileNavLink
                    to="/admin/clientes"
                    isActive={isActive('/admin/clientes')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCheck className="h-5 w-5 mr-3" />
                    CRM - Clientes
                  </MobileNavLink>
                  
                  <MobileNavLink
                    to="/admin/cotizaciones"
                    isActive={isActive('/admin/cotizaciones')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calculator className="h-5 w-5 mr-3" />
                    Cotizaciones
                  </MobileNavLink>
                  
                  {isOwner() && (
                    <>
                      <MobileNavLink
                        to="/admin/reportes"
                        isActive={isActive('/admin/reportes')}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BarChart3 className="h-5 w-5 mr-3" />
                        Reportes Financieros
                      </MobileNavLink>
                      
                      <MobileNavLink
                        to="/admin/blog"
                        isActive={isActive('/admin/blog')}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        Blog
                      </MobileNavLink>
                    </>
                  )}
                </>
              )}
              
              <div className="border-t border-secondary-700 my-4"></div>
              
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center text-sm text-secondary-500">
            <Link to="/admin/dashboard" className="hover:text-primary-950">
              Admin
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-secondary-900 font-medium">
              {location.pathname.split('/').pop()?.charAt(0).toUpperCase() + 
                location.pathname.split('/').pop()?.slice(1) || 'Dashboard'}
            </span>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
  collapsed: boolean;
}

function SidebarLink({ to, icon, isActive, children, collapsed }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-2 rounded-md font-medium transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-secondary-300 hover:text-white hover:bg-secondary-700/50'
      }`}
    >
      <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
      {!collapsed && children}
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function MobileNavLink({ to, isActive, onClick, children }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : 'text-white hover:bg-secondary-700'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}