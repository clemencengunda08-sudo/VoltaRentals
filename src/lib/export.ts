'use client';

import { format } from 'date-fns';

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 */
export function convertToCSV(data: any[], filenamePrefix: string): void {
  if (!data || data.length === 0) return;

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const rows = data.map(obj => {
    return headers.map(header => {
      let val = obj[header];
      
      // Handle Firebase Timestamps
      if (val && typeof val === 'object' && val.toDate) {
        val = format(val.toDate(), 'yyyy-MM-dd HH:mm');
      }
      
      // Handle normal Dates
      if (val instanceof Date) {
        val = format(val, 'yyyy-MM-dd HH:mm');
      }
      
      // Handle arrays (e.g., features, tags)
      if (Array.isArray(val)) {
        val = val.join('; ');
      }

      // Handle nested objects (like booking notes) - convert to JSON string or simple count
      if (val && typeof val === 'object' && !val.toDate) {
        val = JSON.stringify(val).replace(/"/g, '""');
      }

      // Escape quotes and wrap in quotes for CSV compliance
      const escaped = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `voltarentals_${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
