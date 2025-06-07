import { supabase } from './client';
import { Quotation, QuotationFormData } from '../../types/quotation';

export async function getQuotations(): Promise<Quotation[]> {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getQuotation(id: string): Promise<Quotation | null> {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createQuotation(quotationData: QuotationFormData): Promise<Quotation> {
  // Remove manual timestamp setting - let the database handle defaults and triggers
  const { data, error } = await supabase
    .from('quotations')
    .insert([quotationData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuotation(id: string, quotationData: Partial<QuotationFormData>): Promise<Quotation> {
  // Remove manual updated_at setting - let the database trigger handle it
  const { data, error } = await supabase
    .from('quotations')
    .update(quotationData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuotation(id: string): Promise<void> {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}