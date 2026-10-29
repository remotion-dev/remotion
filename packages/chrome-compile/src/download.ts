import {createHash} from 'node:crypto';
import {
	createReadStream,
	existsSync,
	mkdirSync,
	renameSync,
	rmSync,
	statSync,
} from 'node:fs';
import path from 'node:path';
import manifest from '../artifacts.json';

const root = path.resolve(import.meta.dir, '..');
const args = process.argv.slice(2);
const {
	artifacts,
}: {
	artifacts: Record<string, {url: string; size: number; sha256: string}>;
} = manifest;

if (args.length === 1 && args[0] === '--list') {
	for (const [name, artifact] of Object.entries(artifacts)) {
		console.log(`${name} (${(artifact.size / 1024 / 1024).toFixed(1)} MiB)`);
	}

	process.exit(0);
}

const requested =
	args.length === 0
		? manifest.defaultArtifacts
		: args.length === 1 && args[0] === '--all'
			? Object.keys(artifacts)
			: args;

for (const name of requested) {
	if (!Object.hasOwn(artifacts, name)) {
		throw new Error(
			`Unknown artifact: ${name}. Run bun run download --list to see available paths.`,
		);
	}
}

const hashFile = async (file: string) => {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(file)) {
		hash.update(chunk);
	}

	return hash.digest('hex');
};

for (const name of requested) {
	const artifact = artifacts[name];
	const target = path.join(root, name);
	if (existsSync(target)) {
		if (
			statSync(target).size === artifact.size &&
			(await hashFile(target)) === artifact.sha256
		) {
			console.log(`Verified ${name}`);
			continue;
		}

		throw new Error(
			`${target} already exists with different contents. Move it before downloading to preserve your build.`,
		);
	}

	mkdirSync(path.dirname(target), {recursive: true});
	const temporary = `${target}.tmp-${process.pid}`;
	try {
		console.log(`Downloading ${name}`);
		const response = await fetch(artifact.url);
		if (!response.ok) {
			throw new Error(
				`Could not download ${artifact.url}: HTTP ${response.status}`,
			);
		}

		await Bun.write(temporary, response);
		if (
			statSync(temporary).size !== artifact.size ||
			(await hashFile(temporary)) !== artifact.sha256
		) {
			throw new Error(`Size or SHA-256 mismatch for ${artifact.url}`);
		}

		renameSync(temporary, target);
		console.log(`Verified ${name}`);
	} finally {
		rmSync(temporary, {force: true});
	}
}
