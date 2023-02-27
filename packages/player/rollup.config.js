// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/esm/index.mjs",
        format: "es",
        sourcemap: false,
      },
    ],
    external: ['react', 'remotion', 'react/jsx-runtime'],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        sourceMap: false,
        outputToFilesystem: true
      }),
    ],
  },
];
