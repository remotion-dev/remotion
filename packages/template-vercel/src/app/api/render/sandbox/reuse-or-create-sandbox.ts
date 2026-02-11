import { Sandbox } from "@vercel/sandbox";
import { createDisposableSandbox, OnProgressFn } from "../helpers";
import { createSandbox } from "./create-sandbox";
import { getCachedSnapshot } from "./snapshots";

const TIMEOUT = 5 * 60 * 1000;

export async function reuseOrCreateSandbox(
  onProgress: OnProgressFn,
): Promise<Sandbox & AsyncDisposable> {
  await onProgress({
    type: "phase",
    phase: "Creating sandbox...",
    progress: 0,
  });

  // In production, the snapshot is created at build time via `create-snapshot`
  const cachedSnapshotId = await getCachedSnapshot();

  if (cachedSnapshotId) {
    try {
      return await createDisposableSandbox({
        source: { type: "snapshot", snapshotId: cachedSnapshotId },
        timeout: TIMEOUT,
      });
    } catch {
      // Snapshot may have been deleted or is invalid, fall through to full setup
    }
  }

  // Local development: create sandbox from scratch (no snapshotting)
  return await createSandbox({ onProgress });
}
