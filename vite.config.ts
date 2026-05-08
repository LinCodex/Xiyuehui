import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Accept either the Vite-standard name or the legacy AI-Studio name and
  // always fall back to an empty string so the bundle never contains the
  // literal `undefined`, which would crash the @google/genai constructor and
  // blank out the whole app.
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  // TEAM_006: Up to two additional fallback keys from separate Google
  // accounts. Each key has its own free-tier RPM/RPD bucket, so when the
  // primary hits 429 the kiosk can rotate to a fresh key automatically.
  // All three are optional — the app works fine with just the primary.
  const geminiKey2 = env.VITE_GEMINI_API_KEY_2 || env.GEMINI_API_KEY_2 || '';
  const geminiKey3 = env.VITE_GEMINI_API_KEY_3 || env.GEMINI_API_KEY_3 || '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
      'import.meta.env.VITE_GEMINI_API_KEY_2': JSON.stringify(geminiKey2),
      'import.meta.env.VITE_GEMINI_API_KEY_3': JSON.stringify(geminiKey3),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split heavy third-party deps into their own chunks so the browser
          // can long-cache them across app deploys.
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['motion'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
