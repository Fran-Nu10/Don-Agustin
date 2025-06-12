import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Only show logo on home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Always show navbar on home page
    if (isHomePage) {
      setShowNavbar(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowNavbar(true);
      } else {
        // Hide navbar when scrolling down (only if mouse is not near top)
        if (mouseY > 100) {
          setShowNavbar(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
      
      // Show navbar when mouse is near the top (within 100px)
      if (e.clientY <= 100) {
        setShowNavbar(true);
      }
    };

    // Only add listeners on desktop (screen width > 768px)
    const checkScreenSize = () => {
      if (window.innerWidth > 768) {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      } else {
        // On mobile, always show navbar
        setShowNavbar(true);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [lastScrollY, mouseY, isHomePage]);

  const navbarClasses = isHomePage 
    ? "absolute top-0 left-0 right-0 z-50" 
    : "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm";

  const linkClasses = isHomePage 
    ? "text-white/80 hover:text-primary-300" 
    : "text-secondary-600 hover:text-primary-600";

  const activeLinkClasses = isHomePage 
    ? "text-white" 
    : "text-primary-600";

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.header
          initial={isHomePage ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={navbarClasses}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo - Only on home page */}
              {isHomePage && (
                <Link to="/" className="flex items-center">
                  <img 
                    src="/image.png" 
                    alt="Don Agustín Viajes" 
                    className="h-12 w-12"
                  />
                </Link>
              )}

              {/* Desktop Navigation */}
              <nav className={`hidden md:flex items-center space-x-8 ${!isHomePage ? 'ml-0' : ''}`}>
                <NavLink 
                  to="/" 
                  isActive={isActive('/')} 
                  isHomePage={isHomePage}
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Inicio
                </NavLink>
                <NavLink 
                  to="/viajes" 
                  isActive={isActive('/viajes')} 
                  isHomePage={isHomePage}
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Viajes
                </NavLink>
                <NavLink 
                  to="/sobre-nosotros" 
                  isActive={isActive('/sobre-nosotros')} 
                  isHomePage={isHomePage}
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Sobre Nosotros
                </NavLink>
                <NavLink 
                  to="/blog" 
                  isActive={isActive('/blog')} 
                  isHomePage={isHomePage}
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Blog
                </NavLink>
                <NavLink 
                  to="/cotizacion" 
                  isActive={isActive('/cotizacion')} 
                  isHomePage={isHomePage}
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Cotización
                </NavLink>
                <NavLink 
                  to="/contacto" 
                  isActive={isActive('/contacto')} 
                  isHomePage={isHomePage}
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Contacto
                </NavLink>
                
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link to="/admin/dashboard">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={isHomePage 
                          ? "text-white border-white hover:bg-white hover:text-primary-600" 
                          : "text-primary-600 border-primary-600 hover:bg-primary-50"
                        }
                      >
                        Panel Admin
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => logout()} 
                      className={isHomePage 
                        ? "text-white hover:bg-white/10" 
                        : "text-secondary-600 hover:bg-secondary-100"
                      }
                    >
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
                className={`md:hidden focus:outline-none ${isHomePage ? 'text-white' : 'text-secondary-900'}`}
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

          {/* Mobile Navigation - MEJORADO */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`md:hidden overflow-hidden ${
                  isHomePage 
                    ? 'bg-white/95 backdrop-blur-md border-t border-white/20' 
                    : 'bg-white border-t border-secondary-200 shadow-lg'
                }`}
              >
                <div className="container mx-auto px-4 py-6">
                  <div className="flex flex-col space-y-4">
                    <MobileNavLink
                      to="/"
                      isActive={isActive('/')}
                      onClick={() => setIsMenuOpen(false)}
                      isHomePage={isHomePage}
                    >
                      Inicio
                    </MobileNavLink>
                    <MobileNavLink
                      to="/viajes"
                      isActive={isActive('/viajes')}
                      onClick={() => setIsMenuOpen(false)}
                      isHomePage={isHomePage}
                    >
                      Viajes
                    </MobileNavLink>
                    <MobileNavLink
                      to="/sobre-nosotros"
                      isActive={isActive('/sobre-nosotros')}
                      onClick={() => setIsMenuOpen(false)}
                      isHomePage={isHomePage}
                    >
                      Sobre Nosotros
                    </MobileNavLink>
                    <MobileNavLink
                      to="/blog"
                      isActive={isActive('/blog')}
                      onClick={() => setIsMenuOpen(false)}
                      isHomePage={isHomePage}
                    >
                      Blog
                    </MobileNavLink>
                    <MobileNavLink
                      to="/cotizacion"
                      isActive={isActive('/cotizacion')}
                      onClick={() => setIsMenuOpen(false)}
                      isHomePage={isHomePage}
                    >
                      Cotización
                    </MobileNavLink>
                    <MobileNavLink
                      to="/contacto"
                      isActive={isActive('/contacto')}
                      onClick={() => setIsMenuOpen(false)}
                      isHomePage={isHomePage}
                    >
                      Contacto
                    </MobileNavLink>
                    
                    {/* Separador visual */}
                    <div className={`border-t ${isHomePage ? 'border-secondary-300' : 'border-secondary-200'} my-2`}></div>
                    
                    {user ? (
                      <div className="flex flex-col space-y-3">
                        <MobileNavLink
                          to="/admin/dashboard"
                          isActive={isActive('/admin/dashboard')}
                          onClick={() => setIsMenuOpen(false)}
                          isHomePage={isHomePage}
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
                          className={`justify-start ${
                            isHomePage 
                              ? "text-secondary-700 hover:bg-secondary-100" 
                              : "text-secondary-600 hover:bg-secondary-100"
                          }`}
                        >
                          Cerrar Sesión
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button 
                            variant="primary" 
                            fullWidth 
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                          >
                            Iniciar Sesión
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
  isHomePage: boolean;
  linkClasses: string;
  activeLinkClasses: string;
}

function NavLink({ to, isActive, children, isHomePage, linkClasses, activeLinkClasses }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`relative font-medium transition-colors ${
        isActive ? activeLinkClasses : linkClasses
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-primary-600" />
      )}
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isHomePage: boolean;
}

function MobileNavLink({ to, isActive, onClick, children, isHomePage }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      className={`block py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : isHomePage 
            ? 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900' 
            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}