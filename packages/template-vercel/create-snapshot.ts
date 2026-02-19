import { createSandbox } from "./src/app/api/render/sandbox/create-sandbox";
import { saveSnapshotCache } from "./src/app/api/render/sandbox/snapshots";

const sandbox = await createSandbox({
  onProgress: async (progress) => {
    if (progress.type === "phase") {
      const pct = Math.round((progress.progress ?? 0) * 100);
      console.log(`[create-snapshot] ${progress.phase} (${pct}%)`);
    }
  },
});

console.log("[create-snapshot] Taking snapshot...");
const snapshot = await sandbox.snapshot({ expiration: 0 });

await saveSnapshotCache(snapshot.snapshotId);

console.log(
  `[create-snapshot] Snapshot saved: ${snapshot.snapshotId} (never expires)`,
);
