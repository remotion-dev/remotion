import fs from 'fs';
import path from 'path';

export function getFolderFiles(folder: string) {
	const files = fs.readdirSync(folder);
	const paths: string[] = [];
	files.forEach((file) => {
		const full = path.join(folder, file);
		if (fs.statSync(full).isDirectory()) {
			paths.push(...getFolderFiles(full));
		} else {
			paths.push(full);
		}
	});
	return paths;
}
