import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        // VS Code webviews need a single, consistently-named JS and CSS file
        entryFileNames: "static/js/main.js",
        chunkFileNames: "static/js/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "static/css/main.css";
          }
          return "static/[ext]/[name][extname]";
        },
        // Disable code splitting
        manualChunks: undefined,
      },
    },
  },
});
