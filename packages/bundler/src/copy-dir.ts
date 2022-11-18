import fs from 'fs';
import path from 'path';

export async function copyDir({
	src,
	dest,
	onSymlinkDetected,
}: {
	src: string;
	dest: string;
	onSymlinkDetected: (entry: fs.Dirent, dir: string) => void;
}) {
	await fs.promises.mkdir(dest, {recursive: true});
	const entries = await fs.promises.readdir(src, {withFileTypes: true});

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir({src: srcPath, dest: destPath, onSymlinkDetected});
		} else if (entry.isSymbolicLink()) {
			const realpath = await fs.promises.realpath(srcPath);
			onSymlinkDetected(entry, src);
			await fs.promises.symlink(realpath, destPath);
		} else {
			await fs.promises.copyFile(srcPath, destPath);
		}
	}
}
