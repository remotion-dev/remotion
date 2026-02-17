import { createSandbox } from "./src/app/api/render/sandbox/create-sandbox";
import { saveSnapshotCache } from "./src/app/api/render/sandbox/snapshots";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const sandbox = await createSandbox({
  onProgress: async (progress) => {
    if (progress.type === "phase") {
      const pct = Math.round((progress.progress ?? 0) * 100);
      console.log(`[create-snapshot] ${progress.phase} (${pct}%)`);
    }
  },
});

console.log("[create-snapshot] Taking snapshot...");
const snapshot = await sandbox.snapshot();

const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
await saveSnapshotCache(snapshot.snapshotId, expiresAt);

console.log(
  `[create-snapshot] Snapshot saved: ${snapshot.snapshotId} (expires ${expiresAt.toISOString()})`,
);
