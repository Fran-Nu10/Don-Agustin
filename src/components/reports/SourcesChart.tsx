import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { RevenueSource } from '../../types/reports';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SourcesChartProps {
  data: RevenueSource[];
}

export function SourcesChart({ data }: SourcesChartProps) {
  // Convert UYU to USD for chart data
  const convertedData = data.map(item => ({
    ...item,
    amount: item.amount / 40, // Using an approximate conversion rate of 40 UYU = 1 USD
  }));

  const chartData = {
    labels: convertedData.map(item => item.source),
    datasets: [
      {
        label: 'Ingresos por Fuente',
        data: convertedData.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 107, 0, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          '#FF6B00',
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#FF6B00',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const dataPoint = convertedData[context.dataIndex];
            return [
              `Ingresos: USD ${context.parsed.y.toLocaleString('en-US')}`,
              `Reservas: ${dataPoint.bookings}`,
              `ROI: ${dataPoint.roi}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
          callback: function(value: any) {
            return 'USD ' + value.toLocaleString('en-US');
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}