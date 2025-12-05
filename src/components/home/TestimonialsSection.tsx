import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Award } from 'lucide-react';

const stats = [
  {
    id: '1',
    value: '25+',
    label: 'Años de Experiencia',
    description: 'Liderando el turismo en Uruguay',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    value: '98%',
    label: 'Satisfacción',
    description: 'De nuestros clientes',
    icon: Award,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: '3',
    value: '+10K',
    label: 'Viajeros Felices',
    description: 'Experiencias inolvidables',
    icon: Users,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: '4',
    value: '100+',
    label: 'Destinos',
    description: 'En todo el mundo',
    icon: MapPin,
    gradient: 'from-rose-500 to-pink-500',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-secondary-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-secondary-900 mb-4">
            Resultados que{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              hablan por sí solos
            </span>
          </h2>
          <p className="text-lg md:text-xl text-secondary-600 max-w-3xl mx-auto">
            Números que respaldan nuestra experiencia y compromiso con la excelencia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500"
                       style={{
                         background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                       }}
                  />

                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-6 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="mb-4">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-2 leading-none"
                      >
                        {stat.value}
                      </motion.div>
                      <h3 className="font-heading font-semibold text-lg md:text-xl text-white/90 uppercase tracking-wide mb-2">
                        {stat.label}
                      </h3>
                      <p className="text-sm md:text-base text-white/60">
                        {stat.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{
                         background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                       }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}