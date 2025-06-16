export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageBookingValue: number;
  totalBookings: number;
  conversionRate: number;
  leadsGenerated: number;
  salesActivities: number;
  // New field for client revenue
  clientRevenue?: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  growth: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  bookings: number;
  marketShare: number;
  growth: number;
}

export interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
  bookings: number;
  roi: number;
}

export interface SalesPerformance {
  name: string;
  leads: number;
  opportunities: number;
  revenue: number;
  conversionRate: number;
  averageDealSize: number;
}

export interface FinancialTarget {
  id: string;
  targetType: 'monthly' | 'quarterly' | 'yearly';
  targetPeriod: string;
  revenueTarget: number;
  bookingsTarget: number;
  leadsTarget: number;
  conversionTarget: number;
  actualRevenue: number;
  actualBookings: number;
  actualLeads: number;
  actualConversion: number;
  achievementRate: number;
}

export interface ReportsData {
  metrics: RevenueMetrics;
  revenueHistory: RevenueData[];
  categoryPerformance: CategoryPerformance[];
  revenueSources: RevenueSource[];
  salesPerformance: SalesPerformance[];
  targets: FinancialTarget[];
  // New field for client revenue data
  clientRevenueData?: {
    totalClientRevenue: number;
    averageClientValue: number;
    topClients: { name: string; value: number }[];
  };
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  comparison: 'previous_period' | 'previous_year' | 'none';
}