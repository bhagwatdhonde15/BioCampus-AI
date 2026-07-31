import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/esp-data': {
        target: 'http://10.58.122.4/data',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/esp-data/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Silently handle connection errors (e.g. ESP8266 offline) to prevent terminal log spam
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify({ error: 'ESP8266 offline', details: err.message }));
          });
        }
      }
    }
  },
})
