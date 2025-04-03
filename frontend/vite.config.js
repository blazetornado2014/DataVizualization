import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000, // Set port to 5000 to work with Replit
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 443 // Required for Replit
    },
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Backend will run on 8000
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    // Allow specific host mentioned in the error message
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.replit.dev',
      '.replit.app',
      '.repl.co',
      '91227d37-ebbf-4c49-8a46-08552a47f84a-00-25z7ivytr0jgs.spock.replit.dev'
    ],
    // Allow all hosts in Replit environment
    fs: {
      strict: false,
    },
    cors: true,
    strictPort: false,
    // Allow all Replit domains
    origin: '*'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'd3']
  }
})
