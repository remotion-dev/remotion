import { Sandbox } from "@vercel/sandbox";
import { createDisposableSandbox, OnProgressFn } from "../helpers";
import { createSandbox, SANDBOX_CREATING_TIMEOUT } from "./create-sandbox";
import { getCachedSnapshot } from "./snapshots";

export async function reuseOrCreateSandbox(
  onProgress: OnProgressFn,
): Promise<Sandbox & AsyncDisposable> {
  // During local development, a new sandbox is created from scratch always (no snapshotting)
  if (!process.env.VERCEL) {
    await onProgress({
      type: "phase",
      phase: "Creating sandbox...",
      progress: 0,
    });
    return await createSandbox({ onProgress });
  }

  // In production, the snapshot is created at build time via `create-snapshot`
  const cachedSnapshotId = await getCachedSnapshot();

  if (!cachedSnapshotId) {
    throw new Error(
      "No sandbox snapshot found. Run `bun run create-snapshot` as part of the build process.",
    );
  }

  return await createDisposableSandbox({
    source: { type: "snapshot", snapshotId: cachedSnapshotId },
    timeout: SANDBOX_CREATING_TIMEOUT,
  });
}
