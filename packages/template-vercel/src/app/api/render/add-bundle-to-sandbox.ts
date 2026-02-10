import path from "path";
import { ensureLocalBundle, getRemotionBundleFiles } from "./helpers";
import { BUILD_DIR } from "../../../../build-dir.mjs";
import { Sandbox } from "@vercel/sandbox";

export const addBundleToSandbox = async (
	sandbox: Sandbox & AsyncDisposable,
) => {
	await ensureLocalBundle();
	const bundleFiles = await getRemotionBundleFiles();

	const dirs = new Set<string>();
	for (const file of bundleFiles) {
		const dir = path.dirname(file.path);
		if (dir && dir !== ".") {
			dirs.add(dir);
		}
	}

	for (const dir of Array.from(dirs).sort()) {
		await sandbox.mkDir(BUILD_DIR + "/" + dir);
	}

	await sandbox.writeFiles(
		bundleFiles.map((file) => ({
			path: BUILD_DIR + "/" + file.path,
			content: file.content,
		})),
	);
};
