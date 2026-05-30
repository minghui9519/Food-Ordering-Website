import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function devUrlBanner() {
  return {
    name: 'dev-url-banner',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address()
        const port = typeof address === 'object' && address ? address.port : 5173
        const host = typeof address === 'object' && address?.address === '::' ? 'localhost' : 'localhost'
        console.log('')
        console.log('  FoodyHub dev URLs')
        console.log(`  Customer site → http://${host}:${port}/`)
        console.log(`  Admin portal  → http://${host}:${port}/admin.html`)
        console.log('')
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), devUrlBanner()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
