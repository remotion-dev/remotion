import console from 'node:console';
import {
	link,
	lstat,
	mkdir,
	readdir,
	readlink,
	stat,
	unlink,
} from 'node:fs/promises';
import {homedir} from 'node:os';
import path from 'node:path';
import process from 'node:process';

const mediaDirectory =
	process.argv[2] ?? path.join(homedir(), 'Movies', 'Disco-Setup-Review');
const publicDirectory = path.resolve(
	import.meta.dir,
	'../../../public/setup-review',
);
await mkdir(publicDirectory, {recursive: true});
const files = ['long-take-preview.mp4', 'short-take-preview.mp4'];
try {
	const closeups = await readdir(path.join(mediaDirectory, 'closeups'));
	files.push(
		...closeups
			.filter((name) => /^IMG_\d+-preview\.mp4$/.test(name))
			.map((name) => path.join('closeups', name)),
	);
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}
for (const filename of files) {
	const target = path.join(mediaDirectory, filename);
	const destination = path.join(publicDirectory, filename);
	await mkdir(path.dirname(destination), {recursive: true});
	const source = await stat(target);
	let existing = null;
	try {
		existing = await lstat(destination);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	if (existing?.isSymbolicLink()) {
		if ((await readlink(destination)) !== target)
			throw new Error(`Unexpected link at ${destination}`);
		await unlink(destination);
		existing = null;
	}
	if (
		existing &&
		(existing.dev !== source.dev || existing.ino !== source.ino)
	) {
		throw new Error(`A different file already exists at ${destination}`);
	}
	if (!existing) await link(target, destination);
	console.log(`${filename} → ${target}`);
}
