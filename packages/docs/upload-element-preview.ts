import {execFileSync} from 'child_process';
import path from 'path';
import {S3Client} from 'bun';
import {elementDefinitions} from './src/components/Elements/element-definitions';

const elementArguments = process.argv.filter((argument) =>
	argument.startsWith('--element='),
);
if (process.argv.includes('--element')) {
	throw new Error('Use --element=<category>/<slug>');
}

if (elementArguments.length !== 1) {
	throw new Error('Specify exactly one --element=<category>/<slug> argument');
}

const selectedElementSlug = elementArguments[0].slice('--element='.length);
const definition = Object.values(elementDefinitions).find(
	(candidate) => candidate.slug === selectedElementSlug,
);
if (!definition) {
	throw new Error(`Unknown Element: ${selectedElementSlug}`);
}

const assetSlug = definition.slug.replaceAll('/', '-');
const expectedPosterUrl = `/elements/${assetSlug}-preview.png` as const;
const expectedVideoUrl = `/elements/${assetSlug}-preview.mp4` as const;
if (
	definition.preview.posterUrl !== expectedPosterUrl ||
	definition.preview.videoUrl !== expectedVideoUrl
) {
	throw new Error(
		`${definition.slug} must use its local review URLs before it can be accepted`,
	);
}

const assets = [
	{
		contentType: 'image/png',
		filePath: path.join(process.cwd(), 'static', expectedPosterUrl.slice(1)),
		localUrl: expectedPosterUrl,
	},
	{
		contentType: 'video/mp4',
		filePath: path.join(process.cwd(), 'static', expectedVideoUrl.slice(1)),
		localUrl: expectedVideoUrl,
	},
] as const;

let totalSize = 0;
for (const asset of assets) {
	const gitStatus = execFileSync(
		'git',
		['status', '--short', '--', asset.filePath],
		{
			cwd: process.cwd(),
			encoding: 'utf8',
		},
	);
	if (gitStatus.trim() !== '') {
		throw new Error(
			`Approved preview asset must be committed and unmodified: ${asset.filePath}`,
		);
	}

	const file = Bun.file(asset.filePath, {type: asset.contentType});
	if (!(await file.exists())) {
		throw new Error(`Missing approved preview asset: ${asset.filePath}`);
	}

	totalSize += file.size;
	const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
	if (
		asset.contentType === 'image/png' &&
		(header.length < 8 ||
			header[0] !== 0x89 ||
			header[1] !== 0x50 ||
			header[2] !== 0x4e ||
			header[3] !== 0x47 ||
			header[4] !== 0x0d ||
			header[5] !== 0x0a ||
			header[6] !== 0x1a ||
			header[7] !== 0x0a)
	) {
		throw new Error(`Invalid PNG signature: ${asset.filePath}`);
	}

	if (
		asset.contentType === 'video/mp4' &&
		(header.length < 8 ||
			header[4] !== 0x66 ||
			header[5] !== 0x74 ||
			header[6] !== 0x79 ||
			header[7] !== 0x70)
	) {
		throw new Error(`Invalid MP4 signature: ${asset.filePath}`);
	}
}

const maxCombinedSize = 10 * 1024 * 1024;
if (totalSize > maxCombinedSize) {
	throw new Error(
		`Element previews total ${totalSize} bytes; the limit is ${maxCombinedSize} bytes`,
	);
}

if (!Bun.env.AWS_ACCESS_KEY_ID || !Bun.env.AWS_SECRET_ACCESS_KEY) {
	throw new Error(
		'Uploading requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
	);
}

const client = new S3Client({
	accessKeyId: Bun.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY,
	bucket: 'parser-media',
	endpoint: 'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com',
});

for (const asset of assets) {
	const file = Bun.file(asset.filePath, {type: asset.contentType});
	const key = asset.localUrl.slice(1);
	const publicUrl = `https://remotion.media${asset.localUrl}`;
	await client.write(key, file);

	const remote = await client.stat(key);
	if (remote.size !== file.size) {
		throw new Error(
			`Uploaded size mismatch for ${key}: expected ${file.size}, got ${remote.size}`,
		);
	}

	const response = await fetch(`${publicUrl}?verify=${Date.now()}`, {
		method: 'HEAD',
	});
	if (!response.ok) {
		throw new Error(`Could not verify ${publicUrl}: HTTP ${response.status}`);
	}

	const remoteContentType = response.headers.get('content-type');
	if (remoteContentType !== asset.contentType) {
		throw new Error(
			`Unexpected content type for ${publicUrl}: expected ${asset.contentType}, got ${remoteContentType}`,
		);
	}

	console.log(`Uploaded ${publicUrl} (${file.size} bytes)`);
}

console.log('Upload verified. Replace the review URLs with:');
console.log(`https://remotion.media${expectedPosterUrl}`);
console.log(`https://remotion.media${expectedVideoUrl}`);
console.log('Then delete the two files from packages/docs/static/elements.');
