import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/esp-data': {
        target: 'http://10.58.122.4/data',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/esp-data/, ''),
      },
    },
  },
})
