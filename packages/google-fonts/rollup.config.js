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
];
