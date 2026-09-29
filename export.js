function escapeCSVField(value) {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function exportTripsToCSV() {
  try {
    const trips = await getAllTrips();

    if (!trips || trips.length === 0) {
      alert('No trips available to export.');
      return;
    }

    const headers = [
      'ID',
      'Date',
      'Category',
      'Start Odometer',
      'End Odometer',
      'Calculated Miles',
      'Notes'
    ];

    const csvRows = [headers.join(',')];

    trips.forEach((trip) => {
      const formattedDate = trip.date ? new Date(trip.date).toISOString().split('T')[0] : 'N/A';

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

    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    const today = new Date().toISOString().split('T')[0];
    downloadLink.setAttribute('download', `mileage_export_${today}.csv`);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('An error occurred while generating the CSV file.');
  }
}