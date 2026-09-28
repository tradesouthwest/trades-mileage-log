// Function to escape string values containing commas, quotes, or newlines
function escapeCSVField(value) {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  // If the field contains quotes, escape them by doubling them up (" -> "")
  const escaped = stringValue.replace(/"/g, '""');
  // Wrap field in double quotes
  return `"${escaped}"`;
}

// Main CSV Export Function
async function exportTripsToCSV() {
  try {
    // 1. Fetch all records from IndexedDB
    const trips = await getAllTrips();

    if (!trips || trips.length === 0) {
      alert('No trips available to export.');
      return;
    }

    // 2. Define CSV Headers
    const headers = [
      'ID',
      'Date',
      'Category',
      'Start Odometer',
      'End Odometer',
      'Calculated Miles',
      'Notes'
    ];

    // Build the CSV string rows
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add header row

    trips.forEach((trip) => {
      const formattedDate = new Date(trip.date).toISOString().split('T')[0]; // YYYY-MM-DD
      
      const row = [
        escapeCSVField(trip.id),
        escapeCSVField(formattedDate),
        escapeCSVField(trip.category),
        escapeCSVField(trip.startOdometer),
        escapeCSVField(trip.endOdometer),
        escapeCSVField(trip.calculatedMiles),
        escapeCSVField(trip.notes || '')
      ];

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\r\n'); // Use standard RFC 4180 line endings

    // 3. Create a Blob and trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary <a> element to programmatically click
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    
    // Generate filename with current date (e.g., mileage_export_2026-09-28.csv)
    const today = new Date().toISOString().split('T')[0];
    downloadLink.setAttribute('download', `mileage_export_${today}.csv`);
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Cleanup temporary DOM elements and Object URL memory
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('An error occurred while generating the CSV file.');
  }
}
