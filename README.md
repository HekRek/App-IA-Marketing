# AI Marketing Platform - Nexus

A comprehensive marketing automation platform with AI-powered tools.

## 🚀 Quick Start (Local)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## ☁️ Deploy to Vercel

### Prerequisites
- A GitHub repository (this one)
- A [Vercel account](https://vercel.com)
- API keys:
  - [Google Gemini API](https://makersuite.google.com/app/apikey)
  - [Google Maps Places API](https://console.cloud.google.com/google/maps-apis/credentials) (optional)

### Steps

1. **Push to GitHub** (already done if you're reading this)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import from GitHub → select `HekRek/App-IA-Marketing`

3. **Configure Environment Variables** (CRITICAL)
   
   In your Vercel project settings → "Environment Variables", add:
   
   | Key | Value | Type |
   |-----|-------|------|
   | `VITE_GEMINI_API_KEY` | Your Gemini API key | Plain text |
   | `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Plain text (optional) |
   
   ⚠️ **Important**: Variable names MUST start with `VITE_` (Vite requirement). Do NOT use `GEMINI_API_KEY` alone.

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2 minutes)

5. **Verify**
   - Open your deployed URL
   - Check browser console for any errors
   - Try the Lead Search module (requires Google Maps key)

### 🔧 Troubleshooting

**Blank white screen / No content:**
- Ensure both `VITE_GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY` are set in Vercel
- Clear Vercel build cache: Project Settings → "Build Cache" → "Clear Cache"
- Trigger a redeploy: click "Redeploy" from the deployments page

**Console errors about Google Maps:**
- Error: `Failed to load module script` or `URI malformed` → Google Maps API key missing or invalid
- Error: `loaded directly without loading=async` → ignore, this is a warning from Google, not breaking

**Console errors about Gemini:**
- `VITE_GEMINI_API_KEY is not configured` → Set the variable in Vercel
- API request failures → Check your API key quota and billing

**Build fails on Vercel:**
- Ensure Node.js version is 18+ (Vercel default is fine)
- Check that `npm run build` works locally
- Verify `vercel.json` is present in repo root

**Stale content after update:**
- Vercel may cache old builds. Manually redeploy from dashboard.
- Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### 🏗️ Architecture

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini API (client-side)
- **Maps**: Google Places API (dynamic loading)
- **Storage**: Browser localStorage (no backend/database needed)
- **Hosting**: Static files (Vercel)

### 📁 Key Files

- `src/App.tsx` - Main app router
- `src/store/AppContext.tsx` - Global state management (localStorage-backed)
- `src/components/Modules.tsx` - All feature modules (Dashboard, Leads, Marketing, etc.)
- `src/services/geminiService.ts` - Gemini AI integration
- `src/components/Layout.tsx` - Sidebar navigation

### 🔐 Security Notes

- API keys are exposed in client-side code (required for direct Gemini API calls)
- Consider using a backend proxy for production to protect keys
- For demo/education purposes only

---

**Created by Héctor Martín** | AI Marketing Platform v1.0
