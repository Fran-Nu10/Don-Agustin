import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '../types/quotation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateQuotationPDF(quotation: Quotation) {
  const doc = new jsPDF();
  
  // Configurar fuente
  doc.setFont('helvetica');
  
  // Header con logo y título
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Don Agustín Viajes', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('18 de Julio 1236, Montevideo, Uruguay', 20, 32);
  doc.text('Tel: +598 2345 6789 | Email: info@donagustinviajes.com.uy', 20, 38);
  
  // Línea separadora
  doc.setDrawColor(255, 107, 0); // Color primario
  doc.setLineWidth(2);
  doc.line(20, 45, 190, 45);
  
  // Título del documento
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('COTIZACIÓN DE VIAJE', 20, 60);
  
  // Información de la cotización
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Cotización #${quotation.id.slice(0, 8)}`, 20, 68);
  doc.text(`Fecha: ${format(new Date(quotation.created_at), 'dd/MM/yyyy', { locale: es })}`, 20, 74);
  
  // Estado
  const statusLabel = getStatusLabel(quotation.status);
  const statusColor = getStatusColor(quotation.status);
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`Estado: ${statusLabel}`, 120, 68);
  
  // Información del cliente
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('INFORMACIÓN DEL CLIENTE', 20, 90);
  
  const clientData = [
    ['Nombre:', quotation.name],
    ['Email:', quotation.email],
    ['Teléfono:', quotation.phone || 'No especificado'],
    ['Departamento:', quotation.department || 'No especificado'],
  ];
  
  autoTable(doc, {
    startY: 95,
    body: clientData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 80 },
    },
  });
  
  // Información del viaje
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('INFORMACIÓN DEL VIAJE', 20, finalY);
  
  const tripData = [
    ['Destino:', quotation.destination || 'A definir'],
    ['Fecha de salida:', quotation.departure_date ? format(new Date(quotation.departure_date), 'dd/MM/yyyy', { locale: es }) : 'Flexible'],
    ['Fecha de regreso:', quotation.return_date ? format(new Date(quotation.return_date), 'dd/MM/yyyy', { locale: es }) : 'Flexible'],
    ['Fechas flexibles:', quotation.flexible_dates ? 'Sí' : 'No'],
    ['Adultos:', quotation.adults.toString()],
    ['Menores:', quotation.children.toString()],
  ];
  
  autoTable(doc, {
    startY: finalY + 5,
    body: tripData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 80 },
    },
  });
  
  // Observaciones
  if (quotation.observations) {
    const observationsY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('OBSERVACIONES', 20, observationsY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitText = doc.splitTextToSize(quotation.observations, 170);
    doc.text(splitText, 20, observationsY + 8);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Don Agustín Viajes - Tu agencia de confianza desde 1997', 20, pageHeight - 20);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, pageHeight - 15);
  
  // Descargar el PDF
  doc.save(`cotizacion-${quotation.name.replace(/\s+/g, '-').toLowerCase()}-${quotation.id.slice(0, 8)}.pdf`);
}

export function generateQuotationsSummaryPDF(quotations: Quotation[]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Don Agustín Viajes', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Reporte de Cotizaciones', 20, 32);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 38);
  
  // Línea separadora
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(2);
  doc.line(20, 45, 190, 45);
  
  // Estadísticas
  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending').length,
    processing: quotations.filter(q => q.status === 'processing').length,
    quoted: quotations.filter(q => q.status === 'quoted').length,
    closed: quotations.filter(q => q.status === 'closed').length,
  };
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('RESUMEN ESTADÍSTICO', 20, 60);
  
  const statsData = [
    ['Total de cotizaciones:', stats.total.toString()],
    ['Pendientes:', stats.pending.toString()],
    ['En proceso:', stats.processing.toString()],
    ['Cotizadas:', stats.quoted.toString()],
    ['Cerradas:', stats.closed.toString()],
  ];
  
  autoTable(doc, {
    startY: 65,
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: [255, 107, 0] },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 30, halign: 'center' },
    },
  });
  
  // Tabla de cotizaciones
  const tableY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('LISTADO DE COTIZACIONES', 20, tableY);
  
  const tableData = quotations.map(q => [
    q.name,
    q.email,
    q.destination || 'A definir',
    `${q.adults}A${q.children > 0 ? ` + ${q.children}N` : ''}`,
    getStatusLabel(q.status),
    format(new Date(q.created_at), 'dd/MM/yy', { locale: es }),
  ]);
  
  autoTable(doc, {
    startY: tableY + 5,
    head: [['Cliente', 'Email', 'Destino', 'Pax', 'Estado', 'Fecha']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [255, 107, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
    },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Don Agustín Viajes - Reporte confidencial', 20, pageHeight - 15);
  
  // Descargar el PDF
  doc.save(`reporte-cotizaciones-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

function getStatusLabel(status: Quotation['status']): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'processing':
      return 'Procesando';
    case 'quoted':
      return 'Cotizado';
    case 'closed':
      return 'Cerrado';
    default:
      return status;
  }
}

function getStatusColor(status: Quotation['status']): { r: number; g: number; b: number } {
  switch (status) {
    case 'pending':
      return { r: 251, g: 191, b: 36 }; // Yellow
    case 'processing':
      return { r: 59, g: 130, b: 246 }; // Blue
    case 'quoted':
      return { r: 34, g: 197, b: 94 }; // Green
    case 'closed':
      return { r: 107, g: 114, b: 128 }; // Gray
    default:
      return { r: 107, g: 114, b: 128 };
  }
}