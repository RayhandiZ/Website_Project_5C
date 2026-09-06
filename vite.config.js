import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Gagal terang-terangan kalau 5173 sudah dipakai. Tanpa ini Vite diam-diam
    // pindah ke 5174, dan dua server yang berbagi cache node_modules/.vite bisa
    // saling menimpa dependensi hasil pre-bundle sampai halaman jadi kosong.
    strictPort: true,
    open: true,
  },
})
