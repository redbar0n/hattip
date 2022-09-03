import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "./src/index.ts", "vite-plugin": "./src/vite-plugin.ts" },
    format: ["esm"],
    platform: "node",
    dts: {
      entry: "./src/vite-plugin.ts",
    },
  },
]);
