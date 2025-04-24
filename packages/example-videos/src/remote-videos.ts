/* eslint-disable no-console */
import {S3Client} from 'bun';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({
	path: path.join(__dirname, '..', '.env'),
});

export const remoteExampleVideos = {
	mp4av1:
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/mp4-av1.mp4',
	fragmentedMoofTrickyDuration:
		'https://remotion-video-submissions.s3.ap-northeast-1.amazonaws.com/6048e3e4-ffbb-43a5-b6b5-75643365646a',
	webmNoCodecPrivate:
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/webm-no-codecprivate.webm',
	tsKeyframes:
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/ts-keyframes.ts',
};

export const privateExampleVideos = {
	dispersedFrames: 'example-videos/dispersed-frames.mp4',
};

const rootDir = path.join(__dirname, '..');
const cacheDir = path.join(rootDir, 'node_modules', '.videos');

export const getRemoteExampleVideo = async (
	videoName: keyof typeof remoteExampleVideos,
) => {
	const {$} = await import('bun');
	const url = remoteExampleVideos[videoName];
	const name = new URL(url).pathname.split('/').pop() as string;
	const location = path.join(cacheDir, name);

	if (!fs.existsSync(location)) {
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir);
		}

		console.log('Downloading video', url);
		console.time(`Download ${url}`);
		await $`curl -o ${location} ${url}`;
		console.timeEnd(`Download ${url}`);
	}

	return location;
};

export const getPrivateExampleVideo = async (
	videoName: keyof typeof privateExampleVideos,
) => {
	if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
		return null;
	}

	const credentials = {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		endpoint: 'https://s3.eu-central-1.amazonaws.com',
		bucket: 'remotion-assets',
		region: 'eu-central-1',
	};
	const client = new S3Client(credentials);

	const location = path.join(cacheDir, privateExampleVideos[videoName]);
	const file = client.file(privateExampleVideos[videoName]);
	const stream = file.stream();
	const size = await client.size(privateExampleVideos[videoName], credentials);

	console.log(
		'Downloading video',
		privateExampleVideos[videoName],
		size,
		'bytes',
	);
	let content = new Uint8Array([]);
	let progress = 0;
	// @ts-expect-error
	for await (const chunk of stream) {
		content = new Uint8Array([...content, ...chunk]);
		progress += chunk.length;
		console.log(`Downloaded ${((progress / size) * 100).toFixed(2)}%`);
	}

	await Bun.write(location, content);

	return location;
};
