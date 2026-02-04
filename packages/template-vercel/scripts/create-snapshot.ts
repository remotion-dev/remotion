/**
 * Creates a Vercel Sandbox snapshot with all dependencies pre-installed.
 *
 * This script:
 * 1. Creates a new sandbox
 * 2. Installs system dependencies (for headless Chrome)
 * 3. Installs @remotion/renderer
 * 4. Downloads headless Chrome browser
 * 5. Takes a snapshot
 *
 * The snapshot ID can then be used in SANDBOX_SNAPSHOT_ID env var
 * to skip setup on future renders.
 *
 * https://vercel.com/docs/vercel-sandbox/concepts/snapshots
 * Note: Snapshots expire after 7 days.
 */

import { Sandbox, Snapshot } from "@vercel/sandbox";

async function createSnapshot() {
	console.log("=== Remotion Sandbox Snapshot Creator ===\n");

	// List existing snapshots
	console.log("Checking for existing snapshots...");
	const {
		json: { snapshots },
	} = await Snapshot.list();

	if (snapshots.length > 0) {
		console.log(`Found ${snapshots.length} existing snapshot(s):`);
		for (const snap of snapshots) {
			const expiresAt = new Date(snap.expiresAt).toLocaleDateString();
			console.log(`  - ${snap.id} (expires: ${expiresAt})`);
		}
		console.log("");
	}

	console.log("Creating new sandbox...");
	const sandbox = await Sandbox.create({
		runtime: "node24",
		timeout: 10 * 60 * 1000,
	});
	console.log(`Sandbox created: ${sandbox.sandboxId}\n`);

	try {
		// Step 1: Install system dependencies for headless Chrome
		console.log("Installing system dependencies...");
		const sysInstallCmd = await sandbox.runCommand({
			cmd: "sudo",
			args: [
				"dnf",
				"install",
				"-y",
				"nss",
				"atk",
				"at-spi2-atk",
				"cups-libs",
				"libdrm",
				"libXcomposite",
				"libXdamage",
				"libXrandr",
				"mesa-libgbm",
				"alsa-lib",
				"pango",
				"gtk3",
			],
			detached: true,
		});

		for await (const log of sysInstallCmd.logs()) {
			process.stdout.write(log.data);
		}

		const sysResult = await sysInstallCmd.wait();
		if (sysResult.exitCode !== 0) {
			throw new Error(
				`System dependencies install failed with exit code ${sysResult.exitCode}`,
			);
		}
		console.log("System dependencies installed.\n");

		// Step 2: Install @remotion/renderer
		console.log("Installing @remotion/renderer...");
		const installCmd = await sandbox.runCommand({
			cmd: "pnpm",
			args: ["install", "@remotion/renderer@latest"],
			detached: true,
		});

		for await (const log of installCmd.logs()) {
			process.stdout.write(log.data);
		}

		const installResult = await installCmd.wait();
		if (installResult.exitCode !== 0) {
			throw new Error(
				`pnpm install failed with exit code ${installResult.exitCode}`,
			);
		}
		console.log("@remotion/renderer installed.\n");

		// Step 3: Download headless Chrome browser
		console.log("Downloading headless Chrome browser...");

		const ensureBrowserScript = `
const { ensureBrowser } = require("@remotion/renderer");

async function main() {
	console.log("Ensuring browser is downloaded...");
	await ensureBrowser();
	console.log("Browser download complete!");
}

main().catch((err) => {
	console.error("Failed to ensure browser:", err.message);
	process.exit(1);
});
`;

		await sandbox.writeFiles([
			{
				path: "ensure-browser.cjs",
				content: Buffer.from(ensureBrowserScript),
			},
		]);

		const browserCmd = await sandbox.runCommand({
			cmd: "node",
			args: ["ensure-browser.cjs"],
			detached: true,
		});

		for await (const log of browserCmd.logs()) {
			process.stdout.write(log.data);
		}

		const browserResult = await browserCmd.wait();
		if (browserResult.exitCode !== 0) {
			throw new Error(
				`Browser download failed with exit code ${browserResult.exitCode}`,
			);
		}
		console.log("Headless Chrome downloaded.\n");

		// Step 4: Create snapshot
		console.log("Creating snapshot...");
		const snapshot = await sandbox.snapshot();

		console.log("\n=== Snapshot Created Successfully ===");
		console.log(`Snapshot ID: ${snapshot.snapshotId}`);
		console.log(`Size: ${(snapshot.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
		console.log(`Expires: ${snapshot.expiresAt.toLocaleDateString()}`);
		console.log(`\nTo use this snapshot, set the environment variable:`);
		console.log(`  SANDBOX_SNAPSHOT_ID=${snapshot.snapshotId}`);

		return snapshot.snapshotId;
	} catch (error) {
		console.error("Error during snapshot creation:", error);
		// Sandbox auto-stops after snapshot(), but if we error before that, clean up
		await sandbox.stop().catch(() => {});
		throw error;
	}
}

createSnapshot()
	.then(() => {
		console.log(`\nDone! Shutting down sandbox.`);
		process.exit(0);
	})
	.catch((err) => {
		console.error("Failed to create snapshot:", err);
		process.exit(1);
	});
