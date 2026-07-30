import jsPDF from 'jspdf';
import { PlantRecord } from '../types/plant';

export function exportCSV(records: PlantRecord[], campusName: string): void {
  const headers = [
    'ID', 'Common Name', 'Scientific Name', 'Confidence (%)',
    'Health', 'Diseases', 'Zone', 'Latitude', 'Longitude',
    'Address', 'Notes', 'Date Mapped', 'Campus'
  ];

  const rows = records.map((r) => [
    r.id,
    `"${r.commonName}"`,
    `"${r.scientificName}"`,
    (r.confidence * 100).toFixed(1),
    r.healthStatus,
    `"${r.diseases.join('; ')}"`,
    `"${r.zone}"`,
    r.latitude,
    r.longitude,
    `"${r.address}"`,
    `"${r.notes}"`,
    r.dateMapped,
    `"${campusName}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${campusName.replace(/\s+/g, '_')}_BioCampus_AI_Report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPDF(records: PlantRecord[], campusName: string): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 300, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BioCampus AI — Biodiversity Audit Report', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Campus: ${campusName}   |   Generated: ${today}   |   Total Records: ${records.length}`, 14, 20);

  // Stats row
  const uniqueSpecies = new Set(records.map((r) => r.scientificName)).size;
  const healthyCount = records.filter((r) => r.healthStatus === 'Healthy').length;
  const zones = new Set(records.map((r) => r.zone)).size;

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Trees: ${records.length}  |  Unique Species: ${uniqueSpecies}  |  Healthy: ${healthyCount}  |  Active Zones: ${zones}`, 14, 30);

  // Table header
  const colHeaders = ['ID', 'Common Name', 'Scientific Name', 'Confidence', 'Health', 'Zone', 'GPS', 'Date'];
  const colWidths = [20, 38, 48, 22, 22, 45, 48, 22];
  let x = 14;
  let y = 38;

  doc.setFillColor(2, 132, 199);
  doc.rect(10, y - 5, 277, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);

  colHeaders.forEach((h, i) => {
    doc.text(h, x, y);
    x += colWidths[i];
  });

  // Table rows
  doc.setFont('helvetica', 'normal');
  y += 6;

  records.forEach((r, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    const rowBg = idx % 2 === 0 ? [240, 249, 255] : [255, 255, 255];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(10, y - 4, 277, 7, 'F');
    doc.setTextColor(30, 30, 30);

    const rowData = [
      r.id.slice(-6),
      r.commonName.slice(0, 18),
      r.scientificName.slice(0, 22),
      `${(r.confidence * 100).toFixed(0)}%`,
      r.healthStatus,
      r.zone.slice(0, 20),
      `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`,
      r.dateMapped.slice(0, 10),
    ];

    x = 14;
    rowData.forEach((cell, i) => {
      doc.text(String(cell), x, y);
      x += colWidths[i];
    });

    y += 7;
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('BioCampus AI | Powered by Plant.id + OpenStreetMap Nominatim | For Sanjivani University Hackathon', 14, 200);

  doc.save(`${campusName.replace(/\s+/g, '_')}_BioCampus_AI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
