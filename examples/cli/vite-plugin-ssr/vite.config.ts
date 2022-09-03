/// <reference types="vavite/vite-config" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ssr from "vite-plugin-ssr/plugin";
import { hattip } from "hattip/vite-plugin";

export default defineConfig({
  plugins: [hattip(), react(), ssr({ disableAutoFullBuild: true })],
});
