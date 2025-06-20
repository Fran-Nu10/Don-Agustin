import React from 'react';
import { Trip } from '../../types';
import { TripCard } from './TripCard';

interface RelatedTripsProps {
  currentTrip: Trip;
  allTrips: Trip[];
}

export function RelatedTrips({ currentTrip, allTrips }: RelatedTripsProps) {
  // Get 3 related trips from the same destination, excluding the current trip
  const relatedTrips = allTrips
    .filter(
      (trip) =>
        trip.id !== currentTrip.id &&
        trip.destination === currentTrip.destination
    )
    .slice(0, 3);

  // If we don't have enough related trips from the same destination,
  // add other trips until we have 3
  if (relatedTrips.length < 3) {
    const otherTrips = allTrips
      .filter(
        (trip) =>
          trip.id !== currentTrip.id &&
          !relatedTrips.find((related) => related.id === trip.id)
      )
      .slice(0, 3 - relatedTrips.length);

    relatedTrips.push(...otherTrips);
  }

  if (relatedTrips.length === 0) return null;

  return (
    <div>
      <h3 className="font-heading font-bold text-2xl mb-4 text-secondary-900">
        Otros paquetes que te pueden interesar
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}