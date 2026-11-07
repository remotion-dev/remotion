import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const [directory, baseUrl, ...extra] = process.argv.slice(2);
if (
	!directory ||
	!baseUrl ||
	extra.length > 0 ||
	new URL(baseUrl).protocol !== 'https:'
) {
	throw new Error(
		'Usage: node import-artifacts.mjs <artifact-directory> <immutable-https-base-url>',
	);
}

const manifestPath = path.join(root, 'assets.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const bundle = JSON.parse(
	readFileSync(path.join(directory, 'MANIFEST.json'), 'utf8'),
);
if (!/^[a-f0-9]{40}$/.test(bundle.sourceSha)) {
	throw new Error(
		'The artifact manifest must identify a full source commit SHA',
	);
}

const targets = Object.keys(manifest.archives);
const names = Object.keys(bundle.archives).sort();
if (
	JSON.stringify(names) !==
	JSON.stringify(targets.map((target) => `${target}.gz`).sort())
) {
	throw new Error(
		'The artifact manifest must contain exactly the seven supported targets',
	);
}

// Validate the complete set and its durable download URLs before changing tracked files.
const archives = {};
const bindings = new Map();
for (const target of targets) {
	const name = `${target}.gz`;
	const archive = path.join(directory, name);
	const data = readFileSync(archive);
	const sha256 = createHash('sha256').update(data).digest('hex');
	if (
		data.length !== bundle.archives[name].bytes ||
		sha256 !== bundle.archives[name].sha256
	) {
		throw new Error(`Size or SHA-256 mismatch for ${name}`);
	}

	const binary = target === 'x86_64-pc-windows-gnu' ? 'ffmpeg.exe' : 'ffmpeg';
	execFileSync('tar', ['-tzf', archive, `remotion/bin/${binary}`]);
	bindings.set(
		target,
		execFileSync('tar', ['-xOf', archive, 'bindings.rs'], {
			maxBuffer: 10 * 1024 * 1024,
		}),
	);
	const url = `${baseUrl.replace(/\/$/, '')}/${name}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Could not verify ${url}: HTTP ${response.status}`);
	}

	const hosted = Buffer.from(await response.arrayBuffer());
	if (
		hosted.length !== data.length ||
		createHash('sha256').update(hosted).digest('hex') !== sha256
	) {
		throw new Error(`Hosted archive does not match ${name}`);
	}

	archives[target] = {url, size: data.length, sha256};
}

mkdirSync(path.join(root, 'sys/zips'), {recursive: true});
for (const target of targets) {
	copyFileSync(
		path.join(directory, `${target}.gz`),
		path.join(root, 'sys/zips', `${target}.gz`),
	);
	writeFileSync(
		path.join(root, 'sys/bindings', `${target}.rs`),
		bindings.get(target),
	);
}

manifest.archives = archives;
manifest.binarySource = {
	repository: 'https://github.com/remotion-dev/remotion',
	commit: bundle.sourceSha,
	githubActions: bundle.githubActions,
	circleCI: bundle.circleCI,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Imported all seven targets from ${bundle.sourceSha}`);
