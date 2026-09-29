# trades-mileage-log

PWA for tracking multiple job mileage.

## 100% Offline-Capable via Service Workers

- A Service Worker is a background script written in vanilla JavaScript that acts as a client-side network proxy running directly inside the user's browser.
- Asset Caching: On first load, the Service Worker intercepts all network requests and caches the application’s static files (HTML templates, CSS files, JavaScript logic, and icons).
- Cache-First Strategy: When the user opens the app later—even with Airplane Mode enabled—the Service Worker serves those cached assets instantly without ever hitting the network.
- Offline Data Persistence: For saving trip entries offline, data is stored in the browser using IndexedDB or LocalStorage. When connection is restored, a background sync script can upload the locally queued entries to a remote server if needed.

## Example CSV Export

Opening the downloaded .csv file in Microsoft Excel, Google Sheets, or LibreOffice Calc will yield structured columns:

"ID","Date","Category","Start Odometer","End Odometer","Calculated Miles","Notes"
"1","2026-09-28","DoorDash","10420.5","10455.2","34.7","Lunch delivery run"
"2","2026-09-28","Home Business","10455.2","10468.0","12.8","Post Office & supply store"

## Db Schema
```
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
```

## Install Notes

1. The PWA "Install" Method is Different in Firefox

Unlike Mobile Chrome or Safari, Firefox handles Progressive Web Apps differently depending on the operating system:

    Firefox on Android:

        Tap the three dots menu (⋮) next to the address bar.

        Look for "Install" or "Add to Home screen".

        Note: Firefox Android only displays the automatic install banner if your site is served over secure https:// (or http://localhost). If you are visiting via a local IP like [http://192.168.1.50:8000](http://192.168.1.50:8000), Android Firefox strictly disables PWA installation and Service Workers unless you configure remote debugging flags.

    Firefox on iOS (iPhone / iPad):

        Due to Apple's operating system restrictions, all browsers on iOS use Apple's WebKit engine under the hood.

        Apple limits home screen installation privileges to Safari. To install a PWA on iOS, the user must open the link in Safari, tap Share, and choose "Add to Home Screen".

2. Service Worker & IndexedDB Blocking (Private Browsing Mode)

If the app page loads in mobile Firefox but fails when trying to save trips or load cached assets:

    Enhanced Tracking Protection / Strict Mode: If mobile Firefox is set to "Strict" privacy mode, or if you are viewing the page in a Private Tab, Firefox completely disables IndexedDB and blocks Service Worker registration to prevent tracking.

    Fix: Open the app in a standard (non-private) tab with default tracking protection settings.

3. Local Network Security (HTTP vs HTTPS)

Mobile Chrome allows Service Workers on http://localhost and sometimes treats local IP addresses leniently. Mobile Firefox, however, enforces strict HTTPS requirements.