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
      
      // Update scroll state for styling
      setIsScrolled(currentScrollY > 50);
      
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

  // Dynamic navbar classes with scroll effects
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? 'bg-primary-600/95 backdrop-blur-md shadow-lg' 
      : 'bg-primary-600 shadow-lg'
  }`;

  // Link classes - always white text on orange background
  const linkClasses = "text-white/90 hover:text-white transition-colors duration-200";
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
              <Link to="/" className="flex items-center group">
                <img 
                  src="/image.png" 
                  alt="Don Agustín Viajes" 
                  className="h-10 w-10 mr-3 transition-transform duration-200 group-hover:scale-105"
                />
                <span className="font-heading font-bold text-xl text-white transition-colors duration-200 group-hover:text-primary-100">
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
                        className="text-white border-white hover:bg-white hover:text-primary-600 transition-all duration-200"
                      >
                        Panel Admin
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => logout()} 
                      className="text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white text-primary-600 hover:bg-white/90 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button with Gradient Design */}
              <button
                className="md:hidden focus:outline-none relative group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:from-white/30 group-hover:to-white/20 group-hover:scale-105 group-active:scale-95">
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Gradient glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-400/50 to-primary-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation with Enhanced Design */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
              >
                {/* Gradient Background */}
                <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 border-t border-primary-500/30">
                  {/* Decorative overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                  
                  <div className="container mx-auto px-4 py-6 relative">
                    <div className="flex flex-col space-y-2">
                      <MobileNavLink
                        to="/"
                        isActive={isActive('/')}
                        onClick={() => setIsMenuOpen(false)}
                        delay={0.1}
                      >
                        🏠 Inicio
                      </MobileNavLink>
                      <MobileNavLink
                        to="/viajes"
                        isActive={isActive('/viajes')}
                        onClick={() => setIsMenuOpen(false)}
                        delay={0.15}
                      >
                        ✈️ Viajes
                      </MobileNavLink>
                      <MobileNavLink
                        to="/sobre-nosotros"
                        isActive={isActive('/sobre-nosotros')}
                        onClick={() => setIsMenuOpen(false)}
                        delay={0.2}
                      >
                        👥 Sobre Nosotros
                      </MobileNavLink>
                      <MobileNavLink
                        to="/blog"
                        isActive={isActive('/blog')}
                        onClick={() => setIsMenuOpen(false)}
                        delay={0.25}
                      >
                        📝 Blog
                      </MobileNavLink>
                      <MobileNavLink
                        to="/cotizacion"
                        isActive={isActive('/cotizacion')}
                        onClick={() => setIsMenuOpen(false)}
                        delay={0.3}
                      >
                        💰 Cotización
                      </MobileNavLink>
                      <MobileNavLink
                        to="/contacto"
                        isActive={isActive('/contacto')}
                        onClick={() => setIsMenuOpen(false)}
                        delay={0.35}
                      >
                        📞 Contacto
                      </MobileNavLink>
                      
                      {/* Separador con gradiente */}
                      <motion.div 
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3"
                      ></motion.div>
                      
                      {user ? (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.45 }}
                          className="flex flex-col space-y-3"
                        >
                          <MobileNavLink
                            to="/admin/dashboard"
                            isActive={isActive('/admin/dashboard')}
                            onClick={() => setIsMenuOpen(false)}
                            delay={0.5}
                          >
                            ⚙️ Panel Admin
                          </MobileNavLink>
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.55 }}
                          >
                            <Button
                              variant="ghost"
                              fullWidth
                              onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                              }}
                              className="justify-start text-white hover:bg-white/10 transition-all duration-200 rounded-xl"
                            >
                              🚪 Cerrar Sesión
                            </Button>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.45 }}
                          className="pt-2"
                        >
                          <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                            <Button 
                              variant="secondary" 
                              fullWidth 
                              className="bg-gradient-to-r from-white to-white/95 text-primary-600 hover:from-white/95 hover:to-white/90 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl font-semibold"
                            >
                              🔐 Iniciar Sesión
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom gradient decoration */}
                  <div className="h-1 bg-gradient-to-r from-primary-800 via-primary-500 to-primary-800"></div>
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
      className={`relative font-medium transition-all duration-200 hover:scale-105 ${
        isActive ? activeLinkClasses : linkClasses
      }`}
    >
      {children}
      {isActive && (
        <motion.span 
          layoutId="activeIndicator"
          className="absolute inset-x-0 -bottom-2 h-0.5 bg-white rounded-full" 
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  delay?: number;
}

function MobileNavLink({ to, isActive, onClick, children, delay = 0 }: MobileNavLinkProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        to={to}
        className={`block py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
          isActive
            ? 'bg-gradient-to-r from-white to-white/95 text-primary-600 shadow-lg font-semibold'
            : 'text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:text-white backdrop-blur-sm'
        }`}
        onClick={onClick}
      >
        <span className="flex items-center">
          {children}
        </span>
        
        {/* Subtle glow effect for active items */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10 -z-10 blur-sm"></div>
        )}
      </Link>
    </motion.div>
  );
}