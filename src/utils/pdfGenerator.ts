import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '../types/quotation';
import { Client } from '../types/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from './currency';

export function generateQuotationPDF(quotation: Quotation) {
  const doc = new jsPDF();
  
  // Configurar fuente
  doc.setFont('helvetica');
  
  // Header con logo y título
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('VIP Turismo', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Rocha 2334, Montevideo, Uruguay', 20, 32);
  doc.text('Tel: 091 517 217 / 097 442 727 | Email: info@vipturismo.com', 20, 38);
  
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
  doc.text(`Fecha: ${format(new Date(quotation.created_at), 'dd MMM yyyy', { locale: es })}`, 20, 74);
  
  // Estado
  const statusLabel = getQuotationStatusLabel(quotation.status);
  const statusColor = getQuotationStatusColor(quotation.status);
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
  
  // Convert price to USD if available
  const priceDisplay = quotation.trip_price && quotation.trip_price_currency
    ? formatPrice(quotation.trip_price, quotation.trip_price_currency)
    : 'A definir';
  
  const tripData = [
    ['Destino:', quotation.destination || 'A definir'],
    ['Fecha de salida:', quotation.departure_date ? format(new Date(quotation.departure_date), 'dd MMM yyyy', { locale: es }) : 'Flexible'],
    ['Fecha de regreso:', quotation.return_date ? format(new Date(quotation.return_date), 'dd MMM yyyy', { locale: es }) : 'Flexible'],
    ['Fechas flexibles:', quotation.flexible_dates ? 'Sí' : 'No'],
    ['Adultos:', quotation.adults.toString()],
    ['Menores:', quotation.children.toString()],
    ['Precio estimado:', priceDisplay],
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
  doc.text(`Generado el ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: es })}`, 20, pageHeight - 15);
  
  // Descargar el PDF
  doc.save(`cotizacion-${quotation.name.replace(/\s+/g, '-').toLowerCase()}-${quotation.id.slice(0, 8)}.pdf`);
}

export function generateQuotationsSummaryPDF(quotations: Quotation[]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('VIP Turismo', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Reporte de Cotizaciones', 20, 32);
  doc.text(`Generado el ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: es })}`, 20, 38);
  
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
  
  const tableData = quotations.map(q => {
    // Format price with correct currency
    let priceDisplay = '-';
    if (q.trip_price) {
      priceDisplay = formatPrice(q.trip_price, q.trip_price_currency || 'UYU');
    }
    
    return [
      q.name,
      q.email,
      q.destination || 'A definir',
      `${q.adults}A${q.children > 0 ? ` + ${q.children}N` : ''}`,
      getQuotationStatusLabel(q.status),
      format(new Date(q.created_at), 'dd/MM/yy', { locale: es }),
      priceDisplay
    ];
  });
  
  autoTable(doc, {
    startY: tableY + 5,
    head: [['Cliente', 'Email', 'Destino', 'Pax', 'Estado', 'Fecha', 'Precio Est.']],
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
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
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

// ===== NUEVAS FUNCIONES PARA CLIENTES CRM =====

export function generateClientPDF(client: Client) {
  const doc = new jsPDF();
  
  // Configurar fuente
  doc.setFont('helvetica');
  
  // Header con logo y título
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('VIP Turismo', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Rocha 2334, Montevideo, Uruguay', 20, 32);
  doc.text('Tel: 091 517 217 / 097 442 727 | Email: info@vipturismo.com', 20, 38);
  
  // Línea separadora
  doc.setDrawColor(255, 107, 0); // Color primario
  doc.setLineWidth(2);
  doc.line(20, 45, 190, 45);
  
  // Título del documento
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE CLIENTE CRM', 20, 60);
  
  // Información del cliente
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Cliente #${client.id.slice(0, 8)}`, 20, 68);
  doc.text(`Fecha de registro: ${format(new Date(client.created_at), 'dd/MM/yyyy', { locale: es })}`, 20, 74);
  
  // Estado
  const statusLabel = getClientStatusLabel(client.status);
  const statusColor = getClientStatusColor(client.status);
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`Estado: ${statusLabel}`, 120, 68);
  
  // Convert trip value to USD
  let tripValueDisplay = 'No especificado';
  if (client.trip_value) {
    tripValueDisplay = formatPrice(client.trip_value, client.trip_value_currency as 'UYU' | 'USD' || 'UYU');
  }
  
  // Información personal
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('INFORMACIÓN PERSONAL', 20, 90);
  
  const personalData = [
    ['Nombre completo:', client.name],
    ['Email:', client.email],
    ['Teléfono:', client.phone || 'No especificado'],
    ['Prioridad:', client.priority ? getPriorityLabel(client.priority) : 'No definida'],
    ['Fuente:', client.source || 'No especificada'],
    ['Fecha de registro:', format(new Date(client.created_at), 'dd/MM/yyyy HH:mm', { locale: es })],
    ['Última actualización:', format(new Date(client.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })],
    ['Valor del viaje:', client.trip_value ? formatPrice(client.trip_value, client.trip_value_currency || 'UYU') : 'No especificado'],
  ];
  
  autoTable(doc, {
    startY: 95,
    body: personalData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 70 },
    },
  });
  
  // Información de seguimiento
  const followUpY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('INFORMACIÓN DE SEGUIMIENTO', 20, followUpY);
  
  const followUpData = [
    ['Estado actual:', statusLabel],
    ['Fecha agendada:', client.scheduled_date ? format(new Date(client.scheduled_date), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Sin agendar'],
    ['Último contacto:', client.last_contact_date ? format(new Date(client.last_contact_date), 'dd/MM/yyyy', { locale: es }) : 'Sin contacto'],
    ['Próximo seguimiento:', client.next_follow_up ? format(new Date(client.next_follow_up), 'dd/MM/yyyy', { locale: es }) : 'No programado'],
    ['Destino preferido:', client.preferred_destination || 'No especificado'],
    ['Rango de presupuesto:', client.budget_range || 'No especificado'],
  ];
  
  autoTable(doc, {
    startY: followUpY + 5,
    body: followUpData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 70 },
    },
  });
  
  // Tags
  if (client.tags && client.tags.length > 0) {
    const tagsY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('ETIQUETAS', 20, tagsY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(client.tags.join(', '), 20, tagsY + 8);
  }
  
  // Mensaje del cliente
  if (client.message) {
    const messageY = (client.tags && client.tags.length > 0) ? 
      (doc as any).lastAutoTable.finalY + 35 : 
      (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('MENSAJE DEL CLIENTE', 20, messageY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitText = doc.splitTextToSize(client.message, 170);
    doc.text(splitText, 20, messageY + 8);
  }
  
  // Notas internas
  if (client.internal_notes) {
    const notesY = client.message ? (doc as any).lastAutoTable.finalY + 55 : (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('NOTAS INTERNAS', 20, notesY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitText = doc.splitTextToSize(client.internal_notes, 170);
    doc.text(splitText, 20, notesY + 8);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Don Agustín Viajes - Documento confidencial del CRM', 20, pageHeight - 20);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, pageHeight - 15);
  
  // Descargar el PDF
  doc.save(`cliente-${client.name.replace(/\s+/g, '-').toLowerCase()}-${client.id.slice(0, 8)}.pdf`);
}

export function generateClientsSummaryPDF(clients: Client[]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('VIP Turismo', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Reporte Completo de Clientes CRM', 20, 32);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 38);
  
  // Línea separadora
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(2);
  doc.line(20, 45, 190, 45);
  
  // Estadísticas
  const totalValue = clients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
  // For aggregation in reports, convert to common currency (USD)
  const totalValueUSD = totalValue / 40;
  
  const stats = {
    total: clients.length,
    nuevo: clients.filter(c => c.status === 'nuevo').length,
    presupuesto_enviado: clients.filter(c => c.status === 'presupuesto_enviado').length,
    en_seguimiento: clients.filter(c => c.status === 'en_seguimiento').length,
    cliente_cerrado: clients.filter(c => c.status === 'cliente_cerrado').length,
    cliente_perdido: clients.filter(c => c.status === 'cliente_perdido').length,
    seguimientos_proximos: clients.filter(c => c.status === 'seguimientos_proximos').length,
    con_fecha_agendada: clients.filter(c => c.scheduled_date).length,
    alta_prioridad: clients.filter(c => c.priority === 'alta' || c.priority === 'urgente').length,
    total_valor: totalValueUSD,
  };
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('RESUMEN ESTADÍSTICO', 20, 60);
  
  const statsData = [
    ['Total de clientes:', stats.total.toString()],
    ['Nuevos:', stats.nuevo.toString()],
    ['Presupuesto enviado:', stats.presupuesto_enviado.toString()],
    ['En seguimiento:', stats.en_seguimiento.toString()],
    ['Seguimientos próximos:', stats.seguimientos_proximos.toString()],
    ['Clientes cerrados:', stats.cliente_cerrado.toString()],
    ['Clientes perdidos:', stats.cliente_perdido.toString()],
    ['Con fecha agendada:', stats.con_fecha_agendada.toString()],
    ['Alta prioridad:', stats.alta_prioridad.toString()],
    ['Valor total:', `USD ${stats.total_valor.toFixed(0)}`],
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
  
  // Tabla de clientes
  const tableY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('LISTADO DE CLIENTES', 20, tableY);
  
  const tableData = clients.map(c => {
    // Format trip value with correct currency
    let valueDisplay = '-';
    if (c.trip_value) {
      valueDisplay = formatPrice(c.trip_value, c.trip_value_currency || 'UYU');
    }
    
    return [
      c.name,
      c.email,
      c.phone || '-',
      getClientStatusLabel(c.status),
      c.priority ? getPriorityLabel(c.priority) : '-',
      valueDisplay,
      c.scheduled_date ? format(new Date(c.scheduled_date), 'dd/MM/yy HH:mm', { locale: es }) : 'Sin agendar',
      format(new Date(c.created_at), 'dd/MM/yy', { locale: es }),
    ];
  });
  
  autoTable(doc, {
    startY: tableY + 5,
    head: [['Cliente', 'Email', 'Teléfono', 'Estado', 'Prioridad', 'Valor', 'Fecha Agendada', 'Registro']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [255, 107, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 25, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
    },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Don Agustín Viajes - Reporte confidencial del CRM', 20, pageHeight - 15);
  
  // Descargar el PDF
  doc.save(`reporte-clientes-completo-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateClientsByStatusPDF(clients: Client[], status: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('VIP Turismo', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Reporte de Clientes - ${getClientStatusLabel(status)}`, 20, 32);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 38);
  
  // Línea separadora
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(2);
  doc.line(20, 45, 190, 45);
  
  // Información del filtro
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`CLIENTES CON ESTADO: ${getClientStatusLabel(status).toUpperCase()}`, 20, 60);
  doc.setFontSize(10);
  doc.text(`Total de clientes: ${clients.length}`, 20, 68);
  
  // Calcular valor total en USD
  const totalValue = clients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
  // For aggregation in reports, convert to common currency (USD)
  const totalValueUSD = totalValue / 40;
  doc.text(`Valor total: USD ${totalValueUSD.toFixed(0)}`, 20, 74);
  
  // Tabla de clientes
  const tableData = clients.map(c => {
    // Format trip value with correct currency
    let valueDisplay = '-';
    if (c.trip_value) {
      valueDisplay = formatPrice(c.trip_value, c.trip_value_currency || 'UYU');
    }
    
    return [
      c.name,
      c.email,
      c.phone || '-',
      c.priority ? getPriorityLabel(c.priority) : '-',
      valueDisplay,
      c.scheduled_date ? format(new Date(c.scheduled_date), 'dd/MM/yy HH:mm', { locale: es }) : 'Sin agendar',
      format(new Date(c.created_at), 'dd/MM/yy', { locale: es }),
    ];
  });
  
  autoTable(doc, {
    startY: 80,
    head: [['Cliente', 'Email', 'Teléfono', 'Prioridad', 'Valor', 'Fecha Agendada', 'Registro']],
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
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 30, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
    },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Don Agustín Viajes - Reporte confidencial del CRM', 20, pageHeight - 15);
  
  // Descargar el PDF
  const statusSlug = status.replace('_', '-');
  doc.save(`clientes-${statusSlug}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateClientsBySourcePDF(clients: Client[], source: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('VIP Turismo', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Reporte de Clientes - Fuente: ${source}`, 20, 32);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 38);
  
  // Línea separadora
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(2);
  doc.line(20, 45, 190, 45);
  
  // Información del filtro
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`CLIENTES POR FUENTE: ${source.toUpperCase()}`, 20, 60);
  doc.setFontSize(10);
  doc.text(`Total de clientes: ${clients.length}`, 20, 68);
  
  // Calcular valor total en USD
  const totalValue = clients.reduce((sum, client) => sum + (client.trip_value || 0), 0);
  // For aggregation in reports, convert to common currency (USD)
  const totalValueUSD = totalValue / 40;
  doc.text(`Valor total: USD ${totalValueUSD.toFixed(0)}`, 20, 74);
  
  // Tabla de clientes
  const tableData = clients.map(c => {
    // Format trip value with correct currency
    let valueDisplay = '-';
    if (c.trip_value) {
      valueDisplay = formatPrice(c.trip_value, c.trip_value_currency || 'UYU');
    }
    
    return [
      c.name,
      c.email,
      c.phone || '-',
      getClientStatusLabel(c.status),
      c.priority ? getPriorityLabel(c.priority) : '-',
      valueDisplay,
      format(new Date(c.created_at), 'dd/MM/yy', { locale: es }),
    ];
  });
  
  autoTable(doc, {
    startY: 80,
    head: [['Cliente', 'Email', 'Teléfono', 'Estado', 'Prioridad', 'Valor', 'Registro']],
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
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
    },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Don Agustín Viajes - Reporte confidencial del CRM', 20, pageHeight - 15);
  
  // Descargar el PDF
  const sourceSlug = source.replace('_', '-');
  doc.save(`clientes-fuente-${sourceSlug}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ===== FUNCIONES AUXILIARES =====

function getQuotationStatusLabel(status: Quotation['status']): string {
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

function getQuotationStatusColor(status: Quotation['status']): { r: number; g: number; b: number } {
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

function getClientStatusLabel(status: Client['status']): string {
  switch (status) {
    case 'nuevo':
      return 'Nuevo';
    case 'presupuesto_enviado':
      return 'Presupuesto Enviado';
    case 'en_seguimiento':
      return 'En Seguimiento';
    case 'cliente_cerrado':
      return 'Cliente Cerrado';
    case 'en_proceso':
      return 'En Proceso';
    case 'cliente_perdido':
      return 'Cliente Perdido';
    case 'seguimientos_proximos':
      return 'Seguimientos Próximos';
    default:
      return status;
  }
}

function getClientStatusColor(status: Client['status']): { r: number; g: number; b: number } {
  switch (status) {
    case 'nuevo':
      return { r: 59, g: 130, b: 246 }; // Blue
    case 'presupuesto_enviado':
      return { r: 147, g: 51, b: 234 }; // Purple
    case 'en_seguimiento':
      return { r: 251, g: 191, b: 36 }; // Yellow
    case 'cliente_cerrado':
      return { r: 34, g: 197, b: 94 }; // Green
    case 'en_proceso':
      return { r: 249, g: 115, b: 22 }; // Orange
    case 'cliente_perdido':
      return { r: 239, g: 68, b: 68 }; // Red
    case 'seguimientos_proximos':
      return { r: 79, g: 70, b: 229 }; // Indigo
    default:
      return { r: 107, g: 114, b: 128 }; // Gray
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'urgente':
      return 'Urgente';
    case 'alta':
      return 'Alta';
    case 'media':
      return 'Media';
    case 'baja':
      return 'Baja';
    default:
      return priority;
  }
}