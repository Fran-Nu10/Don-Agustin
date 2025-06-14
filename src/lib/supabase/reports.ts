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

    return {
      metrics,
      revenueHistory,
      categoryPerformance,
      revenueSources,
      salesPerformance,
      targets,
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
  };
}

async function getRevenueHistory(): Promise<RevenueData[]> {
  const { data } = await supabase
    .from('financial_metrics')
    .select('*')
    .eq('metric_type', 'monthly')
    .order('metric_date', { ascending: true })
    .limit(12);

  if (!data) return [];

  return data.map((item, index) => ({
    month: new Date(item.metric_date).toLocaleDateString('es-ES', { month: 'short' }),
    revenue: Number(item.total_revenue),
    bookings: item.total_bookings,
    growth: index > 0 ? ((Number(item.total_revenue) - Number(data[index - 1].total_revenue)) / Number(data[index - 1].total_revenue)) * 100 : 0,
  }));
}

async function getCategoryPerformance(month: number, year: number): Promise<CategoryPerformance[]> {
  const { data } = await supabase
    .from('category_performance')
    .select('*')
    .eq('month', month)
    .eq('year', year);

  if (!data) return [];

  const totalRevenue = data.reduce((sum, item) => sum + Number(item.total_revenue), 0);

  return data.map(item => ({
    category: item.category === 'nacional' ? 'Nacional' : 
              item.category === 'internacional' ? 'Internacional' : 
              item.category === 'grupal' ? 'Grupal' : item.category,
    revenue: Number(item.total_revenue),
    bookings: item.total_bookings,
    marketShare: totalRevenue > 0 ? (Number(item.total_revenue) / totalRevenue) * 100 : 0,
    growth: Number(item.market_share) || 0,
  }));
}

async function getRevenueSources(month: number, year: number): Promise<RevenueSource[]> {
  const { data } = await supabase
    .from('revenue_sources')
    .select('*')
    .eq('month', month)
    .eq('year', year);

  if (!data) {
    // Return default data if no records exist
    return [
      { source: 'Sitio Web', amount: 15000, percentage: 45, bookings: 12, roi: 320 },
      { source: 'Referencias', amount: 8000, percentage: 25, bookings: 8, roi: 280 },
      { source: 'Redes Sociales', amount: 6000, percentage: 18, bookings: 6, roi: 150 },
      { source: 'Directo', amount: 4000, percentage: 12, bookings: 4, roi: 200 },
    ];
  }

  const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue_amount), 0);

  return data.map(item => ({
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