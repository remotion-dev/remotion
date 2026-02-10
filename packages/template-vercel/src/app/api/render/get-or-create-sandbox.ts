import { Sandbox } from "@vercel/sandbox";
import { createDisposableSandbox, OnProgressFn } from "./helpers";
import { createSandbox } from "./create-sandbox";
import { getCachedSnapshot, saveSnapshotCache } from "./snapshots";

const TIMEOUT = 5 * 60 * 1000;

export async function getOrCreateSandbox(
	onProgress: OnProgressFn,
): Promise<Sandbox & AsyncDisposable> {
	// Check for a cached snapshot (production only)
	const cachedSnapshotId = await getCachedSnapshot();

	if (cachedSnapshotId) {
		await onProgress({
			type: "phase",
			phase: "Creating sandbox...",
			progress: 0,
		});

		try {
			return await createDisposableSandbox({
				source: { type: "snapshot", snapshotId: cachedSnapshotId },
				timeout: TIMEOUT,
			});
		} catch {
			// Snapshot may have been deleted or is invalid, fall through to full setup
		}
	}

	await onProgress({
		type: "phase",
		phase: "Creating sandbox...",
		progress: 0,
	});

	const setupSandboxInstance = await createSandbox({ onProgress });

	// In production, snapshot the sandbox and create a new one from it
	if (process.env.VERCEL) {
		const snapshot = await setupSandboxInstance.snapshot();
		// snapshot() shuts down the sandbox, so we don't need to stop it
		// Snapshots expire after 7 days
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		await saveSnapshotCache(snapshot.snapshotId, expiresAt);

		await onProgress({
			type: "phase",
			phase: "Creating sandbox...",
			progress: 0,
		});

		return await createDisposableSandbox({
			source: { type: "snapshot", snapshotId: snapshot.snapshotId },
			timeout: TIMEOUT,
		});
	}

	return setupSandboxInstance;
}
