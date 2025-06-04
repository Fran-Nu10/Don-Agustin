import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useForm } from 'react-hook-form';
import { SearchFormData } from '../../types';

interface TripSearchProps {
  destinations: string[];
}

export function TripSearch({ destinations }: TripSearchProps) {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<SearchFormData>();

  const onSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();
    if (data.destination) params.append('destination', data.destination);
    if (data.date) params.append('date', data.date);
    if (data.keyword) params.append('keyword', data.keyword);
    
    navigate(`/viajes?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-2">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          placeholder="¿A dónde querés ir?"
          {...register('keyword')}
          className="flex-1 px-6 py-3 text-lg border-none focus:outline-none focus:ring-0 text-secondary-900 placeholder-secondary-400 rounded-md"
        />
        <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[120px]">
          Buscar
        </Button>
      </form>
    </div>
  );
}