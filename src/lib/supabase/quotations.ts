import { supabase } from './client';
import { Quotation, QuotationFormData } from '../../types/quotation';
import { sanitizeFormData } from '../../utils/dataSanitizer';

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
  console.log('🧹 [CREATE QUOTATION] Aplicando sanitización de datos...');
  const sanitizedData = sanitizeFormData(quotationData);
  console.log('✅ [CREATE QUOTATION] Datos sanitizados aplicados');
  
  // Remove manual timestamp setting - let the database handle defaults and triggers
  const { data, error } = await supabase
    .from('quotations')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuotation(id: string, quotationData: Partial<QuotationFormData>): Promise<Quotation> {
  console.log('🧹 [UPDATE QUOTATION] Aplicando sanitización de datos...');
  const sanitizedData = sanitizeFormData(quotationData);
  console.log('✅ [UPDATE QUOTATION] Datos sanitizados aplicados');
  
  // Remove manual updated_at setting - let the database trigger handle it
  const { data, error } = await supabase
    .from('quotations')
    .update(sanitizedData)
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