import {execFileSync} from 'child_process';
import {randomUUID} from 'crypto';
import path from 'path';
import {S3Client} from 'bun';
import {elementDefinitions} from './src/components/Elements/element-definitions';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
	console.log(`Usage:
  bun run upload-element-preview --element=<category>/<slug> --source=render
  bun run upload-element-preview --element=<category>/<slug> --source=submission

Use render to upload files from .element-previews. Use submission to upload committed files from static/elements. The Element definition must use either its exact local /elements/... review URLs or a matching pair of its existing remotion.media URLs. Each upload gets a unique URL so previews from concurrent branches cannot overwrite each other. The command prints the hosted URLs and any cleanup required after a verified upload.`);
	process.exit(0);
}

if (process.argv.includes('--overwrite')) {
	throw new Error(
		'--overwrite is no longer supported. Each upload now gets a unique URL.',
	);
}

const elementArguments = process.argv.filter((argument) =>
	argument.startsWith('--element='),
);
const sourceArguments = process.argv.filter((argument) =>
	argument.startsWith('--source='),
);
if (process.argv.includes('--element')) {
	throw new Error('Use --element=<category>/<slug>');
}

if (process.argv.includes('--source')) {
	throw new Error('Use --source=render or --source=submission');
}

if (elementArguments.length !== 1) {
	throw new Error('Specify exactly one --element=<category>/<slug> argument');
}

if (sourceArguments.length !== 1) {
	throw new Error('Specify exactly one --source=render|submission argument');
}

const source = sourceArguments[0].slice('--source='.length);
if (source !== 'render' && source !== 'submission') {
	throw new Error(`Invalid preview source: ${source}`);
}

const selectedElementSlug = elementArguments[0].slice('--element='.length);
const definition = elementDefinitions.find(
	(candidate) => candidate.slug === selectedElementSlug,
);
if (!definition) {
	throw new Error(`Unknown Element: ${selectedElementSlug}`);
}

const assetSlug = definition.slug.replaceAll('/', '-');
const expectedPosterUrl = `/elements/${assetSlug}-preview.png` as const;
const expectedVideoUrl = `/elements/${assetSlug}-preview.mp4` as const;
const hostedPosterUrlPattern = new RegExp(
	`^https://remotion\\.media/elements/${assetSlug}-preview(?:-([a-f0-9-]+))?\\.png$`,
);
const hostedVideoUrlPattern = new RegExp(
	`^https://remotion\\.media/elements/${assetSlug}-preview(?:-([a-f0-9-]+))?\\.mp4$`,
);
const hostedPosterUrlMatch = definition.preview.posterUrl.match(
	hostedPosterUrlPattern,
);
const hostedVideoUrlMatch = definition.preview.videoUrl.match(
	hostedVideoUrlPattern,
);
const usesLocalReviewUrls =
	definition.preview.posterUrl === expectedPosterUrl &&
	definition.preview.videoUrl === expectedVideoUrl;
const usesMatchingHostedPreviewUrls =
	hostedPosterUrlMatch !== null &&
	hostedVideoUrlMatch !== null &&
	hostedPosterUrlMatch[1] === hostedVideoUrlMatch[1];
if (!usesLocalReviewUrls && !usesMatchingHostedPreviewUrls) {
	throw new Error(
		`${definition.slug} must use either its exact local review URLs (${expectedPosterUrl} and ${expectedVideoUrl}) or a matching pair of its existing remotion.media preview URLs.`,
	);
}

const previewPostfix = randomUUID();
const hostedPosterUrl =
	`https://remotion.media/elements/${assetSlug}-preview-${previewPostfix}.png` as const;
const hostedVideoUrl =
	`https://remotion.media/elements/${assetSlug}-preview-${previewPostfix}.mp4` as const;

const sourceDirectory =
	source === 'render'
		? path.join(process.cwd(), '.element-previews', definition.slug)
		: path.join(process.cwd(), 'static', 'elements');
const assets = [
	{
		contentType: 'image/png',
		filePath: path.join(
			sourceDirectory,
			source === 'render' ? 'preview.png' : `${assetSlug}-preview.png`,
		),
		publicUrl: hostedPosterUrl,
	},
	{
		contentType: 'video/mp4',
		filePath: path.join(
			sourceDirectory,
			source === 'render' ? 'preview.mp4' : `${assetSlug}-preview.mp4`,
		),
		publicUrl: hostedVideoUrl,
	},
] as const;

let totalSize = 0;
for (const asset of assets) {
	if (source === 'submission') {
		try {
			execFileSync(
				'git',
				['ls-files', '--error-unmatch', '--', asset.filePath],
				{
					cwd: process.cwd(),
					stdio: 'ignore',
				},
			);
		} catch {
			throw new Error(
				`Submitted preview asset must be committed: ${asset.filePath}`,
			);
		}

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
				`Submitted preview asset must be unmodified: ${asset.filePath}`,
			);
		}
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
		'Uploading requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. Run this command from packages/docs so Bun loads packages/docs/.env.',
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
	const publicUrl = asset.publicUrl;
	const key = new URL(publicUrl).pathname.slice(1);
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

console.log('Upload verified. Replace image, posterUrl, and videoUrl with:');
console.log(hostedPosterUrl);
console.log(hostedVideoUrl);
if (source === 'submission') {
	console.log('Then delete the two files from packages/docs/static/elements.');
} else {
	console.log('Keep the ignored .element-previews files out of Git.');
}
