# trades-mileage-log
PWA for tracking multiple job mileage.

## 100% Offline-Capable via Service Workers

- A Service Worker is a background script written in vanilla JavaScript that acts as a client-side network proxy running directly inside the user's browser.
- Asset Caching: On first load, the Service Worker intercepts all network requests and caches the application’s static files (HTML templates, CSS files, JavaScript logic, and icons).
- Cache-First Strategy: When the user opens the app later—even with Airplane Mode enabled—the Service Worker serves those cached assets instantly without ever hitting the network.
- Offline Data Persistence: For saving trip entries offline, data is stored in the browser using IndexedDB or LocalStorage. When connection is restored, a background sync script can upload the locally queued entries to a remote server if needed.

## Db Schema
Category
├── id (string / int)
├── name (string) e.g., "DoorDash", "Home Business", "Personal"
├── standard_rate (decimal) e.g., $0.67/mi (optional for tax estimates)
└── color_code (string) e.g., "#FF5733"

TripLog
├── id (string / int)
├── category_id (foreign key -> Category.id)
├── date (ISO 8601 string / date)
├── start_odometer (decimal/float)
├── end_odometer (decimal/float)
├── calculated_miles (end_odometer - start_odometer)
├── purpose_notes (string) e.g., "Delivery run - Lunch shift"
└── is_deductible (boolean)
