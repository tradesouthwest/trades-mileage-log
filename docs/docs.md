https://gemini.google.com/app/2575b78851139e01

To delete individual trips or wipe all records from IndexedDB, you can use IndexedDB's native delete(key) and clear() transaction methods.

Below is the complete JavaScript logic to add to your database layer (db.js), along with the UI functions to attach to your trip list items and a "Clear All Data" button.
1. Database Functions (db.js)

Add these two asynchronous methods to handle single-record deletion and full-store wiping:

```
// 1. Delete a single trip by its primary key (id)
async function deleteTripById(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // IndexedDB keys are numeric auto-increment integers
    const request = store.delete(Number(id));

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject('Failed to delete trip: ' + e.target.error);
  });
}

// 2. Clear all trips from the object store
async function clearAllTrips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject('Failed to clear database: ' + e.target.error);
  });
}
```
2. UI Rendering with Delete Buttons (app.js)

Update your renderTrips() function so that every logged trip renders with a red "Delete" button containing its unique id in a data attribute:

```
async function renderTrips() {
  const listElement = document.getElementById('trip-list');
  listElement.innerHTML = ''; // Clear existing DOM entries

  const trips = await getAllTrips();

  if (!trips || trips.length === 0) {
    listElement.innerHTML = '<li class="trip-item">No trips logged yet.</li>';
    return;
  }

  // Render trips in reverse chronological order
  trips.reverse().forEach((trip) => {
    const li = document.createElement('li');
    li.className = 'trip-item';

    const formattedDate = trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A';

    // Build item markup with a Delete button
    li.innerHTML = `
      <div class="trip-details">
        <span class="trip-category-badge badge-${trip.category.toLowerCase().replace(/\s+/g, '-')}">
          ${trip.category}
        </span>
        <div class="trip-miles">${trip.calculatedMiles} mi</div>
        <div class="trip-meta">${formattedDate} | Odo: ${trip.startOdometer} → ${trip.endOdometer}</div>
        ${trip.notes ? `<div class="trip-meta"><em>${trip.notes}</em></div>` : ''}
      </div>
      <button class="btn-delete-single" data-id="${trip.id}" aria-label="Delete trip">
        Delete
      </button>
    `;

    listElement.appendChild(li);
  });
}

// Event Delegation for Single Trip Deletion
document.getElementById('trip-list').addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('btn-delete-single')) {
    const tripId = e.target.getAttribute('data-id');

    if (confirm('Are you sure you want to delete this trip record?')) {
      await deleteTripById(tripId);
      
      // Refresh list and category totals on screen
      await renderTrips();
      if (typeof renderMileageSummary === 'function') {
        await renderMileageSummary();
      }
    }
  }
});

// Handler for "Clear All Data" Button
async function handleClearAllData() {
  const userConfirmed = confirm(
    'WARNING: This will permanently delete ALL logged trips. This action cannot be undone.\n\nDo you want to proceed?'
  );

  if (userConfirmed) {
    await clearAllTrips();
    
    // Refresh UI views
    await renderTrips();
    if (typeof renderMileageSummary === 'function') {
      await renderMileageSummary();
    }
    
    alert('All trip entries have been cleared.');
  }
}
```
3. HTML Integration (index.html)

Add a "Clear All Data" button inside your Actions section in index.html:

```
<!-- Actions Card -->
<section class="card">
  <h2>Data Management</h2>
  <div style="display: flex; gap: 10px;">
    <button id="export-csv-btn" class="btn-secondary">Export Trips to CSV</button>
    <button id="clear-all-btn" class="btn-danger">Clear All Trips</button>
  </div>
</section>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Bind Clear All button
    const clearBtn = document.getElementById('clear-all-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearAllData);
    }
  });
</script>
```
4. Extra CSS Styling (styles.css)

Add red styling for delete and warning actions to keep the visual hierarchy clear:

```
/* Delete & Danger Action Buttons */
.btn-danger {
  background-color: #ef4444;
  color: #ffffff;
  border: none;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-delete-single {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.8rem;
  min-height: auto;
  width: auto;
  cursor: pointer;
}

.btn-delete-single:hover {
  background-color: #fef2f2;
}
```
