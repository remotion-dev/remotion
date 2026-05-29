/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

const REMOTE_BASE = 'https://remotion.media';

const rootDir = path.join(__dirname, '..');
const cachedDir = path.join(rootDir, 'node_modules', '.videos');

const cachedExampleMedia = {
	bigBuckBunny: 'bigbuckbunny.mp4',
	corrupted: 'corrupted.mp4',
	variablefps: 'variablefps.webm',
	iphonevideo: 'iphonevideo.mov',
	music: 'music.mp3',
	iphonehevc: 'iphone-hevc.mov',
	stretchedVp8: 'stretched-vp8.webm',
} as const;

type CachedKey = keyof typeof cachedExampleMedia;

export const cachedExampleMediaPaths = Object.fromEntries(
	(Object.keys(cachedExampleMedia) as CachedKey[]).map((key) => [
		key,
		path.join(cachedDir, cachedExampleMedia[key]),
	]),
) as {[K in CachedKey]: string};

const downloadFile = async (url: string, location: string) => {
	if (fs.existsSync(location)) {
		return;
	}

	if (!fs.existsSync(cachedDir)) {
		fs.mkdirSync(cachedDir, {recursive: true});
	}

	const {$} = await import('bun');
	console.log('Downloading', url);
	console.time(`Download ${url}`);
	await $`curl -f -o ${location} ${url}`;
	console.timeEnd(`Download ${url}`);
};

export const downloadCachedExampleMedia = async () => {
	for (const filename of Object.values(cachedExampleMedia)) {
		await downloadFile(
			`${REMOTE_BASE}/${filename}`,
			path.join(cachedDir, filename),
		);
	}
};
