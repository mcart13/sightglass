import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const resolveWorkspaceSource = (relativePath: string): string =>
  fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@sightglass/core": resolveWorkspaceSource("../../packages/core/src/index.ts"),
      "@sightglass/critique": resolveWorkspaceSource(
        "../../packages/critique/src/index.ts",
      ),
      "@sightglass/export": resolveWorkspaceSource(
        "../../packages/export/src/index.ts",
      ),
      "@sightglass/react": resolveWorkspaceSource("../../packages/react/src/index.ts"),
      "@sightglass/session": resolveWorkspaceSource(
        "../../packages/session/src/index.ts",
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});
