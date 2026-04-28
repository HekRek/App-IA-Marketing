console.log('🚀 Starting Vercel build...');

// Verify critical environment variables
const requiredEnvVars = ['VITE_GEMINI_API_KEY'];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please set these in Vercel dashboard: Project Settings → Environment Variables');
  process.exit(1);
}

console.log('✅ Environment variables verified');

// Clean dist
const { execSync } = require('child_process');
try {
  if (require('fs').existsSync('dist')) {
    require('fs').rmSync('dist', { recursive: true, force: true });
    console.log('✅ Cleaned dist directory');
  }
} catch (err) {
  console.warn('⚠️ Could not clean dist:', err.message);
}

// Install dependencies precisely
console.log('📦 Installing dependencies...');
execSync('npm ci --no-audit --no-fund', { stdio: 'inherit' });

// Build
console.log('🔨 Building production bundle...');
execSync('npm run build', { stdio: 'inherit' });

console.log('✅ Build completed successfully');

