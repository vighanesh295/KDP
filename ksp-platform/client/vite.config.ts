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
      "/chat": "http://localhost:8000",
      "/analytics": "http://localhost:8000",
      "/hotspot": "http://localhost:8000",
      "/anomaly": "http://localhost:8000",
      "/fir": "http://localhost:8000"
    }
  }
})
