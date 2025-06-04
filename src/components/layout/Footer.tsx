import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-primary-500 mr-2" />
              Don Agustín Viajes
            </h3>
            <p className="text-secondary-300 mb-4">
              Tu agencia de viajes de confianza para descubrir el mundo desde 1995.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-300 hover:text-primary-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-300 hover:text-primary-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-300 hover:text-primary-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
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
                  className="text-secondary-300 hover:text-primary-500 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/viajes"
                  className="text-secondary-300 hover:text-primary-500 transition-colors"
                >
                  Viajes
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-secondary-300 hover:text-primary-500 transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-secondary-300 hover:text-primary-500 transition-colors"
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
                <MapPin className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                <span className="text-secondary-300">
                  Av. 18 de Julio 1234, Montevideo, Uruguay
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-500 mr-2" />
                <span className="text-secondary-300">+598 2345 6789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-500 mr-2" />
                <a
                  href="mailto:info@donagustinviajes.com.uy"
                  className="text-secondary-300 hover:text-primary-500 transition-colors"
                >
                  info@donagustinviajes.com.uy
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