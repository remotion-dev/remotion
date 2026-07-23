import {mkdirSync, rmSync} from 'fs';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill} from '@remotion/renderer';
import {S3Client} from 'bun';
import {elementDefinitions} from './src/components/Elements/element-definitions';
import {
	getElementCompositionId,
	getElementPreviewUrls,
} from './src/components/Elements/element-utils';

const r2Endpoint =
	'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com';
const r2Bucket = 'parser-media';
const upload = process.argv.includes('--upload');
const outputDirectoryArgument = process.argv.find((argument) =>
	argument.startsWith('--output-dir='),
);
const outputDirectory = outputDirectoryArgument
	? path.resolve(outputDirectoryArgument.slice('--output-dir='.length))
	: path.join(process.cwd(), '.element-previews');

const ensureUploadCredentials = () => {
	if (!Bun.env.AWS_ACCESS_KEY_ID || !Bun.env.AWS_SECRET_ACCESS_KEY) {
		throw new Error(
			'--upload requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
		);
	}

	return {
		accessKeyId: Bun.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY,
	};
};

const uploadAsset = async ({
	client,
	contentType,
	filePath,
	key,
	publicUrl,
}: {
	client: S3Client;
	contentType: string;
	filePath: string;
	key: string;
	publicUrl: string;
}) => {
	const file = Bun.file(filePath, {type: contentType});
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
	if (remoteContentType !== contentType) {
		throw new Error(
			`Unexpected content type for ${publicUrl}: expected ${contentType}, got ${remoteContentType}`,
		);
	}

	console.log(`Uploaded ${publicUrl} (${file.size} bytes)`);
};

const credentials = upload ? ensureUploadCredentials() : null;
const client = credentials
	? new S3Client({
			...credentials,
			bucket: r2Bucket,
			endpoint: r2Endpoint,
		})
	: null;

rmSync(outputDirectory, {force: true, recursive: true});
mkdirSync(outputDirectory, {recursive: true});

const serveUrl = await bundle({
	entryPoint: path.join(process.cwd(), 'src', 'remotion', 'entry.ts'),
	publicDir: path.join(process.cwd(), 'static'),
});
const compositions = await getCompositions({
	serveUrl,
	inputProps: {},
});
const elementCompositions = compositions.filter((composition) =>
	composition.id.startsWith('element-'),
);

const expectedCompositionIds = new Set(
	Object.values(elementDefinitions).map((definition) =>
		getElementCompositionId(definition.slug),
	),
);
const actualCompositionIds = new Set(
	elementCompositions.map((composition) => composition.id),
);

for (const expectedId of expectedCompositionIds) {
	if (!actualCompositionIds.has(expectedId)) {
		throw new Error(`Missing Element composition: ${expectedId}`);
	}
}

for (const actualId of actualCompositionIds) {
	if (!expectedCompositionIds.has(actualId)) {
		throw new Error(`Unexpected Element composition: ${actualId}`);
	}
}

for (const definition of Object.values(elementDefinitions)) {
	const compositionId = getElementCompositionId(definition.slug);
	const composition = elementCompositions.find(
		(candidate) => candidate.id === compositionId,
	);
	if (!composition) {
		throw new Error(`Could not find composition ${compositionId}`);
	}

	const elementOutputDirectory = path.join(
		outputDirectory,
		...definition.slug.split('/'),
	);
	mkdirSync(elementOutputDirectory, {recursive: true});
	const pngPath = path.join(elementOutputDirectory, 'preview.png');
	const videoExtension = definition.transparentPreview ? 'webm' : 'mp4';
	const videoPath = path.join(
		elementOutputDirectory,
		`preview.${videoExtension}`,
	);

	console.log(`Rendering ${definition.displayName} poster`);
	await renderStill({
		chromiumOptions: {gl: 'angle'},
		composition,
		frame: definition.posterFrame,
		output: pngPath,
		serveUrl,
	});

	console.log(`Rendering ${definition.displayName} video`);
	await renderMedia({
		chromiumOptions: {gl: 'angle'},
		codec: definition.transparentPreview ? 'vp8' : 'h264',
		composition,
		crf: 23,
		imageFormat: 'png',
		muted: true,
		outputLocation: videoPath,
		pixelFormat: definition.transparentPreview ? 'yuva420p' : 'yuv420p',
		serveUrl,
	});

	console.log(`Rendered ${pngPath}`);
	console.log(`Rendered ${videoPath}`);

	if (client) {
		const urls = getElementPreviewUrls(definition);
		const baseKey = `elements/${definition.slug}`;
		await uploadAsset({
			client,
			contentType: 'image/png',
			filePath: pngPath,
			key: `${baseKey}/preview.png`,
			publicUrl: urls.png,
		});
		await uploadAsset({
			client,
			contentType: definition.transparentPreview ? 'video/webm' : 'video/mp4',
			filePath: videoPath,
			key: `${baseKey}/preview.${videoExtension}`,
			publicUrl: urls.video,
		});
	}
}

console.log(
	upload
		? 'Rendered and uploaded all Element previews.'
		: `Rendered all Element previews to ${outputDirectory}.`,
);
