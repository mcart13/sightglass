import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolveWorkspaceSource = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@sightglass/core": resolveWorkspaceSource("../core/src/index.ts"),
      "@sightglass/critique": resolveWorkspaceSource("../critique/src/index.ts"),
      "@sightglass/export": resolveWorkspaceSource("../export/src/index.ts"),
      "@sightglass/session": resolveWorkspaceSource("../session/src/index.ts"),
    },
  },
});
