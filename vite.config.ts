import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(new URL(".", import.meta.url).pathname, "src/index.ts"),
      name: "SubtitleConverter",
      fileName: "subs-convert",
      formats: ["es", "cjs"],
    },
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ["joi", "ramda", "xml2js"],
      output: {
        // Global vars for the UMD build
        globals: {
          joi: "Joi",
          ramda: "R",
          xml2js: "xml2js",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/lib/tests/**/*.test.ts"],
    exclude: ["src/lib/tests/mocks/**/*", "lib/tests/**/*.js"], // Exclude mocks and original JS tests
  },
  resolve: {
    alias: {
      "@": resolve(new URL(".", import.meta.url).pathname, "src"),
      "@lib": resolve(new URL(".", import.meta.url).pathname, "src/lib"),
      "@mocks": resolve(new URL(".", import.meta.url).pathname, "lib/tests/mocks"),
    },
  },
  // Add options to handle CommonJS modules
  optimizeDeps: {
    include: ["joi", "ramda", "xml2js"],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
});
