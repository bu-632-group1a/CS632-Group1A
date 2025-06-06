import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'https://cs632-group1a.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true // Enable WebSocket proxy
      }
    }
  }
});