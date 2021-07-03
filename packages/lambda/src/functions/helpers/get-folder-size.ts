import fs from 'fs';
import path from 'path';

export function getFolderSizeRecursively(folder: string) {
	let size = 0;
	const files = fs.readdirSync(folder);
	files.forEach((file) => {
		const full = path.join(folder, file);
		if (fs.statSync(full).isDirectory()) {
			size += getFolderSizeRecursively(full);
		} else {
			size += fs.statSync(full).size;
		}
	});
	return size;
}
