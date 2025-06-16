import { supabase } from './client';
import { ReportsData, RevenueMetrics, RevenueData, CategoryPerformance, RevenueSource, SalesPerformance, FinancialTarget, ReportFilters } from '../../types/reports';

export async function getReportsData(filters?: ReportFilters): Promise<ReportsData> {
  try {
    // Get current date range
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Get revenue metrics
    const metrics = await getRevenueMetrics(currentMonth, currentYear, previousMonth, previousYear);
    
    // Get revenue history (last 12 months)
    const revenueHistory = await getRevenueHistory();
    
    // Get category performance
    const categoryPerformance = await getCategoryPerformance(currentMonth, currentYear);
    
    // Get revenue sources
    const revenueSources = await getRevenueSources(currentMonth, currentYear);
    
    // Get sales performance
    const salesPerformance = await getSalesPerformance();
    
    // Get targets
    const targets = await getFinancialTargets();

    // Get client revenue data
    const clientRevenueData = await getClientRevenueData();

    return {
      metrics,
      revenueHistory,
      categoryPerformance,
      revenueSources,
      salesPerformance,
      targets,
      clientRevenueData,
    };
  } catch (error) {
    console.error('Error fetching reports data:', error);
    throw error;
  }
}

async function getRevenueMetrics(currentMonth: number, currentYear: number, previousMonth: number, previousYear: number): Promise<RevenueMetrics> {
  // Get current month revenue
  const { data: currentRevenue } = await supabase
    .from('bookings_revenue')
    .select('amount, booking_id')
    .eq('revenue_month', currentMonth)
    .eq('revenue_year', currentYear)
    .eq('payment_status', 'paid');

  // Get previous month revenue for growth calculation
  const { data: previousRevenue } = await supabase
    .from('bookings_revenue')
    .select('amount')
    .eq('revenue_month', previousMonth)
    .eq('revenue_year', previousYear)
    .eq('payment_status', 'paid');

  // Get total bookings
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

  // Get leads generated this month
  const { count: leadsGenerated } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

  // Get client revenue data
  const { data: clientsData } = await supabase
    .from('clients')
    .select('trip_value')
    .not('trip_value', 'is', null)
    .gt('trip_value', 0);

  // Calculate client revenue
  const clientRevenue = clientsData?.reduce((sum, client) => sum + (client.trip_value || 0), 0) || 0;

  // Calculate metrics
  const totalRevenue = currentRevenue?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const monthlyRevenue = totalRevenue;
  const previousTotal = previousRevenue?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const revenueGrowth = previousTotal > 0 ? ((totalRevenue - previousTotal) / previousTotal) * 100 : 0;
  const averageBookingValue = totalBookings && totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const conversionRate = leadsGenerated && leadsGenerated > 0 ? (totalBookings || 0) / leadsGenerated * 100 : 0;

  return {
    totalRevenue,
    monthlyRevenue,
    revenueGrowth,
    averageBookingValue,
    totalBookings: totalBookings || 0,
    conversionRate,
    leadsGenerated: leadsGenerated || 0,
    salesActivities: (totalBookings || 0) + (leadsGenerated || 0),
    clientRevenue,
  };
}

async function getRevenueHistory(): Promise<RevenueData[]> {
  // Try to get data from financial_metrics table first
  const { data: metricsData } = await supabase
    .from('financial_metrics')
    .select('*')
    .eq('metric_type', 'monthly')
    .order('metric_date', { ascending: true })
    .limit(12);

  if (metricsData && metricsData.length > 0) {
    return metricsData.map((item, index) => ({
      month: new Date(item.metric_date).toLocaleDateString('es-ES', { month: 'short' }),
      revenue: Number(item.total_revenue),
      bookings: item.total_bookings,
      growth: index > 0 ? ((Number(item.total_revenue) - Number(metricsData[index - 1].total_revenue)) / Number(metricsData[index - 1].total_revenue)) * 100 : 0,
    }));
  }

  // If no metrics data, generate from bookings_revenue
  const { data: revenueData } = await supabase
    .from('bookings_revenue')
    .select('amount, revenue_month, revenue_year, created_at')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true });

  if (!revenueData || revenueData.length === 0) {
    // Return demo data if no real data exists
    return generateDemoRevenueHistory();
  }

  // Group by month and calculate totals
  const monthlyData: { [key: string]: { revenue: number; bookings: number } } = {};
  
  revenueData.forEach(item => {
    const key = `${item.revenue_year}-${item.revenue_month.toString().padStart(2, '0')}`;
    if (!monthlyData[key]) {
      monthlyData[key] = { revenue: 0, bookings: 0 };
    }
    monthlyData[key].revenue += Number(item.amount);
    monthlyData[key].bookings += 1;
  });

  // Convert to array and sort
  const sortedData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Last 12 months
    .map(([key, data], index, array) => {
      const [year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'short' });
      const growth = index > 0 ? ((data.revenue - array[index - 1][1].revenue) / array[index - 1][1].revenue) * 100 : 0;
      
      return {
        month: monthName,
        revenue: data.revenue,
        bookings: data.bookings,
        growth,
      };
    });

  return sortedData;
}

async function getCategoryPerformance(month: number, year: number): Promise<CategoryPerformance[]> {
  // Try to get from category_performance table first
  const { data: categoryData } = await supabase
    .from('category_performance')
    .select('*')
    .eq('month', month)
    .eq('year', year);

  if (categoryData && categoryData.length > 0) {
    const totalRevenue = categoryData.reduce((sum, item) => sum + Number(item.total_revenue), 0);

    return categoryData.map(item => ({
      category: item.category === 'nacional' ? 'Nacional' : 
                item.category === 'internacional' ? 'Internacional' : 
                item.category === 'grupal' ? 'Grupal' : item.category,
      revenue: Number(item.total_revenue),
      bookings: item.total_bookings,
      marketShare: totalRevenue > 0 ? (Number(item.total_revenue) / totalRevenue) * 100 : 0,
      growth: Number(item.market_share) || 0,
    }));
  }

  // Generate from actual bookings and trips data
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      trip:trips!inner(
        id,
        category,
        price
      )
    `)
    .gte('created_at', `${year}-${month.toString().padStart(2, '0')}-01`)
    .lt('created_at', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);

  if (!bookingsData || bookingsData.length === 0) {
    return generateDemoCategoryPerformance();
  }

  // Group by category
  const categoryStats: { [key: string]: { revenue: number; bookings: number } } = {};
  
  bookingsData.forEach(booking => {
    if (booking.trip) {
      const category = booking.trip.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { revenue: 0, bookings: 0 };
      }
      categoryStats[category].revenue += Number(booking.trip.price);
      categoryStats[category].bookings += 1;
    }
  });

  const totalRevenue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.revenue, 0);

  return Object.entries(categoryStats).map(([category, stats]) => ({
    category: category === 'nacional' ? 'Nacional' : 
              category === 'internacional' ? 'Internacional' : 
              category === 'grupal' ? 'Grupal' : category,
    revenue: stats.revenue,
    bookings: stats.bookings,
    marketShare: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
    growth: Math.random() * 20 - 10, // Random growth for demo
  }));
}

async function getRevenueSources(month: number, year: number): Promise<RevenueSource[]> {
  // Try to get from revenue_sources table first
  const { data: sourcesData } = await supabase
    .from('revenue_sources')
    .select('*')
    .eq('month', month)
    .eq('year', year);

  if (sourcesData && sourcesData.length > 0) {
    const totalRevenue = sourcesData.reduce((sum, item) => sum + Number(item.revenue_amount), 0);

    return sourcesData.map(item => ({
      source: item.source_type === 'website' ? 'Sitio Web' :
              item.source_type === 'referral' ? 'Referencias' :
              item.source_type === 'social_media' ? 'Redes Sociales' :
              item.source_type === 'direct' ? 'Directo' : item.source_type,
      amount: Number(item.revenue_amount),
      percentage: totalRevenue > 0 ? (Number(item.revenue_amount) / totalRevenue) * 100 : 0,
      bookings: item.booking_count,
      roi: Number(item.roi) || 0,
    }));
  }

  // Return demo data if no real data exists
  return [
    { source: 'Sitio Web', amount: 15000, percentage: 45, bookings: 12, roi: 320 },
    { source: 'Referencias', amount: 8000, percentage: 25, bookings: 8, roi: 280 },
    { source: 'Redes Sociales', amount: 6000, percentage: 18, bookings: 6, roi: 150 },
    { source: 'Directo', amount: 4000, percentage: 12, bookings: 4, roi: 200 },
  ];
}

async function getSalesPerformance(): Promise<SalesPerformance[]> {
  // Get user performance data
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('role', ['owner', 'employee']);

  if (!users) return [];

  // For demo purposes, generate performance data
  // In a real implementation, you would track actual sales activities
  return users.map((user, index) => {
    const baseLeads = 150 + (index * 30);
    const baseOpportunities = Math.floor(baseLeads * 0.3);
    const baseRevenue = baseOpportunities * (2000 + (index * 500));
    
    return {
      name: user.email.split('@')[0],
      leads: baseLeads,
      opportunities: baseOpportunities,
      revenue: baseRevenue,
      conversionRate: (baseOpportunities / baseLeads) * 100,
      averageDealSize: baseRevenue / baseOpportunities,
    };
  });
}

async function getFinancialTargets(): Promise<FinancialTarget[]> {
  const { data } = await supabase
    .from('revenue_targets')
    .select('*')
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map(item => ({
    id: item.id,
    targetType: item.target_type as 'monthly' | 'quarterly' | 'yearly',
    targetPeriod: item.target_period,
    revenueTarget: Number(item.revenue_target),
    bookingsTarget: item.bookings_target,
    leadsTarget: item.leads_target,
    conversionTarget: Number(item.conversion_target),
    actualRevenue: Number(item.actual_revenue),
    actualBookings: item.actual_bookings,
    actualLeads: item.actual_leads,
    actualConversion: Number(item.actual_conversion),
    achievementRate: Number(item.achievement_rate),
  }));
}

// Get client revenue data
async function getClientRevenueData() {
  const { data: clients } = await supabase
    .from('clients')
    .select('name, trip_value')
    .not('trip_value', 'is', null)
    .gt('trip_value', 0)
    .order('trip_value', { ascending: false });

  if (!clients || clients.length === 0) {
    return {
      totalClientRevenue: 0,
      averageClientValue: 0,
      topClients: []
    };
  }

  const totalClientRevenue = clients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
  const averageClientValue = totalClientRevenue / clients.length;
  const topClients = clients.slice(0, 5).map(client => ({
    name: client.name,
    value: client.trip_value || 0
  }));

  return {
    totalClientRevenue,
    averageClientValue,
    topClients
  };
}

// Demo data generators
function generateDemoRevenueHistory(): RevenueData[] {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentMonth = new Date().getMonth();
  
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (currentMonth - 11 + i + 12) % 12;
    const baseRevenue = 25000 + Math.random() * 15000;
    const baseBookings = Math.floor(baseRevenue / 2000);
    
    return {
      month: months[monthIndex],
      revenue: Math.floor(baseRevenue),
      bookings: baseBookings,
      growth: (Math.random() - 0.5) * 30, // Random growth between -15% and +15%
    };
  });
}

function generateDemoCategoryPerformance(): CategoryPerformance[] {
  return [
    {
      category: 'Nacional',
      revenue: 18000,
      bookings: 12,
      marketShare: 45,
      growth: 8.5,
    },
    {
      category: 'Internacional',
      revenue: 15000,
      bookings: 8,
      marketShare: 37.5,
      growth: 12.3,
    },
    {
      category: 'Grupal',
      revenue: 7000,
      bookings: 4,
      marketShare: 17.5,
      growth: -2.1,
    },
  ];
}

export async function updateRevenueTarget(id: string, data: Partial<FinancialTarget>): Promise<void> {
  const { error } = await supabase
    .from('revenue_targets')
    .update({
      revenue_target: data.revenueTarget,
      bookings_target: data.bookingsTarget,
      leads_target: data.leadsTarget,
      conversion_target: data.conversionTarget,
      actual_revenue: data.actualRevenue,
      actual_bookings: data.actualBookings,
      actual_leads: data.actualLeads,
      actual_conversion: data.actualConversion,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function createRevenueTarget(data: Omit<FinancialTarget, 'id' | 'achievementRate'>): Promise<void> {
  const { error } = await supabase
    .from('revenue_targets')
    .insert({
      target_type: data.targetType,
      target_period: data.targetPeriod,
      revenue_target: data.revenueTarget,
      bookings_target: data.bookingsTarget,
      leads_target: data.leadsTarget,
      conversion_target: data.conversionTarget,
      actual_revenue: data.actualRevenue,
      actual_bookings: data.actualBookings,
      actual_leads: data.actualLeads,
      actual_conversion: data.actualConversion,
    });

  if (error) throw error;
}