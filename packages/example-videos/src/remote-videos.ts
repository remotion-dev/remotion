/* eslint-disable no-console */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({
	path: path.join(__dirname, '..', '.env'),
});

export const remoteExampleVideos = {
	mp4av1: 'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/mp4-av1.mp4',
	fragmentedMoofTrickyDuration:
		'https://remotion-video-submissions.s3.ap-northeast-1.amazonaws.com/6048e3e4-ffbb-43a5-b6b5-75643365646a',
	webmNoCodecPrivate:
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/webm-no-codecprivate.webm',
	tsKeyframes:
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/ts-keyframes.ts',
	largeStsd:
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/large-stsd.mp4',
	videoWithEditList:
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/video-with-editlist.mp4',
	veryDispersed:
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/very-dispersed.mp4',
	vp9InMp4:
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/vp9-in-mp4.mp4',
	multichannelAudio: 'https://remotion.media/multiple-audio-streams.mov',
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

	const location = path.join(cacheDir, privateExampleVideos[videoName]);

	if (fs.existsSync(location)) {
		return location;
	}

	const credentials = {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		endpoint: 'https://remotion-assets.s3-accelerate.amazonaws.com',
		bucket: 'remotion-assets',
		region: 'eu-central-1',
		useAccelerateEndpoint: true,
	};

	const {S3Client} = await import('bun');

	const client = new S3Client(credentials);

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
