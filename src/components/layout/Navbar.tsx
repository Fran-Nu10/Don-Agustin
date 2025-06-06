import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Only show logo on home page
  const isHomePage = location.pathname === '/';

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Only on home page */}
          {isHomePage && (
            <Link to="/\" className="flex items-center">
              <img 
                src="/image.png" 
                alt="Don Agustín Viajes" 
                className="h-12 w-12"
              />
            </Link>
          )}

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center space-x-8 ${!isHomePage ? 'ml-0' : ''}`}>
            <NavLink to="/" isActive={isActive('/')}>
              Inicio
            </NavLink>
            <NavLink to="/viajes" isActive={isActive('/viajes')}>
              Viajes
            </NavLink>
            <NavLink to="/sobre-nosotros" isActive={isActive('/sobre-nosotros')}>
              Sobre Nosotros
            </NavLink>
            <NavLink to="/blog" isActive={isActive('/blog')}>
              Blog
            </NavLink>
            <NavLink to="/contacto" isActive={isActive('/contacto')}>
              Contacto
            </NavLink>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/admin/dashboard">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary-600">
                    Panel Admin
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="text-white hover:bg-white/10">
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" className="bg-primary-600 hover:bg-primary-700">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-black/90 backdrop-blur-sm pb-4 px-4"
        >
          <div className="flex flex-col space-y-3">
            <MobileNavLink
              to="/"
              isActive={isActive('/')}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </MobileNavLink>
            <MobileNavLink
              to="/viajes"
              isActive={isActive('/viajes')}
              onClick={() => setIsMenuOpen(false)}
            >
              Viajes
            </MobileNavLink>
            <MobileNavLink
              to="/sobre-nosotros"
              isActive={isActive('/sobre-nosotros')}
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre Nosotros
            </MobileNavLink>
            <MobileNavLink
              to="/blog"
              isActive={isActive('/blog')}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </MobileNavLink>
            <MobileNavLink
              to="/contacto"
              isActive={isActive('/contacto')}
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </MobileNavLink>
            
            {user ? (
              <>
                <MobileNavLink
                  to="/admin/dashboard"
                  isActive={isActive('/admin/dashboard')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Panel Admin
                </MobileNavLink>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <MobileNavLink
                to="/login"
                isActive={isActive('/login')}
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </MobileNavLink>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ to, isActive, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`relative font-medium transition-colors hover:text-primary-300 ${
        isActive ? 'text-white' : 'text-white/80'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-primary-600" />
      )}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ to, isActive, onClick, children }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      className={`block py-2 px-3 rounded-md font-medium ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}