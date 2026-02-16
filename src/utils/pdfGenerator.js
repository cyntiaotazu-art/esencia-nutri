import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarPDFVentas = (ventas, periodo = 'Todo') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(90, 124, 67);
  doc.text('ESENCIA NUTRI', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Ventas', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${periodo}`, 105, 38, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 105, 44, { align: 'center' });
  
  // Table
  const tableData = ventas.map(v => [
    new Date(v.fecha).toLocaleDateString('es-AR'),
    v.cliente || 'Sin nombre',
    v.recetaNombre,
    v.cantidad,
    `$${v.precioVenta.toFixed(2)}`,
    `$${v.ganancia.toFixed(2)}`,
    `${v.margenGanancia.toFixed(1)}%`
  ]);
  
  doc.autoTable({
    head: [['Fecha', 'Cliente', 'Producto', 'Cant.', 'Venta', 'Ganancia', 'Margen']],
    body: tableData,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [90, 124, 67] },
    styles: { fontSize: 9 },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });
  
  // Totals
  const totalVentas = ventas.reduce((sum, v) => sum + v.precioVenta, 0);
  const totalGanancias = ventas.reduce((sum, v) => sum + v.ganancia, 0);
  const margenPromedio = totalVentas > 0 ? (totalGanancias / totalVentas * 100) : 0;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Ventas: $${totalVentas.toFixed(2)}`, 14, finalY);
  doc.text(`Total Ganancias: $${totalGanancias.toFixed(2)}`, 14, finalY + 7);
  doc.text(`Margen Promedio: ${margenPromedio.toFixed(1)}%`, 14, finalY + 14);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Esencia Nutri - Sistema de Gestión PRO', 105, 285, { align: 'center' });
  
  // Save
  doc.save(`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generarPDFInventario = (insumos, packaging) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(90, 124, 67);
  doc.text('ESENCIA NUTRI', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Inventario Actual', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 105, 38, { align: 'center' });
  
  // Insumos
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('INSUMOS', 14, 50);
  
  const insumosData = insumos.map(i => [
    i.nombre,
    `${i.stock} ${i.unidadStock}`,
    `$${i.precio.toFixed(2)}`,
    i.stock < 10 ? 'BAJO' : 'OK'
  ]);
  
  doc.autoTable({
    head: [['Nombre', 'Stock', 'Precio', 'Estado']],
    body: insumosData,
    startY: 55,
    theme: 'striped',
    headStyles: { fillColor: [90, 124, 67] },
    styles: { fontSize: 9 }
  });
  
  // Packaging
  const packagingY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text('PACKAGING', 14, packagingY);
  
  const packagingData = packaging.map(p => [
    p.nombre,
    `${p.stock} ${p.unidadStock}`,
    `$${p.precio.toFixed(2)}`,
    p.stock < 10 ? 'BAJO' : 'OK'
  ]);
  
  doc.autoTable({
    head: [['Nombre', 'Stock', 'Precio', 'Estado']],
    body: packagingData,
    startY: packagingY + 5,
    theme: 'striped',
    headStyles: { fillColor: [90, 124, 67] },
    styles: { fontSize: 9 }
  });
  
  // Alerts
  const alertasInsumos = insumos.filter(i => i.stock < 10).length;
  const alertasPackaging = packaging.filter(p => p.stock < 10).length;
  
  if (alertasInsumos > 0 || alertasPackaging > 0) {
    const alertY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setTextColor(229, 115, 115);
    doc.text(`⚠️ ALERTAS:`, 14, alertY);
    doc.setTextColor(0, 0, 0);
    if (alertasInsumos > 0) {
      doc.text(`${alertasInsumos} insumo(s) con stock bajo`, 14, alertY + 7);
    }
    if (alertasPackaging > 0) {
      doc.text(`${alertasPackaging} packaging(s) con stock bajo`, 14, alertY + 14);
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Esencia Nutri - Sistema de Gestión PRO', 105, 285, { align: 'center' });
  
  doc.save(`inventario-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generarPDFProductos = (recetas) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(90, 124, 67);
  doc.text('ESENCIA NUTRI', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Lista de Productos y Precios', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Actualizado: ${new Date().toLocaleDateString('es-AR')}`, 105, 38, { align: 'center' });
  
  // Table - solo mostramos nombre y costo
  const productosData = recetas.map(r => {
    const calcularCostoReceta = (receta) => {
      let costoTotal = 0;
      receta.ingredientes.forEach(ing => {
        if (ing.tipo === 'insumo') {
          costoTotal += ing.cantidad * ing.precioUnitario;
        }
      });
      return costoTotal;
    };
    
    const costo = calcularCostoReceta(r);
    return [
      r.nombre,
      `$${costo.toFixed(2)}`,
      r.ingredientes.length + ' ingredientes'
    ];
  });
  
  doc.autoTable({
    head: [['Producto', 'Costo Base', 'Composición']],
    body: productosData,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [90, 124, 67] },
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: 'right' }
    }
  });
  
  // Note
  const noteY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('* Los precios mostrados son costos base sin margen de ganancia', 14, noteY);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Esencia Nutri - Sistema de Gestión PRO', 105, 285, { align: 'center' });
  
  doc.save(`productos-${new Date().toISOString().split('T')[0]}.pdf`);
};
