import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "/src/app/tests/setup.ts",
  },
  resolve: {
    alias: {
      app: "/src/app",
      entities: "/src/entities",
      features: "/src/features",
      widgets: "/src/widgets",
      pages: "/src/pages",
      shared: "/src/shared",
    },
  },
});
