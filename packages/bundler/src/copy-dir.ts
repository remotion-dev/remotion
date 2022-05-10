import fs from 'fs';
import path from 'path';

export async function copyDir(src: string, dest: string) {
	await fs.promises.mkdir(dest, {recursive: true});
	const entries = await fs.promises.readdir(src, {withFileTypes: true});

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath);
		} else {
			await fs.promises.copyFile(srcPath, destPath);
		}
	}
}
