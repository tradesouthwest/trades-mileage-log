// 1. Initialize IndexedDB Database
const DB_NAME = 'MileageTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'trips';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Runs only when database is created or version increases
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create store with auto-incrementing primary key 'id'
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        // Create an index for filtering/sorting by category
        store.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject('Database error: ' + event.target.error);
  });
}

// 2. Add a new trip record
async function saveTrip(category, startOdo, endOdo, notes) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const tripData = {
      category: category,
      startOdometer: Number(startOdo),
      endOdometer: Number(endOdo),
      calculatedMiles: Number(endOdo) - Number(startOdo),
      notes: notes,
      date: new Date().toISOString()
    };

    const request = store.add(tripData);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject('Failed to save trip: ' + e.target.error);
  });
}

// 3. Fetch all saved trips
async function getAllTrips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject('Failed to retrieve trips: ' + e.target.error);
  });
}

// 4. UI Handler: Render stored trips to DOM
async function renderTrips() {
  const listElement = document.getElementById('trip-list');
  listElement.innerHTML = ''; // Clear existing list

  const trips = await getAllTrips();

  if (trips.length === 0) {
    listElement.innerHTML = '<li>No trips logged yet.</li>';
    return;
  }

  // Render trips in reverse chronological order
  trips.reverse().forEach((trip) => {
    const li = document.createElement('li');
    const dateFormatted = new Date(trip.date).toLocaleDateString();
    
    li.textContent = `[${dateFormatted}] ${trip.category}: ${trip.calculatedMiles} mi ` +
                     `(${trip.startOdometer} → ${trip.endOdometer}) - ${trip.notes}`;
    listElement.appendChild(li);
  });
}

// 5. Event Listeners for HTML Form
document.addEventListener('DOMContentLoaded', () => {
  renderTrips(); // Render initial list on page load

  const form = document.getElementById('mileage-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const startOdo = document.getElementById('start-odo').value;
    const endOdo = document.getElementById('end-odo').value;
    const notes = document.getElementById('notes').value;

    await saveTrip(category, startOdo, endOdo, notes);
    
    form.reset();
    await renderTrips(); // Refresh UI view
  });
});
