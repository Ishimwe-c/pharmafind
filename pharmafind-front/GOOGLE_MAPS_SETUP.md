# 🗺️ Google Maps Integration Setup

## 📋 Prerequisites

1. **Google Cloud Console Account**: You need a Google account
2. **Billing Enabled**: Google Maps API requires billing to be enabled
3. **API Key**: A valid Google Maps API key

## 🔑 Getting Your Google Maps API Key

### Step 1: Go to Google Cloud Console
- Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Sign in with your Google account

### Step 2: Create or Select a Project
- Create a new project or select an existing one
- Give it a meaningful name (e.g., "PharmaFind Maps")

### Step 3: Enable Required APIs
Enable these APIs for your project:
- **Maps JavaScript API** - For displaying the map
- **Places API** - For search functionality
- **Geocoding API** - For address lookup
- **Directions API** - For route calculation and navigation

### Step 4: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your new API key

### Step 5: Restrict API Key (Recommended)
1. Click on your API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain (e.g., `localhost:5173/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select only the APIs you enabled above

## ⚙️ Environment Configuration

### Create .env file
Create a `.env` file in your `pharmafind-front` directory:

```bash
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Replace the placeholder
Replace `your_actual_api_key_here` with your actual Google Maps API key.

## 🚀 Features Available

With Google Maps integration, you now have:

✅ **Interactive Map**: High-quality Google Maps with multiple view options
✅ **Smart Search**: Search for any address, business, or location
✅ **Automatic Geocoding**: Convert addresses to coordinates
✅ **Reverse Geocoding**: Convert coordinates to readable addresses
✅ **Draggable Marker**: Drag the marker to set exact location
✅ **Directions & Navigation**: Get turn-by-turn directions to pharmacies
✅ **Multiple Map Types**: Road, satellite, terrain, and street view
✅ **Address Display**: Shows the full address for selected coordinates
✅ **Coordinate Fields**: Read-only latitude/longitude display

## 💰 Cost Information

**Free Tier (Monthly):**
- Maps JavaScript API: 28,500 map loads
- Places API: 1,000 requests
- Geocoding API: 2,500 requests
- Directions API: 2,500 requests

**Paid Tier:**
- Maps JavaScript API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests
- Geocoding API: $5 per 1,000 requests
- Directions API: $5 per 1,000 requests

*For a pharmacy app, you'll likely stay within free limits unless you have thousands of users.*

## 🔧 Troubleshooting

### Common Issues:

1. **"Google Maps JavaScript API error: RefererNotAllowedMapError"**
   - Solution: Add your domain to API key restrictions

2. **"Google Maps JavaScript API error: ApiNotActivatedMapError"**
   - Solution: Enable the Maps JavaScript API in Google Cloud Console

3. **"Google Maps JavaScript API error: QuotaExceededError"**
   - Solution: Check your usage in Google Cloud Console

4. **Map not loading**
   - Check if API key is correct
   - Verify billing is enabled
   - Check browser console for errors

## 📱 Usage Tips

1. **Search**: Type any address or business name in the search bar
2. **Click Map**: Click anywhere on the map to set location
3. **Drag Marker**: Drag the red marker to fine-tune location
4. **Save**: Click "Save Changes" to update your pharmacy location
5. **Reset**: Use "Reset Changes" to revert unsaved modifications

## 🎯 Next Steps

After setup:
1. Test the search functionality
2. Verify coordinate capture works
3. Test saving to your backend
4. Customize map styling if needed
5. Add additional Google Maps features as required

---

**Need Help?** Check the Google Maps API documentation: [https://developers.google.com/maps](https://developers.google.com/maps)
