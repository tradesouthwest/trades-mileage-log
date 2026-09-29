// ==========================================================================
// 1. UI Rendering Functions
// ==========================================================================

// Render stored trips list from IndexedDB
async function renderTrips() {
  const listElement = document.getElementById('trip-list');
  if (!listElement) return;

  listElement.innerHTML = ''; // Fresh reset of DOM container

  const trips = await getAllTrips();

  if (!trips || trips.length === 0) {
    listElement.innerHTML = '<li class="trip-item">No trips logged yet.</li>';
    return;
  }

  // Clone array before reversing so original indexedDB array order remains intact
  const sortedTrips = [...trips].reverse();

  sortedTrips.forEach((trip) => {
    const li = document.createElement('li');
    li.className = 'trip-item';

    const formattedDate = trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A';
    const badgeClass = `badge-${trip.category.toLowerCase().replace(/\s+/g, '-')}`;

    li.innerHTML = `
      <div class="trip-details">
        <span class="trip-category-badge ${badgeClass}">${trip.category}</span>
        <div class="trip-miles">${trip.calculatedMiles.toFixed(1)} mi</div>
        <div class="trip-meta">${formattedDate} | Odo: ${trip.startOdometer} → ${trip.endOdometer}</div>
        ${trip.notes ? `<div class="trip-meta"><em>${trip.notes}</em></div>` : ''}
      </div>
      <button class="btn-delete-single" data-id="${trip.id}" type="button">Delete</button>
    `;

    listElement.appendChild(li);
  });
}

// Auto-populate Start Odometer input from the last recorded trip's End Odometer
async function updateNextStartOdometer() {
  const startOdoInput = document.getElementById('start-odo');
  if (!startOdoInput) return;

  try {
    const lastTrip = await getLastTrip();
    if (lastTrip && lastTrip.endOdometer) {
      startOdoInput.value = lastTrip.endOdometer;
    } else {
      startOdoInput.value = ''; // Reset to empty if DB has no entries
    }
  } catch (error) {
    console.error('Error pre-filling odometer:', error);
  }
}

// Master refresh for UI components (List + Category Summary)
async function refreshAppUI() {
  await renderTrips();
  if (typeof renderMileageSummary === 'function') {
    await renderMileageSummary();
  }
}

// ==========================================================================
// 2. Application Event Listeners (Bound once on DOM load)
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Initial load: render list, totals summary, and set start odometer
  await refreshAppUI();
  await updateNextStartOdometer();

  // 1. Form Submission Handler
  const form = document.getElementById('mileage-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const category = document.getElementById('category').value;
      const startOdo = document.getElementById('start-odo').value;
      const endOdo = document.getElementById('end-odo').value;
      const notes = document.getElementById('notes').value;

      // Save record to IndexedDB
      await saveTrip(category, startOdo, endOdo, notes);
      
      // Reset form controls
      form.reset();

      // Refresh trip list, category summary, and pre-fill next start odometer
      await refreshAppUI();
      await updateNextStartOdometer();
    });
  }

  // 2. Single Trip Delete Handler (Event Delegation on #trip-list)
  const tripList = document.getElementById('trip-list');
  if (tripList) {
    tripList.addEventListener('click', async (e) => {
      if (e.target && e.target.classList.contains('btn-delete-single')) {
        e.stopPropagation(); // Stop event bubbling
        const tripId = e.target.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this trip record?')) {
          await deleteTripById(tripId);
          await refreshAppUI();
          await updateNextStartOdometer(); // Adjust odometer if latest trip was removed
        }
      }
    });
  }

  // 3. Clear All Data Handler
  const clearBtn = document.getElementById('clear-all-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('WARNING: This will permanently delete ALL logged trips. Continue?')) {
        await clearAllTrips();
        await refreshAppUI();
        await updateNextStartOdometer();
      }
    });
  }

  // 4. CSV Export Handler
  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn && typeof exportTripsToCSV === 'function') {
    exportBtn.addEventListener('click', exportTripsToCSV);
  }
});