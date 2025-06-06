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
    // Only apply smart navbar behavior on non-home pages and desktop
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
      {(showNavbar || isHomePage) && (
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

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`md:hidden pb-4 px-4 ${isHomePage ? 'bg-black/90 backdrop-blur-sm' : 'bg-white border-t border-secondary-200'}`}
            >
              <div className="flex flex-col space-y-3">
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
                  to="/contacto"
                  isActive={isActive('/contacto')}
                  onClick={() => setIsMenuOpen(false)}
                  isHomePage={isHomePage}
                >
                  Contacto
                </MobileNavLink>
                
                {user ? (
                  <>
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
                      className={isHomePage ? "text-white hover:bg-white/10" : "text-secondary-600 hover:bg-secondary-100"}
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <MobileNavLink
                    to="/login"
                    isActive={isActive('/login')}
                    onClick={() => setIsMenuOpen(false)}
                    isHomePage={isHomePage}
                  >
                    Iniciar Sesión
                  </MobileNavLink>
                )}
              </div>
            </motion.div>
          )}
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
      className={`block py-2 px-3 rounded-md font-medium ${
        isActive
          ? isHomePage 
            ? 'bg-primary-600 text-white' 
            : 'bg-primary-100 text-primary-600'
          : isHomePage 
            ? 'text-white/80 hover:bg-white/10 hover:text-white' 
            : 'text-secondary-600 hover:bg-secondary-100'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}