import { supabase } from './client';
import { toast } from 'react-hot-toast';

// Define bucket name for PDFs
const PDF_BUCKET = 'trip-pdfs';

/**
 * Sanitizes a filename by removing special characters and normalizing it
 * @param filename The original filename
 * @returns A sanitized filename safe for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    // Normalize unicode characters (converts ñ to n, á to a, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove any characters that aren't alphanumeric, periods, hyphens, or underscores
    .replace(/[^a-zA-Z0-9._-]/g, '')
    // Remove multiple consecutive underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
    // Ensure it's not empty
    || 'document';
}

/**
 * Uploads a PDF file to Supabase Storage
 * @param file The PDF file to upload
 * @param tripId The ID of the trip (used for folder organization)
 * @returns Object containing the file URL and name if successful, null if failed
 */
export async function uploadPDF(file: File, tripId: string): Promise<{ url: string; name: string } | null> {
  try {
    console.log('Starting PDF upload process...');
    console.log('File:', file.name, file.type, file.size);
    console.log('Trip ID:', tripId);
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10MB permitido');
      return null;
    }

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PDF_BUCKET);
    
    if (!bucketExists) {
      console.error(`Bucket "${PDF_BUCKET}" does not exist`);
      toast.error('Error de configuración del almacenamiento. Contacte al administrador.');
      return null;
    }
    
    console.log(`Bucket "${PDF_BUCKET}" exists, proceeding with upload`);

    // Create a unique file name to avoid collisions
    const timestamp = new Date().getTime();
    const sanitizedFileName = sanitizeFilename(file.name);
    const fileName = `${tripId}/${timestamp}-${sanitizedFileName}`;
    
    console.log('Uploading file with path:', fileName);

    // Upload the file
    const { data, error } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Error al subir el PDF. Por favor intenta nuevamente.');
      return null;
    }
    
    console.log('Upload successful, data:', data);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(PDF_BUCKET)
      .getPublicUrl(data.path);
    
    console.log('Public URL:', publicUrlData.publicUrl);

    return {
      url: publicUrlData.publicUrl,
      name: file.name // Return original filename
    };
  } catch (error) {
    console.error('Error in PDF upload:', error);
    toast.error('Error inesperado al subir el PDF');
    return null;
  }
}

/**
 * Deletes a PDF file from Supabase Storage
 * @param url The public URL of the file to delete
 * @returns boolean indicating success or failure
 */
export async function deletePDF(url: string): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === PDF_BUCKET);
    
    if (bucketIndex === -1) {
      console.error('Invalid PDF URL format');
      return false;
    }
    
    // The path is everything after the bucket name
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    // Delete the file
    const { error } = await supabase.storage
      .from(PDF_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting PDF:', error);
      toast.error('Error al eliminar el PDF');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in PDF deletion:', error);
    toast.error('Error inesperado al eliminar el PDF');
    return false;
  }
}

/**
 * Checks if Supabase Storage is properly configured
 * @returns boolean indicating if storage is available
 */
export async function checkStorageAvailability(): Promise<boolean> {
  try {
    // Try to list buckets to check if storage is available
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Storage not available:', error);
      return false;
    }
    
    // Check if our PDF bucket exists
    const pdfBucketExists = data.some(bucket => bucket.name === PDF_BUCKET);
    
    if (!pdfBucketExists) {
      console.warn(`Bucket "${PDF_BUCKET}" does not exist. You may need to create it in the Supabase dashboard.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking storage availability:', error);
    return false;
  }
}