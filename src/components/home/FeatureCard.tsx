import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgImage: string;
}

export function FeatureCard({ icon, title, description, bgImage }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative h-full overflow-hidden rounded-xl shadow-lg group"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Overlay con menos opacidad para que se vea el color original de la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-primary-900/40 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
        
        <h3 className="font-heading font-bold text-xl text-white mb-3 group-hover:text-primary-200 transition-colors">
          {title}
        </h3>
        
        <p className="text-white/90 text-sm md:text-base group-hover:text-white transition-colors">
          {description}
        </p>
      </div>
    </motion.div>
  );
}