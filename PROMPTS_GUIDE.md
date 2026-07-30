# 🎯 Copy-Paste Prompts for Claude Code - Plant Biodiversity App

Use these exact prompts with Claude Code, Claude Desktop, or Claude.ai to generate each component instantly.

---

## 📦 INITIAL SETUP

### Prompt 1: Project Setup
```
Create a React app using Vite with Tailwind CSS for a plant biodiversity mapping application.

Initialize the project with:
1. Vite as build tool
2. React 18+
3. TailwindCSS
4. React Router for navigation
5. Axios for API calls
6. Install: react-leaflet, leaflet, qrcode.react, recharts, dotenv

Create the folder structure:
- src/components/
- src/pages/
- src/services/
- src/styles/

Create .env.example with placeholder API keys
Create a basic App.jsx with Router setup
Create package.json with all dependencies
Create vite.config.js
```

---

## 🔥 FIREBASE SETUP

### Prompt 2: Firebase Configuration
```
Create a firebaseConfig.js file that:

1. Initializes Firebase with environment variables:
   - REACT_APP_FIREBASE_API_KEY
   - REACT_APP_FIREBASE_AUTH_DOMAIN
   - REACT_APP_FIREBASE_PROJECT_ID
   - REACT_APP_FIREBASE_STORAGE_BUCKET
   - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   - REACT_APP_FIREBASE_APP_ID

2. Initialize these Firebase services:
   - Firebase App
   - Firestore Database
   - Firebase Storage
   - Firebase Authentication

3. Export initialized instances: auth, db, storage

4. Add error handling for connection failures

Also create a .env.example file with all required keys
```

---

## 📸 IMAGE UPLOAD

### Prompt 3: ImageUpload Component
```
Create src/components/ImageUpload.jsx with:

1. File input that accepts image files
2. Camera capture button (uses device camera)
3. Image preview before upload
4. File size validation (max 5MB)
5. Format validation (JPG, PNG only)
6. Loading spinner during upload
7. Success/error messages
8. Upload progress bar

State management:
- selectedImage (preview)
- loading
- error
- uploadProgress

Functions:
- handleFileInput()
- handleCameraCapture()
- validateFile()
- handleUpload()

Styling:
- Responsive grid layout
- Mobile-friendly buttons (48px min height)
- Centered preview image
- TailwindCSS styling
```

---

## 🤖 PLANT IDENTIFICATION

### Prompt 4: Plant Identification Service
```
Create src/services/plantIdentificationService.js that:

1. Function: identifyPlant(imageFile)
   - Upload image to Firebase Storage
   - Call Google Cloud Vision API
   - Extract plant detection labels
   - Parse confidence scores
   - Return formatted data

2. Alternative: Use PlantNet API as fallback
   - Function: identifyPlantWithPlantNet(imageFile)
   - Convert image to base64
   - Send to PlantNet API
   - Parse results

3. Return object format:
   {
     species: "Rosa damascena",
     commonName: "Red Rose",
     scientificName: "Rosa damascena L.",
     confidence: 0.95,
     description: "...",
     imageUrl: "storage-url"
   }

4. Error handling:
   - Network errors
   - Invalid image
   - API quota exceeded
   - User-friendly error messages

Include retry logic for failed requests
```

---

## 📍 GEOLOCATION

### Prompt 5: Location Service
```
Create src/services/locationService.js that:

1. Function: getCurrentLocation()
   - Request browser geolocation permission
   - Return: {
       latitude: number,
       longitude: number,
       accuracy: number,
       timestamp: date,
       address: string (optional)
     }

2. Function: getAddressFromCoordinates(lat, lng)
   - Use reverse geocoding API (optional)
   - Convert coordinates to readable address
   - Return address string

3. Function: calculateDistance(lat1, lng1, lat2, lng2)
   - Calculate distance between two points in meters
   - Used for "distance from campus center"

4. Error handling:
   - Location permission denied
   - Geolocation not available
   - Timeout handling
   - Fallback to manual entry

5. Add success/error callbacks
```

---

## 💾 DATA SERVICE

### Prompt 6: Data Service (Firestore)
```
Create src/services/dataService.js that handles all database operations:

1. Function: savePlant(plantData)
   - Validate plant object
   - Upload image to Firebase Storage
   - Save plant metadata to Firestore
   - Generate unique ID
   - Return: { id, ...plantData }

2. Function: getPlants(filters)
   - Fetch all plants from Firestore
   - Apply filters: status, species, date range
   - Return array of plants

3. Function: getPlantsInRadius(lat, lng, radiusKm)
   - Get plants within X km radius
   - Calculate using Haversine formula
   - Return nearby plants

4. Function: searchPlants(query)
   - Search by species name
   - Search by common name
   - Case-insensitive
   - Return matching plants

5. Function: getPlantById(plantId)
   - Fetch single plant details
   - Return full plant object

6. Function: updatePlant(plantId, updates)
   - Update plant fields
   - Only allow if user is contributor

7. Function: deletePlant(plantId)
   - Delete plant entry
   - Delete associated image from storage

8. Function: addComment(plantId, comment)
   - Add user comment to plant

9. Function: getAnalytics()
   - Return: {
       totalPlants: number,
       uniqueSpecies: number,
       diversityIndex: number,
       speciesCount: { species: count },
       healthDistribution: { status: count },
       plantsOverTime: { date: count }
     }

10. Real-time listeners:
    - onPlantsUpdate(callback)
    - onNewPlant(callback)
```

---

## 🗺️ MAP COMPONENT

### Prompt 7: Plant Map
```
Create src/components/PlantMap.jsx using React Leaflet:

1. Display map with:
   - OpenStreetMap tiles
   - Campus center as default center
   - Zoom level: 16-18

2. Add clustered markers:
   - Green marker: Healthy plants
   - Yellow marker: Plants needing attention
   - Red marker: Endangered/invasive plants

3. Marker interactions:
   - Click marker → show plant popup
   - Popup shows: species, date, contributor
   - "View Details" link in popup

4. Buttons/Controls:
   - "Zoom to My Location" button
   - "Center Map" button
   - Filter buttons (by health status)
   - Search box (filter by species)

5. Features:
   - Real-time marker updates
   - Smooth animation on zoom
   - Marker clustering
   - Responsive sizing

6. Mobile optimization:
   - Touch-friendly zoom controls
   - Full-width on mobile
   - Reduce marker size on small screens

Use react-leaflet and leaflet-markercluster libraries
```

---

## 📋 INVENTORY LIST

### Prompt 8: Inventory List Component
```
Create src/components/InventoryList.jsx with:

1. Display plants in grid/table:
   - Thumbnail image
   - Species name
   - Location
   - Date added
   - Contributor name
   - Health status badge

2. Search & Filter:
   - Search by species name (real-time)
   - Filter by health status (dropdown)
   - Filter by date range (date picker)
   - Filter by contributor
   - Sort: by date (newest/oldest), by species (A-Z), by popularity

3. Pagination:
   - 20 items per page
   - Previous/Next buttons
   - Page indicator
   - Jump to page input

4. Each plant card clickable:
   - Link to plant detail page
   - Hover effect
   - Shows full info on hover (optional)

5. Mobile responsive:
   - Single column on mobile
   - 2 columns on tablet
   - 3-4 columns on desktop

6. Empty state:
   - Show message if no plants
   - "Add first plant" button

Use TailwindCSS grid for layout
```

---

## 🔍 PLANT DETAIL PAGE

### Prompt 9: Plant Detail Component
```
Create src/pages/PlantDetail.jsx with:

1. Display plant information:
   - Large hero image (full width)
   - Species name (prominent heading)
   - Scientific name (smaller text)
   - Common name
   - Confidence score from AI

2. Location & Date:
   - GPS coordinates (latitude, longitude)
   - "View on Map" button
   - Distance from campus center
   - Address (if available)
   - Date found & time

3. Contributor info:
   - Contributor name (clickable to profile)
   - Multiple contributors (if applicable)
   - "View Contributor" button

4. Status & Details:
   - Health status badge (color-coded)
   - User notes/comments
   - Number of likes
   - Like button

5. QR Code section:
   - Display QR code
   - "Download QR" button
   - "Print" button

6. Comments section:
   - Show all comments
   - Add new comment (if logged in)
   - Comment author & timestamp
   - Delete comment (if owner)

7. Action buttons:
   - Edit (if user is contributor)
   - Delete (if user is contributor)
   - Share button
   - Report button

8. Navigation:
   - Back button
   - Next plant button
   - Previous plant button

Use react-router for navigation
Use QRCode component from qrcode.react
```

---

## 📊 ANALYTICS DASHBOARD

### Prompt 10: Analytics Component
```
Create src/components/AnalyticsDashboard.jsx with:

1. Summary cards at top:
   - Total plants identified (large number)
   - Unique species count (large number)
   - Diversity index value (large number)
   - Species added today

2. Charts:
   - Bar chart: Top 10 most common species
   - Line chart: Plants added over time (7 days)
   - Pie chart: Health status distribution (healthy/diseased/endangered/invasive)
   - Heatmap: Plant concentration by campus location

3. Tables:
   - Recent additions (last 5 plants)
   - Top contributors (this week)
   - Most liked plants

4. Statistics:
   - Average plants per species
   - Endangered species count
   - Coverage percentage (% of campus mapped)
   - Growth rate

5. Export options:
   - "Export as PDF" button
   - "Export as PNG" button
   - "Export as CSV" button

6. Responsive layout:
   - Stack charts on mobile
   - Side-by-side on desktop
   - Full-width summary cards

Use recharts for charting
Add color coding for visual appeal
```

---

## 🎟️ QR CODE GENERATOR

### Prompt 11: QR Code Component
```
Create src/components/QRCodeGenerator.jsx with:

1. Generate QR code containing:
   - Plant ID
   - Species name
   - GPS coordinates
   - Timestamp

2. QR data format:
   "https://yourapp.com/plant/{plantId}?species={species}&lat={lat}&lng={lng}"

3. Features:
   - Display QR code image
   - Adjustable size (64x64 to 256x256 pixels)
   - Download as PNG
   - Print-friendly version
   - Copy QR link to clipboard

4. Styling:
   - Centered display
   - Dark border around QR
   - White background
   - Professional appearance

5. Mobile optimization:
   - Full-width on mobile
   - Larger default size on desktop

Use qrcode.react library
Include error level: H (high)
```

---

## 🏠 HOME PAGE

### Prompt 12: Home Page
```
Create src/pages/HomePage.jsx with:

1. Hero Section:
   - Large banner image (plant field)
   - Project title: "Campus Biodiversity Mapper"
   - Subtitle: "Discover and map plants on campus"
   - Call-to-action buttons:
     - "Start Mapping" (to upload page)
     - "View Map" (to map page)

2. Quick Stats Section:
   - Total plants identified (live count)
   - Unique species count (live)
   - Recent activity (last 10 additions)

3. Features Section:
   - 4 feature cards:
     1. AI-powered identification
     2. Interactive mapping
     3. Biodiversity analytics
     4. QR code integration
   - Each with icon and description

4. Recent Additions:
   - Carousel showing last 10 plants
   - Plant image, name, location
   - "View Details" link

5. Top Species Section:
   - Bar chart of top 5 species
   - Interactive chart

6. Footer:
   - About project
   - Contact info
   - Links to pages
   - Social media

7. Navigation bar:
   - Logo
   - Links: Home, Map, Inventory, Analytics
   - Login/Profile button
   - Mobile hamburger menu

Responsive design
Smooth scrolling
Professional styling with TailwindCSS
```

---

## 📱 UPLOAD PAGE

### Prompt 13: Upload Page
```
Create src/pages/UploadPage.jsx with:

1. Form sections:
   - Image Upload (using ImageUpload component)
   - Plant identification results (auto-filled)
   - Geolocation capture (using location service)
   - Health status dropdown
   - Optional notes textarea
   - Contributor name (auto-filled if logged in)

2. Form flow:
   1. User uploads image
   2. AI identifies plant (auto)
   3. Geolocation captured (auto)
   4. User reviews results
   5. User adds optional details
   6. User submits

3. Validation:
   - Image required
   - Valid coordinates required
   - Species must be identified
   - All validations before submit

4. Success/Error states:
   - Loading spinner during upload
   - Success message + redirect to details
   - Error message with retry option

5. Mobile optimization:
   - Full-width form
   - Large input fields
   - Touch-friendly buttons

Use React Hook Form for form management
Use TailwindCSS for styling
Include progress indicators
```

---

## 🔐 AUTHENTICATION

### Prompt 14: Auth Setup & Login
```
Create src/services/authService.js with:

1. Function: signInWithGoogle()
   - Use Firebase Google auth
   - Return user object

2. Function: signOut()
   - Log out user
   - Clear stored data

3. Function: getCurrentUser()
   - Return logged-in user
   - Return null if not logged in

4. Function: createUserProfile(user)
   - Save user profile to Firestore
   - Store: name, email, avatar, bio

Create src/components/LoginButton.jsx with:
   - Google Sign-In button
   - User profile dropdown (if logged in)
   - Logout option

Use Firebase Authentication
Use Firebase Google OAuth
Store user data in Firestore
```

---

## 🎨 STYLING & THEME

### Prompt 15: Global Styles & Theme
```
Create src/styles/global.css with:

1. CSS variables:
   - Primary green: #4CAF50
   - Secondary blue: #2196F3
   - Accent orange: #FF9800
   - Danger red: #F44336
   - Light gray bg: #FAFAFA
   - Dark text: #333333

2. Reset styles:
   - Remove default margins
   - Set consistent font-family
   - Set line-height

3. Component base styles:
   - Buttons
   - Input fields
   - Cards
   - Badges

4. Dark mode support (optional):
   - CSS dark mode variables
   - Media query: @media (prefers-color-scheme: dark)

5. Responsive utilities:
   - Mobile first breakpoints
   - Container queries

Create tailwind.config.js with:
   - Custom colors from CSS variables
   - Custom breakpoints
   - Custom font sizes
   - Custom spacing scale
```

---

## 🚀 DEPLOYMENT

### Prompt 16: Vercel Deployment Setup
```
Create deployment configuration:

1. vercel.json:
   - Configure build settings
   - Environment variables
   - Rewrites for React Router

2. Update package.json with scripts:
   - "dev": vite dev
   - "build": vite build
   - "preview": vite preview
   - "start": vite preview

3. Create .vercelignore:
   - Ignore unnecessary files
   - Optimize deployment size

4. Instructions for deployment:
   - Connect GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

Include:
- Automatic deployments on git push
- Preview deployments for PRs
- Production domain setup
```

---

## 🧪 TESTING

### Prompt 17: Testing Setup
```
Create src/__tests__/ folder with tests for:

1. ImageUpload.test.jsx
   - Test file upload
   - Test validation
   - Test error handling

2. PlantMap.test.jsx
   - Test map rendering
   - Test marker display
   - Test filtering

3. dataService.test.js
   - Test CRUD operations
   - Test search/filter
   - Test analytics calculations

Include:
- Jest configuration
- React Testing Library setup
- Mock Firebase
- Mock APIs

Create test scripts in package.json:
- "test": jest
- "test:watch": jest --watch
- "test:coverage": jest --coverage
```

---

## 📖 DOCUMENTATION

### Prompt 18: README.md
```
Create README.md with:

1. Project overview
2. Features list
3. Tech stack
4. Installation instructions
5. Configuration (environment variables)
6. How to run locally
7. Project structure explanation
8. API documentation
9. Deployment instructions
10. Contributing guidelines
11. License
12. Contact info

Include:
- Screenshots/demo GIFs
- Quick start guide
- Troubleshooting section
- Links to resources
```
