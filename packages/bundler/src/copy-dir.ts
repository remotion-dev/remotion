import fs from 'node:fs';
import path from 'node:path';

export async function copyDir({
	src,
	dest,
	onSymlinkDetected,
	onProgress,
	copied = 0,
	lastReportedProgress = 0,
}: {
	src: string;
	dest: string;
	onSymlinkDetected: (entry: fs.Dirent, dir: string) => void;
	onProgress: (bytes: number) => void;
	copied: number;
	lastReportedProgress: number;
}) {
	await fs.promises.mkdir(dest, {recursive: true});
	const entries = await fs.promises.readdir(src, {withFileTypes: true});

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir({
				src: srcPath,
				dest: destPath,
				onSymlinkDetected,
				onProgress,
				copied,
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
			copied += size;
			if (copied - lastReportedProgress > 1024 * 1024 * 10) {
				onProgress(copied);
				lastReportedProgress = copied;
			}
		}
	}
}
