import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ItineraryDay } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TripItineraryProps {
  itinerary: ItineraryDay[];
}

export function TripItinerary({ itinerary }: TripItineraryProps) {
  const [openDay, setOpenDay] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {itinerary.map((day, index) => (
        <div
          key={index}
          className="border border-secondary-200 rounded-lg overflow-hidden"
        >
          <button
            className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
              openDay === index
                ? 'bg-primary-50 text-primary-950'
                : 'bg-white hover:bg-secondary-50'
            }`}
            onClick={() => setOpenDay(openDay === index ? null : index)}
          >
            <div className="flex items-center">
              <span className="font-heading font-bold">Día {day.day}</span>
              <span className="ml-2 font-medium text-secondary-600">
                - {day.title}
              </span>
            </div>
            {openDay === index ? (
              <ChevronUp className="h-5 w-5 text-primary-950" />
            ) : (
              <ChevronDown className="h-5 w-5 text-secondary-400" />
            )}
          </button>
          
          <AnimatePresence>
            {openDay === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-secondary-200"
              >
                <div className="p-4 bg-white">
                  <p className="text-secondary-600">{day.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}