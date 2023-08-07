import fs from 'node:fs';
import path from 'node:path';

export async function copyDir({
	src,
	dest,
	onSymlinkDetected,
	onProgress,
	copiedBytes = 0,
	lastReportedProgress = 0,
}: {
	src: string;
	dest: string;
	onSymlinkDetected: (entry: fs.Dirent, dir: string) => void;
	onProgress: (bytes: number) => void;
	copiedBytes: number;
	lastReportedProgress: number;
}) {
	await fs.promises.mkdir(dest, {recursive: true});
	const entries = await fs.promises.readdir(src, {withFileTypes: true});

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copiedBytes = await copyDir({
				src: srcPath,
				dest: destPath,
				onSymlinkDetected,
				onProgress,
				copiedBytes,
				lastReportedProgress,
			});
		} else if (entry.isSymbolicLink()) {
			const realpath = await fs.promises.realpath(srcPath);
			onSymlinkDetected(entry, src);
			await fs.promises.symlink(realpath, destPath);
		} else {
			const [, {size}] = await Promise.all([
				fs.promises.copyFile(srcPath, destPath),
				fs.promises.stat(srcPath),
			]);

			copiedBytes += size;

			if (copiedBytes - lastReportedProgress > 1024 * 1024 * 10) {
				onProgress(copiedBytes);
				lastReportedProgress = copiedBytes;
			}
		}
	}

	return copiedBytes;
}
