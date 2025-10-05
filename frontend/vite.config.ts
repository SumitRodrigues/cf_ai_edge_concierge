import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // dev proxy to wrangler dev default port
      "/api": "http://127.0.0.1:8787"
    }
  }
});
