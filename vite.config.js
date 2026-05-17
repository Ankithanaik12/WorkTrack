import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Supabase packages import tslib; ensure it is pre-bundled and resolvable (avoids missing-hoist / stale .vite cache issues).
  optimizeDeps: {
    include: ['tslib', '@supabase/supabase-js'],
  },
})
