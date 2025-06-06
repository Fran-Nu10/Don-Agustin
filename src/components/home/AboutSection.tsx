import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, Shield } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl text-secondary-900 mb-4">
            Don Agustín - Viajes y Turismo
          </h2>
          <p className="text-lg text-secondary-600">
            Desde 1997, brindando experiencias únicas y servicios integrales a nuestros clientes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="prose prose-lg"
          >
            <p className="text-secondary-600">
              Somos una Agencia de Viajes que brinda servicios integrales a sus clientes, establecida en 1997.
              Desde entonces hemos conquistado una importante presencia en el mercado nacional como proveedor
              de viajes y excursiones, tanto para viajes de empresa como vacacionales.
            </p>
            <p className="text-secondary-600">
              Trabajamos orientados a ofrecer el mejor servicio a nuestros clientes, guiados por estos valores:
              Profesionalismo, Servicio, Compromiso y Respaldo.
            </p>
            <p className="text-secondary-600">
              Acompañamos los avances tecnológicos que impactan directamente en la industria de los viajes,
              utilizando redes sociales, newsletters y sitio web. Sin embargo, ponemos énfasis en la atención
              personalizada para quienes prefieren una experiencia de consulta más tradicional y cercana.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <ValueCard
              icon={<Award className="h-8 w-8 text-primary-600" />}
              title="Profesionalismo"
              description="Más de 25 años de experiencia en el mercado turístico"
            />
            <ValueCard
              icon={<Users className="h-8 w-8 text-primary-600" />}
              title="Servicio"
              description="Atención personalizada y asesoramiento experto"
            />
            <ValueCard
              icon={<Target className="h-8 w-8 text-primary-600" />}
              title="Compromiso"
              description="Dedicación total a la satisfacción del cliente"
            />
            <ValueCard
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Respaldo"
              description="Garantía y seguridad en todos nuestros servicios"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-secondary-50 p-8 rounded-lg"
          >
            <h3 className="font-heading font-bold text-2xl text-secondary-900 mb-4">
              Nuestra Misión
            </h3>
            <p className="text-secondary-600">
              Convertirnos en una agencia que no solo ofrezca calidad, profesionalismo y respaldo,
              sino también integridad, para lograr que cada viaje sea una experiencia inolvidable,
              cuidando siempre la mejor relación costo-beneficio.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
            className="bg-secondary-50 p-8 rounded-lg"
          >
            <h3 className="font-heading font-bold text-2xl text-secondary-900 mb-4">
              Nuestra Visión
            </h3>
            <p className="text-secondary-600">
              Ser una herramienta indispensable al momento de viajar, trabajando en equipo y
              orientados a agregar valor, logrando la preferencia y fidelidad de nuestros clientes.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="bg-secondary-50 p-6 rounded-lg">
      <div className="flex items-center mb-3">
        <div className="bg-white p-2 rounded-lg mr-3">
          {icon}
        </div>
        <h4 className="font-heading font-bold text-lg text-secondary-900">
          {title}
        </h4>
      </div>
      <p className="text-secondary-600">
        {description}
      </p>
    </div>
  );
}