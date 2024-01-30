import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  //format: ["esm"],
  target: "node18",
  clean: true,
  sourcemap: true,
  noExternal: ["@@bridge/api", "@bridge/core", "@bridge/storage"],
});
