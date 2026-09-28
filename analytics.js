// Function to aggregate miles grouped by category
async function getMileageSummaryByCategory() {
  const db = await openDB(); // Uses openDB() function from previous examples

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    // Accumulator object: { "DoorDash": 120.5, "Home Business": 45.2 }
    const summary = {};

    // Open a cursor to iterate over all stored trips
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        const trip = cursor.value;
        const category = trip.category || 'Uncategorized';
        const miles = Number(trip.calculatedMiles) || 0;

        // Initialize category sum if it doesn't exist yet
        if (!summary[category]) {
          summary[category] = 0;
        }

        // Add to total for this category
        summary[category] += miles;

        // Advance to the next record in IndexedDB
        cursor.continue();
      } else {
        // Cursor reached the end of records; resolve summary
        resolve(summary);
      }
    };

    request.onerror = (e) => reject('Cursor iteration error: ' + e.target.error);
  });
}

// UI Handler to render category totals on screen
async function renderMileageSummary() {
  const summaryContainer = document.getElementById('summary-list');
  summaryContainer.innerHTML = '';

  try {
    const totalsByCategory = await getMileageSummaryByCategory();
    const categories = Object.keys(totalsByCategory);

    if (categories.length === 0) {
      summaryContainer.innerHTML = '<li>No mileage data recorded yet.</li>';
      return;
    }

    let grandTotal = 0;

    categories.forEach((category) => {
      const miles = totalsByCategory[category];
      grandTotal += miles;

      const li = document.createElement('li');
      // Format to 1 decimal place (e.g., 145.2 mi)
      li.innerHTML = `<strong>${category}:</strong> ${miles.toFixed(1)} miles`;
      summaryContainer.appendChild(li);
    });

    // Add Grand Total row at the bottom
    const totalLi = document.createElement('li');
    totalLi.style.marginTop = '8px';
    totalLi.innerHTML = `<strong>Grand Total:</strong> ${grandTotal.toFixed(1)} miles`;
    summaryContainer.appendChild(totalLi);

  } catch (error) {
    console.error('Error calculating summary:', error);
  }
}
