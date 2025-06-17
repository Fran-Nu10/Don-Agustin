import React, { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Map, Users, LogOut, ChevronRight, FileText, UserCheck, Calculator, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isOwner, isEmployee, logout, loading } = useAuth();
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar - Updated with gradient background */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-secondary-800 to-secondary-900 shadow-md">
        <div className="p-4 border-b border-secondary-700">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-heading font-bold text-lg text-white">
              Don Agustín Viajes
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink
            to="/admin/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            isActive={isActive('/admin/dashboard')}
          >
            Dashboard
          </SidebarLink>
          
          <SidebarLink
            to="/admin/viajes"
            icon={<Map className="h-5 w-5" />}
            isActive={isActive('/admin/viajes')}
          >
            Viajes
          </SidebarLink>
          
          {(isOwner() || isEmployee()) && (
            <>
              <SidebarLink
                to="/admin/clientes"
                icon={<UserCheck className="h-5 w-5" />}
                isActive={isActive('/admin/clientes')}
              >
                CRM - Clientes
              </SidebarLink>
              
              <SidebarLink
                to="/admin/cotizaciones"
                icon={<Calculator className="h-5 w-5" />}
                isActive={isActive('/admin/cotizaciones')}
              >
                Cotizaciones
              </SidebarLink>

              {isOwner() && (
                <>
                  <SidebarLink
                    to="/admin/reportes"
                    icon={<BarChart3 className="h-5 w-5" />}
                    isActive={isActive('/admin/reportes')}
                  >
                    Reportes Financieros
                  </SidebarLink>
                  
                  <SidebarLink
                    to="/admin/blog"
                    icon={<FileText className="h-5 w-5" />}
                    isActive={isActive('/admin/blog')}
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
            className="w-full justify-start text-secondary-300 hover:text-white hover:bg-secondary-700"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Updated with gradient background */}
        <header className="md:hidden bg-gradient-to-r from-secondary-800 to-secondary-900 shadow-md p-4 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-lg text-white">
            Don Agustín Viajes
          </Link>
          
          <div className="flex items-center space-x-4">
            <MobileNavMenu isOwner={isOwner()} isEmployee={isEmployee()} logout={logout} />
          </div>
        </header>
        
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
}

function SidebarLink({ to, icon, isActive, children }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-secondary-300 hover:text-white hover:bg-secondary-700/50'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  );
}

interface MobileNavMenuProps {
  isOwner: boolean;
  isEmployee: boolean;
  logout: () => Promise<void>;
}

function MobileNavMenu({ isOwner, isEmployee, logout }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-white">
        <span className="sr-only">Open menu</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-secondary-800 to-secondary-900 rounded-md shadow-lg py-1 z-10">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/viajes"
            className="block px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Viajes
          </Link>
          {(isOwner || isEmployee) && (
            <>
              <Link
                to="/admin/clientes"
                className="block px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                CRM - Clientes
              </Link>
              <Link
                to="/admin/cotizaciones"
                className="block px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Cotizaciones
              </Link>
              {isOwner && (
                <>
                  <Link
                    to="/admin/reportes"
                    className="block px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Reportes Financieros
                  </Link>
                  <Link
                    to="/admin/blog"
                    className="block px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Blog
                  </Link>
                </>
              )}
            </>
          )}
          <div className="border-t border-secondary-700 my-1"></div>
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-secondary-100 hover:bg-secondary-700 hover:text-white"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}