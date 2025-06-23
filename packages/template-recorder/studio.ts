import { startStudioAndServer } from "./scripts/server";

if (typeof Bun === "undefined") {
  console.log("Run this script with Bun: `bun studio.ts`");
  process.exit(1);
}

if (
  typeof Bun !== "undefined" &&
  !Bun.semver.satisfies(Bun.version, ">=1.1.11")
) {
  throw new Error(
    "Bun >=1.1.11 is required to run the Remotion Recorder. Previous versions had a bug which would break long recordings.",
  );
}

startStudioAndServer();
