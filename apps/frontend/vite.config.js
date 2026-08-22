import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true, // (Catatan: Ini aman dibiarkan, meski di Railway tidak akan membuka browser)
    host: true,
    allowedHosts: true, // <--- TAMBAHKAN BARIS INI DI SINI
    proxy: {
      '/api-sensor': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-sensor/, '/api')
      },
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:80',
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    allowedHosts: true,
    host: true
  }
});