import {createHash} from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Shared by the compositor build and the source-build preparation command.
export const downloadAssets = async (group, requested) => {
	const manifest = JSON.parse(
		readFileSync(path.join(root, 'assets.json'), 'utf8'),
	);
	if (!['archives', 'buildInputs'].includes(group)) {
		throw new Error(`Unknown asset group: ${group}`);
	}

	const entries = manifest[group];
	const names = requested.length === 0 ? Object.keys(entries) : requested;
	for (const name of names) {
		if (!Object.hasOwn(entries, name)) {
			throw new Error(`Unknown ${group} asset: ${name}`);
		}
	}

	for (const name of names) {
		const {url, size, sha256} = entries[name];
		const destination = path.join(
			root,
			group === 'archives' ? `sys/zips/${name}.gz` : `build/${name}`,
		);
		if (existsSync(destination)) {
			const data = readFileSync(destination);
			if (
				data.length === size &&
				createHash('sha256').update(data).digest('hex') === sha256
			) {
				continue;
			}
		}

		console.log(`Downloading ${url}`);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Could not download ${url}: HTTP ${response.status}`);
		}

		const data = Buffer.from(await response.arrayBuffer());
		if (
			data.length !== size ||
			createHash('sha256').update(data).digest('hex') !== sha256
		) {
			throw new Error(`Size or SHA-256 mismatch for ${url}`);
		}

		mkdirSync(path.dirname(destination), {recursive: true});
		const temporary = `${destination}.${process.pid}.tmp`;
		try {
			writeFileSync(temporary, data);
			renameSync(temporary, destination);
		} finally {
			rmSync(temporary, {force: true});
		}
	}
};

if (
	process.argv[1] &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	const [group = 'archives', ...requested] = process.argv.slice(2);
	await downloadAssets(group, requested);
}
