const DB_NAME = 'MileageTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'trips';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject('Database error: ' + event.target.error);
  });
}

// Fetch the most recently saved trip entry
async function getLastTrip() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor(null, 'prev');

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      resolve(cursor ? cursor.value : null);
    };

    request.onerror = (e) => reject('Failed to retrieve last trip: ' + e.target.error);
  });
}

// Add trip
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

// Fetch all trips
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

// Delete single trip by ID
async function deleteTripById(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(Number(id));
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject('Failed to delete trip: ' + e.target.error);
  });
}

// Clear all trips
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