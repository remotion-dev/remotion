import {cp, mkdir} from "node:fs/promises";
import path from "node:path";
import {VitePlugin} from "@electron-forge/plugin-vite";
import {getCompositorPackage} from "./src/compositor-package";
import {bundleRemotionProject, getPrebuiltRemotionBundlePath} from "./src/remotion-bundle";

const config = {
  packagerConfig: {
    asar: {
      unpackDir: "node_modules/@remotion/compositor-*",
    },
  },
  rebuildConfig: {},
  hooks: {
    packageAfterCopy: async (
      _forgeConfig: unknown,
      buildPath: string,
      _electronVersion: string,
      platform: string,
      arch: string,
    ) => {
      await bundleRemotionProject({
        projectRoot: process.cwd(),
        outDir: getPrebuiltRemotionBundlePath(buildPath),
      });

      // TODO: Remove these manual runtime package copies before making this a public template.
      // End users should get the packaged Remotion runtime through normal dependency installation,
      // not through monorepo-specific Electron Forge copy workarounds.
      const compositorPackage = getCompositorPackage({
        arch,
        platform,
      });
      const compositorPackageJson = require.resolve(`${compositorPackage}/package.json`, {
        paths: [process.cwd()],
      });
      const compositorSource = path.dirname(compositorPackageJson);
      const compositorDestination = path.join(
        buildPath,
        "node_modules",
        compositorPackage,
      );

      await mkdir(path.dirname(compositorDestination), {recursive: true});
      await cp(compositorSource, compositorDestination, {recursive: true});

    },
  },
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
};

export default config;
