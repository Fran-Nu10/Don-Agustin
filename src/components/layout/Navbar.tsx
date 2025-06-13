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

  // Check if we're on home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
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
  }, [lastScrollY, mouseY]);

  // Navbar classes - always orange background with shadow
  const navbarClasses = "fixed top-0 left-0 right-0 z-50 bg-primary-600 shadow-lg";

  // Link classes - always white text on orange background
  const linkClasses = "text-white/90 hover:text-white";
  const activeLinkClasses = "text-white font-semibold";

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.header
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={navbarClasses}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo - Always visible */}
              <Link to="/" className="flex items-center">
                <img 
                  src="/image.png" 
                  alt="Don Agustín Viajes" 
                  className="h-10 w-10 mr-3"
                />
                <span className="font-heading font-bold text-xl text-white">
                  Don Agustín Viajes
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <NavLink 
                  to="/" 
                  isActive={isActive('/')} 
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Inicio
                </NavLink>
                <NavLink 
                  to="/viajes" 
                  isActive={isActive('/viajes')} 
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Viajes
                </NavLink>
                <NavLink 
                  to="/sobre-nosotros" 
                  isActive={isActive('/sobre-nosotros')} 
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Sobre Nosotros
                </NavLink>
                <NavLink 
                  to="/blog" 
                  isActive={isActive('/blog')} 
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Blog
                </NavLink>
                <NavLink 
                  to="/cotizacion" 
                  isActive={isActive('/cotizacion')} 
                  linkClasses={linkClasses}
                  activeLinkClasses={activeLinkClasses}
                >
                  Cotización
                </NavLink>
                <NavLink 
                  to="/contacto" 
                  isActive={isActive('/contacto')} 
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
                        className="text-white border-white hover:bg-white hover:text-primary-600"
                      >
                        Panel Admin
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => logout()} 
                      className="text-white hover:bg-white/10"
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white text-primary-600 hover:bg-white/90"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden focus:outline-none text-white"
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
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden overflow-hidden bg-primary-700 border-t border-primary-500"
              >
                <div className="container mx-auto px-4 py-6">
                  <div className="flex flex-col space-y-4">
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
                      to="/cotizacion"
                      isActive={isActive('/cotizacion')}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cotización
                    </MobileNavLink>
                    <MobileNavLink
                      to="/contacto"
                      isActive={isActive('/contacto')}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contacto
                    </MobileNavLink>
                    
                    {/* Separador visual */}
                    <div className="border-t border-primary-500 my-2"></div>
                    
                    {user ? (
                      <div className="flex flex-col space-y-3">
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
                          className="justify-start text-white hover:bg-white/10"
                        >
                          Cerrar Sesión
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button 
                            variant="secondary" 
                            fullWidth 
                            className="bg-white text-primary-600 hover:bg-white/90"
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
  linkClasses: string;
  activeLinkClasses: string;
}

function NavLink({ to, isActive, children, linkClasses, activeLinkClasses }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`relative font-medium transition-colors ${
        isActive ? activeLinkClasses : linkClasses
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-white" />
      )}
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
      className={`block py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white text-primary-600 shadow-md'
          : 'text-white hover:bg-white/10 hover:text-white'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}