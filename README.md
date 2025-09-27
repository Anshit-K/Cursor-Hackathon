# Memory Lane MVP

A hackathon-ready MVP for sharing location-based memories with a beautiful map interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:4200`

## 🗺️ Features

- **Full-screen interactive map** using Leaflet
- **Click to drop pins** anywhere on the map
- **Location search** with Google Places API integration
- **Memories list view** showing all stored memories from JSON
- **Editable place names** with auto-population from search
- **Story input form** with 200 character limit
- **Custom pin icons** with hover effects and shadows
- **Real-time pin display** with popups showing stories
- **Modern, trendy design** with gradients, shadows, and contemporary styling
- **RESTful API** with input validation using Zod

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Validation**: Zod for input validation
- **Storage**: JSON file storage (`backend/data/memories.json`)
- **Testing**: Jest + Supertest
- **API Endpoints**:
  - `POST /api/pins` - Create a new memory pin
  - `GET /api/pins` - Fetch all memory pins

### Frontend (Angular 17)
- **Framework**: Angular 17 with standalone components
- **Map**: Leaflet integration
- **Forms**: Reactive forms with validation
- **Styling**: SCSS with BEM methodology
- **HTTP**: Angular HttpClient for API communication

## 📁 Project Structure

```
/Users/anshitkuda/Desktop/Hackathon/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # Express routes
│   │   ├── types/           # TypeScript type definitions
│   │   └── __tests__/       # Jest tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Angular components
│   │   │   ├── services/    # Angular services
│   │   │   └── models/      # TypeScript interfaces
│   │   └── styles.scss      # Global styles
│   ├── package.json
│   └── angular.json
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🎯 Demo Flow

1. **Open the app** at `http://localhost:4200`
2. **Search for a location** using the "Search Places" button
3. **Navigate to the location** and click "Add Memory Here" button
4. **OR click anywhere** on the map to drop a pin
5. **Enter a place name** (auto-populated from search, editable)
6. **Enter a story** (max 200 characters) in the popup form
7. **Save the memory** - it will appear as a marker on the map
8. **Click existing markers** to view stored memories
9. **Click "View Memories"** to see all memories in a list
10. **View stored data** in `backend/data/memories.json`

## 🔍 Location Search

The app now includes a powerful location search feature:

- **Search any place** in the world using Google Places API
- **Autocomplete suggestions** as you type
- **Smart map navigation** to selected locations with temporary markers
- **Enhanced fallback mode** with 25+ popular locations worldwide
- **Smart search matching** with relevance ranking
- **Beautiful search interface** with loading states

See `GOOGLE_MAPS_SETUP.md` for API key configuration.

### Demo Locations Available (No API Key Required):
- **Canadian**: University of Victoria, CN Tower, Banff, Vancouver, Montreal
- **US**: Times Square, Central Park, Golden Gate Bridge, Hollywood Sign, Grand Canyon, Miami Beach
- **European**: Eiffel Tower, Big Ben, Colosseum, Sagrada Familia
- **Asian**: Tokyo Tower, Great Wall of China, Taj Mahal
- **Australian**: Sydney Opera House, Uluru
- **Cities**: London, Paris, Tokyo, Sydney, Dubai

## 🏷️ Place Names

The app now includes intelligent place naming:

- **Auto-population** from Google Places search results
- **Editable place names** - users can customize any location name
- **User-friendly display** - shows place names instead of coordinates
- **Validation** - place names are required and limited to 100 characters
- **Fallback support** - works even without Google Places API key

## 🎨 Visual Design

The app features beautiful custom pin icons:

- **Bright red pin design** - Large, vibrant teardrop-shaped pins with location icons
- **Enhanced hover effects** - Pins scale up 15% with glowing red shadows on hover
- **Drop shadows** - Realistic shadows beneath each pin for depth
- **SVG icons** - Crisp, scalable location icons inside each pin
- **Smooth animations** - Transitions for all interactive elements
- **Modern dialogs** - Trendy popups and forms with gradients and shadows
- **Contemporary typography** - Clean, readable fonts with proper spacing

## 📋 Memories List View

The app includes a comprehensive memories list feature:

- **View all memories** in a beautiful list interface
- **Memory details** showing coordinates, story, and timestamp
- **Click to navigate** - select any memory to jump to its location on the map
- **Real-time updates** - list refreshes when new memories are added
- **Responsive design** with loading states and error handling
- **Memory preview** with truncated text for long stories
- **Place names** displayed prominently instead of coordinates

## 💾 Persistent Storage

Memories are now stored in a JSON file for persistence:

- **Location**: `backend/data/memories.json`
- **Format**: JSON array with memory objects
- **Fields**: `id`, `lat`, `lng`, `story`, `placeName`, `timestamp`
- **Automatic**: File is created and updated automatically
- **Persistent**: Memories survive server restarts

### Example JSON Structure:
```json
[
  {
    "id": "b8bb9675-948e-4435-bb3e-0fd07d26e257",
    "lat": 40.758,
    "lng": -73.9855,
    "story": "Amazing time at Times Square! The lights were incredible.",
    "placeName": "Times Square",
    "timestamp": "2025-09-26T20:34:14.722Z"
  }
]
```

## 🔧 Development

### Backend Development
- Uses `tsx` for hot reloading
- TypeScript strict mode enabled
- ESLint for code quality
- Environment variables via dotenv

### Frontend Development
- Angular CLI for development server
- Hot module replacement
- TypeScript strict mode
- SCSS preprocessing

## 📝 API Documentation

### Create Pin
```http
POST /api/pins
Content-Type: application/json

{
  "lat": 40.7128,
  "lng": -74.0060,
  "story": "This is where I had my first coffee in NYC!"
}
```

### Get All Pins
```http
GET /api/pins
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "lat": 40.7128,
      "lng": -74.0060,
      "story": "This is where I had my first coffee in NYC!",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🚀 Production Deployment

For production deployment, you would typically:

1. **Backend**: Deploy to services like Railway, Render, or AWS
2. **Frontend**: Build and deploy to Vercel, Netlify, or AWS S3
3. **Database**: Replace JSON file storage with PostgreSQL/MongoDB
4. **Environment**: Set up proper environment variables

## 🎨 Customization

- **Map Style**: Change Leaflet tile layer in `memory-map.component.ts`
- **UI Theme**: Modify SCSS variables in component stylesheets
- **API Endpoints**: Add new routes in `backend/src/routes/`
- **Validation Rules**: Update Zod schemas in `backend/src/types/`

## 📄 License

This project is created for hackathon purposes. Feel free to use and modify as needed.

---

**Happy Hacking! 🎉**
