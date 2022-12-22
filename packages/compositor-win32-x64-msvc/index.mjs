import { createRequire } from "module";

const require = createRequire(import.meta.url);

export const binaryPath = require.resolve("./compositor.exe");
