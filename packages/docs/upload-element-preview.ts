import {execFileSync} from 'child_process';
import path from 'path';
import {S3Client} from 'bun';
import {elementDefinitions} from './src/components/Elements/element-definitions';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
	console.log(`Usage:
  bun run upload-element-preview --element=<category>/<slug> --source=render
  bun run upload-element-preview --element=<category>/<slug> --source=submission

Use render to upload files from .element-previews. Use submission to upload committed files from static/elements. The command prints the hosted URLs and any cleanup required after a verified upload.`);
	process.exit(0);
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
		`${definition.slug} must use its local review URLs before its previews can be uploaded`,
	);
}

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
		localUrl: expectedPosterUrl,
	},
	{
		contentType: 'video/mp4',
		filePath: path.join(
			sourceDirectory,
			source === 'render' ? 'preview.mp4' : `${assetSlug}-preview.mp4`,
		),
		localUrl: expectedVideoUrl,
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

if (!Bun.env.CLOUDFLARE_API_TOKEN || !Bun.env.CLOUDFLARE_ZONE_ID) {
	throw new Error(
		'Clearing the CDN cache requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in packages/docs/.env.',
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

const purgeResponse = await fetch(
	`https://api.cloudflare.com/client/v4/zones/${Bun.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
	{
		method: 'POST',
		headers: {
			Authorization: `Bearer ${Bun.env.CLOUDFLARE_API_TOKEN}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			files: assets.map((asset) => `https://remotion.media${asset.localUrl}`),
		}),
	},
);
const purgeResult = (await purgeResponse.json()) as {
	success: boolean;
	errors?: unknown;
};
if (!purgeResponse.ok || !purgeResult.success) {
	throw new Error(
		`Could not clear the CDN cache: HTTP ${purgeResponse.status} ${JSON.stringify(purgeResult.errors)}`,
	);
}

console.log('Cleared the CDN cache for both preview URLs.');
console.log('Upload verified. Replace the review URLs with:');
console.log(`https://remotion.media${expectedPosterUrl}`);
console.log(`https://remotion.media${expectedVideoUrl}`);
if (source === 'submission') {
	console.log('Then delete the two files from packages/docs/static/elements.');
} else {
	console.log('Keep the ignored .element-previews files out of Git.');
}
