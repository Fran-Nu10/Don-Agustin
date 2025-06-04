import React from 'react';
import { IncludedService } from '../../types';
import * as Icons from 'lucide-react';

interface IncludedServicesProps {
  services: IncludedService[];
}

export function IncludedServices({ services }: IncludedServicesProps) {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6 text-primary-950" /> : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <div
          key={index}
          className="flex items-start p-4 bg-white rounded-lg border border-secondary-200 transition-shadow hover:shadow-card"
        >
          <div className="mr-4 p-2 bg-primary-50 rounded-full">
            {getIcon(service.icon)}
          </div>
          <div>
            <h4 className="font-heading font-medium text-lg text-secondary-900 mb-1">
              {service.title}
            </h4>
            <p className="text-sm text-secondary-600">{service.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}