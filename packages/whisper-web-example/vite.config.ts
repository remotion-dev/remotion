import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    // turn off dependency optimization: https://github.com/vitejs/vite/issues/11672#issuecomment-1397855641
    exclude: ['@remotion/whisper-web'],
  },
  // required by SharedArrayBuffer
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  plugins: [react()],
})
