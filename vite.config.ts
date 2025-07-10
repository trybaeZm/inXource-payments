import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
   preview: {
    allowedHosts: ['payment.inxource.com'],
  },
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://tumeny.herokuapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        secure: false,
      },
    },
  },
});
