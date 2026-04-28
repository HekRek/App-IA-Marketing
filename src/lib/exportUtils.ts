import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToCSV = (filename: string, rows: any[]) => {
  if (!rows.length) return;
  
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        let val = row[header] === null || row[header] === undefined ? "" : row[header];
        if (typeof val === 'string') val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToPDF = (title: string, companyName: string, headers: string[], data: any[][], filename: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(22, 163, 174); // Cyan-600 approx
  doc.text(companyName, 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, 14, 30);
  
  // Table
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [6, 182, 212] }, // Cyan-500
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Fecha: ${new Date().toLocaleDateString()} - Página ${i} de ${pageCount} - Total registros: ${data.length}`, 
      14, 
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  doc.save(filename);
};
