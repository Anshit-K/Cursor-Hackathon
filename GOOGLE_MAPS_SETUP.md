# Google Maps API Setup Guide

To enable the location search feature, you need to set up a Google Maps API key.

## 🔑 Getting Your API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - **Places API**
     - **Maps JavaScript API**
4. **Create credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

## 🔧 Configuration

1. **Update environment files**:
   ```bash
   # Edit frontend/src/environments/environment.ts
   export const environment = {
     production: false,
     googleMapsApiKey: 'YOUR_ACTUAL_API_KEY_HERE'
   };
   
   # Edit frontend/src/environments/environment.prod.ts
   export const environment = {
     production: true,
     googleMapsApiKey: 'YOUR_ACTUAL_API_KEY_HERE'
   };
   ```

2. **Restrict your API key** (recommended for production):
   - In Google Cloud Console, click on your API key
   - Under "Application restrictions", choose "HTTP referrers"
   - Add your domain(s): `localhost:4200/*`, `yourdomain.com/*`
   - Under "API restrictions", select "Restrict key" and choose:
     - Places API
     - Maps JavaScript API

## 🚀 Testing

1. **Start the application**:
   ```bash
   cd frontend
   npm start
   ```

2. **Test the search feature**:
   - Click the "Search Places" button
   - Type a location (e.g., "Times Square, New York")
   - Select a result to add a memory there

## 🔄 Fallback Mode

If no API key is configured, the app will work in fallback mode with mock search results. This allows you to test the functionality without setting up Google Maps API.

## 💡 Tips

- **Free tier**: Google Maps API has a generous free tier for development
- **Rate limits**: Be aware of API quotas for production use
- **Security**: Never commit API keys to version control
- **Environment variables**: Consider using environment variables for production deployments

## 🆘 Troubleshooting

- **"Google Places service not initialized"**: Check your API key and enabled APIs
- **No search results**: Verify Places API is enabled and has quota remaining
- **CORS errors**: Ensure your domain is added to API key restrictions

---

**Note**: The search feature will work with mock data if no valid API key is provided, so you can still demo the functionality!

