import {readdir, readFile} from 'fs/promises';
import path from 'path';
import type {Sandbox} from '@vercel/sandbox';
import {
	getAncestorDirectories,
	REMOTION_SANDBOX_BUNDLE_DIR,
	toPosixPath,
	toSandboxBundlePath,
} from './internals/add-bundle';
import {rethrowSandboxError} from './internals/format-sandbox-error';

const resolveBundleDirectory = (bundleDir: string): string => {
	return path.resolve(bundleDir);
};

async function getRemotionBundleFiles(
	bundleDir: string,
): Promise<{path: string; content: Buffer}[]> {
	const fullBundleDir = resolveBundleDirectory(bundleDir);

	const files: {path: string; content: Buffer}[] = [];

	async function readDirRecursive(dir: string, basePath: string = '') {
		const entries = await readdir(dir, {withFileTypes: true});
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			const relativePath = path.join(basePath, entry.name);
			if (entry.isDirectory()) {
				await readDirRecursive(fullPath, relativePath);
			} else {
				const content = await readFile(fullPath);
				files.push({path: toPosixPath(relativePath), content});
			}
		}
	}

	await readDirRecursive(fullBundleDir);
	return files;
}

const collectBundleDirectories = (
	bundleFiles: {path: string; content: Buffer}[],
): string[] => {
	const dirs = new Set<string>();

	for (const file of bundleFiles) {
		for (const dir of getAncestorDirectories(file.path)) {
			dirs.add(dir);
		}
	}

	return Array.from(dirs).sort();
};

export async function addBundleToSandbox({
	sandbox,
	bundleDir,
}: {
	sandbox: Sandbox;
	bundleDir: string;
}): Promise<void> {
	const bundleFiles = await getRemotionBundleFiles(bundleDir);
	const directories = collectBundleDirectories(bundleFiles);

	for (const dir of directories) {
		const sandboxPath = toSandboxBundlePath(dir);
		try {
			await sandbox.mkDir(sandboxPath);
		} catch (error) {
			rethrowSandboxError({
				error,
				operation: `create directory "${dir}"`,
				sandboxPath,
			});
		}
	}

	try {
		await sandbox.writeFiles(
			bundleFiles.map((file) => ({
				path: toSandboxBundlePath(file.path),
				content: file.content,
			})),
		);
	} catch (error) {
		rethrowSandboxError({
			error,
			operation: `upload ${bundleFiles.length} bundle file(s) to "${REMOTION_SANDBOX_BUNDLE_DIR}"`,
		});
	}
}
