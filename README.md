# Run and deploy your AI Marketing app

A comprehensive marketing automation platform with AI-powered tools.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

The app will open at `http://localhost:3000`. Data is stored locally in your browser's localStorage—no authentication required.

## Deploy to Vercel

1. Push this repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the following Environment Variables in Vercel:
   - `VITE_GEMINI_API_KEY` - Your Google Gemini API key
   - `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps Places API key (optional)
4. Deploy

**Note:** The app runs entirely in the browser with no backend required.
