//import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000, fs: { strict: false } },
  plugins: [react() /*, viteCommonjs()*/],
  // build: {
  //   commonjsOptions: {
  //     //transformMixedEsModules: true,
  //     exclude: [
  //       //"node_modules/lodash-es/**",
  //       //"node_modules/@types/lodash-es/**",
  //     ],
  //   },
  // },
});
