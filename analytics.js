async function getMileageSummaryByCategory() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const summary = {};

    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const trip = cursor.value;
        const category = trip.category || 'Uncategorized';
        const miles = Number(trip.calculatedMiles) || 0;

        summary[category] = (summary[category] || 0) + miles;
        cursor.continue();
      } else {
        resolve(summary);
      }
    };

    request.onerror = (e) => reject('Cursor iteration error: ' + e.target.error);
  });
}

async function renderMileageSummary() {
  const summaryContainer = document.getElementById('summary-list');
  if (!summaryContainer) return;

  summaryContainer.innerHTML = '';

  try {
    const totalsByCategory = await getMileageSummaryByCategory();
    const categories = Object.keys(totalsByCategory);

    if (categories.length === 0) {
      summaryContainer.innerHTML = '<li class="summary-item">No mileage recorded yet.</li>';
      return;
    }

    let grandTotal = 0;

    categories.forEach((category) => {
      const miles = totalsByCategory[category];
      grandTotal += miles;

      const li = document.createElement('li');
      li.className = 'summary-item';
      li.innerHTML = `
        <span><strong>${category}</strong></span>
        <span>${miles.toFixed(1)} mi</span>
      `;
      summaryContainer.appendChild(li);
    });

    const totalLi = document.createElement('li');
    totalLi.className = 'summary-item';
    totalLi.innerHTML = `
      <span><strong>Grand Total</strong></span>
      <span><strong>${grandTotal.toFixed(1)} mi</strong></span>
    `;
    summaryContainer.appendChild(totalLi);

  } catch (error) {
    console.error('Error calculating summary:', error);
  }
}