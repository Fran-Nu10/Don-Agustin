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
    
    // Scroll to top before navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    navigate(`/viajes?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-3">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="text"
            placeholder="¿A dónde querés ir?"
            {...register('keyword')}
            className="w-full pl-12 pr-4 py-4 text-lg border-none focus:outline-none focus:ring-0 text-white placeholder-white/60 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/40 transition-all duration-300"
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Buscar
        </Button>
      </form>
    </div>
  );
}