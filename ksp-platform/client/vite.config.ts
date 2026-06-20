import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": "http://localhost:8000",
      "/audit": "http://localhost:8000",
      "/offenders": "http://localhost:8000",
      "/chat": "http://localhost:8000",
      "/analytics": "http://localhost:8000",
      "/hotspot": "http://localhost:8000",
      "/anomaly": "http://localhost:8000",
      "/fir": "http://localhost:8000"
    }
  }
})
