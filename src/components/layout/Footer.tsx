import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/logo-don-agustin.png"
                alt="Don Agustín Viajes"
                className="h-10 w-auto mr-3"
              />
              <h3 className="font-heading text-xl font-bold">
                Don Agustín Viajes
              </h3>
            </div>
            <p className="text-secondary-300 mb-4 font-semibold">
              Tu agencia de confianza desde 1997
            </p>
            <p className="text-secondary-400 mb-4 text-sm">
              Más de 25 años brindando experiencias inolvidables. Turismo nacional e internacional personalizado.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/donagustinviajes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-300 hover:text-primary-600 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/donagustinviajes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-300 hover:text-primary-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-secondary-300 hover:text-primary-600 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/viajes"
                  className="text-secondary-300 hover:text-primary-600 transition-colors"
                >
                  Paquetes
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-secondary-300 hover:text-primary-600 transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-secondary-300 hover:text-primary-600 transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Contáctanos</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                <span className="text-secondary-300">
                  18 de Julio 1236, 11100 Montevideo, Uruguay
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-secondary-300">091 339 099</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-600 mr-2" />
                <a
                  href="mailto:info@donagustinviajes.com"
                  className="text-secondary-300 hover:text-primary-600 transition-colors"
                >
                  info@donagustinviajes.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-700 mt-10 pt-6 text-center text-secondary-400 text-sm">
          <p>© {new Date().getFullYear()} Don Agustín Viajes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
