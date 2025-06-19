import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { CategoryPerformance } from '../../types/reports';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: CategoryPerformance[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const colors = [
    '#FF6B00', // Primary orange
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
  ];

  // Convert UYU to USD for chart data
  const convertedData = data.map(item => ({
    ...item,
    revenue: item.revenue / 40, // Using an approximate conversion rate of 40 UYU = 1 USD
  }));

  const chartData = {
    labels: convertedData.map(item => item.category),
    datasets: [
      {
        data: convertedData.map(item => item.revenue),
        backgroundColor: colors.slice(0, convertedData.length),
        borderColor: colors.slice(0, convertedData.length).map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
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
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: USD ${context.parsed.toLocaleString('en-US')} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}