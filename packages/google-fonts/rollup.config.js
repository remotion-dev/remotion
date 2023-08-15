// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "dist/esm",
        format: "es",
        sourcemap: false,
        chunkFileNames: `[name].mjs`,
        entryFileNames: `[name].mjs`,
      },
    ],
    external: ["remotion"],
    plugins: [
      typescript({
        tsconfig: "tsconfig-esm.json",
        sourceMap: false,
        outputToFilesystem: true,
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        dir: "dist/cjs",
        format: "cjs",
        sourcemap: false,
        chunkFileNames: `[name].cjs`,
      },
    ],
    external: ["remotion"],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        sourceMap: false,
        outputToFilesystem: true,
      }),
    ],
  },
];
