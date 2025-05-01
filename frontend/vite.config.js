import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,  // Isso garante suporte às rotas definidas no frontend
    proxy: {
      // Proxy requests starting with /api to the backend server
      '/api': {
        target: 'http://localhost:3001', // Corrected backend port to 3001
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // If backend is not using HTTPS
        // Optional: rewrite path if needed, e.g., remove /api prefix
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
});
