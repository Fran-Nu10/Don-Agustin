import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgImage: string;
  badge?: string;
}

export function FeatureCard({ icon, title, description, bgImage, badge }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative h-[320px] md:h-[350px] overflow-hidden rounded-2xl shadow-xl group"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay - darker on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-500"></div>
      </div>

      {/* Badge with number */}
      {badge && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-primary-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg border-2 border-white/30">
            {badge}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-end">
        {/* Icon with solid white background */}
        <div className="bg-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
          <div className="text-primary-600 text-3xl">
            {icon}
          </div>
        </div>

        <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4 group-hover:text-primary-200 transition-colors leading-tight">
          {title}
        </h3>

        <p className="text-white/95 text-base md:text-lg leading-relaxed group-hover:text-white transition-colors">
          {description}
        </p>
      </div>
    </motion.div>
  );
}