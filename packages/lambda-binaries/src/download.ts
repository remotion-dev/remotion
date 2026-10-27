import {createHash} from 'node:crypto';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	renameSync,
	rmSync,
} from 'node:fs';
import path from 'node:path';
import {$} from 'bun';
import manifest from '../binaries.json';

const root = path.resolve(import.meta.dir, '..');
const requested = process.argv.slice(2);
const layers = Object.entries(manifest.layers).filter(([name]) => {
	return requested.length === 0 || requested.includes(name);
});

for (const name of requested) {
	if (!Object.hasOwn(manifest.layers, name)) {
		throw new Error(`Unknown layer: ${name}`);
	}
}

const cache = path.join(root, '.cache', `v${manifest.version}`);
const output = path.join(root, 'layers');
mkdirSync(cache, {recursive: true});
mkdirSync(output, {recursive: true});

for (const [name, {sha256, size}] of layers) {
	const target = path.join(output, name);
	if (existsSync(target)) {
		console.log(
			`Keeping ${target}. Remove this directory to download it again.`,
		);
		continue;
	}

	const filename = `remotion-layer-${name}-v${manifest.version}-arm64.zip`;
	const archive = path.join(cache, filename);
	let valid = false;
	if (existsSync(archive)) {
		const file = Bun.file(archive);
		valid =
			file.size === size &&
			createHash('sha256')
				.update(new Uint8Array(await file.arrayBuffer()))
				.digest('hex') === sha256;
	}

	if (!valid) {
		const url = `${manifest.baseUrl}/${filename}`;
		console.log(`Downloading ${url}`);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Could not download ${url}: HTTP ${response.status}`);
		}

		const temporaryArchive = `${archive}.tmp`;
		try {
			await Bun.write(temporaryArchive, response);
			const file = Bun.file(temporaryArchive);
			const checksum = createHash('sha256')
				.update(new Uint8Array(await file.arrayBuffer()))
				.digest('hex');
			if (file.size !== size || checksum !== sha256) {
				throw new Error(`Size or SHA-256 mismatch for ${url}`);
			}

			renameSync(temporaryArchive, archive);
		} finally {
			rmSync(temporaryArchive, {force: true});
		}
	}

	const staging = mkdtempSync(path.join(output, `.${name}-`));
	try {
		await $`unzip -q ${archive} -d ${staging}`;
		if (name === 'fonts') {
			copyFileSync(
				path.join(root, 'fonts.conf'),
				path.join(staging, 'fonts.conf'),
			);
		}

		renameSync(staging, target);
	} finally {
		rmSync(staging, {recursive: true, force: true});
	}

	console.log(`Prepared ${target}`);
}
