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
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrolled, setIsScrolled] = useState(false);
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

      // Update isScrolled state
      setIsScrolled(currentScrollY > 50);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setScrollDirection('down');
        setShowNavbar(false);
      } else {
        // Scrolling up or at the top
        setScrollDirection('up');
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Only add scroll listener on desktop and tablet
    if (window.innerWidth >= 768) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      // On mobile, always show navbar
      setShowNavbar(true);
    }

    // Listen for resize events
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowNavbar(true);
        window.removeEventListener('scroll', handleScroll);
      } else {
        window.addEventListener('scroll', handleScroll, { passive: true });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

  // Navbar classes - transparent on homepage when not scrolled, solid otherwise
  const isTransparent = isHomePage && !isScrolled;
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isTransparent
      ? 'bg-transparent backdrop-blur-md border-b border-white/10'
      : 'bg-primary-600 shadow-lg'
  }`;

  // Link classes - white text with shadow on transparent, white on solid
  const linkClasses = isTransparent
    ? "text-white/95 hover:text-white drop-shadow-md"
    : "text-white/90 hover:text-white";
  const activeLinkClasses = isTransparent
    ? "text-white font-semibold drop-shadow-md"
    : "text-white font-semibold";

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.header
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={navbarClasses}
          style={{ transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)' }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo - Always visible */}
              <Link to="/" className="flex items-center">
                <img
                  src="/427173037_306946561968763_5005834942579133161_n.jpg"
                  alt="VIP Turismo"
                  className="h-10 w-auto mr-3"
                />
                <span className="font-heading font-bold text-xl text-white">
                  VIP Turismo
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
                  Paquetes
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
                        className={isTransparent
                          ? "text-white border-white/80 hover:bg-white hover:text-primary-600 backdrop-blur-sm"
                          : "text-white border-white hover:bg-white hover:text-primary-600"
                        }
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
                      className={isTransparent
                        ? "bg-white/90 text-primary-600 hover:bg-white backdrop-blur-sm shadow-lg"
                        : "bg-white text-primary-600 hover:bg-white/90"
                      }
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

          {/* Mobile Navigation with Beautiful Orange Gradient */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #F04444 25%, #DC5F5F 50%, #C73232 75%, #A82A2A 100%)'
                }}
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
                      Paquetes
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
                    
                    {/* Separador visual con gradiente sutil */}
                    <div className="border-t border-white/20 my-2"></div>
                    
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
                            className="bg-white text-primary-600 hover:bg-white/90 shadow-lg"
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
          ? 'bg-white text-primary-600 shadow-md transform scale-105'
          : 'text-white hover:bg-white/10 hover:text-white hover:transform hover:scale-105'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}