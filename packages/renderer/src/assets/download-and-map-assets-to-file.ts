import {createWriteStream, mkdirSync} from 'fs';
import got from 'got';
import path from 'path';
import {TAsset} from 'remotion';
import stream from 'stream';
import {promisify} from 'util';

const isDownloadingMap: {[key: string]: boolean} = {};
const hasBeenDownloadedMap: {[key: string]: boolean} = {};
const listeners: {[key: string]: (() => void)[]} = {};

const isRemoteAsset = (asset: string, localPort: number) =>
	!asset.startsWith(`http://localhost:${localPort}`);

const pipeline = promisify(stream.pipeline);

const waitForAssetToBeDownloaded = (src: string) => {
	if (!listeners[src]) {
		listeners[src] = [];
	}
	return new Promise<void>((resolve) => {
		listeners[src].push(() => resolve());
	});
};

const notifyAssetIsDownloaded = (src: string) => {
	if (!listeners[src]) {
		listeners[src] = [];
	}
	listeners[src].forEach((fn) => fn());
	isDownloadingMap[src] = false;
	hasBeenDownloadedMap[src] = true;
};

const downloadAsset = async (src: string, to: string) => {
	if (hasBeenDownloadedMap[src]) {
		return;
	}
	if (isDownloadingMap[src]) {
		return waitForAssetToBeDownloaded(src);
	}
	isDownloadingMap[src] = true;
	// TODO: Leave logging to CLI
	console.log('\n');
	console.log('Downloading asset...', src);
	mkdirSync(path.resolve(to, '..'), {
		recursive: true,
	});
	await pipeline(got.stream(src), createWriteStream(to));
	notifyAssetIsDownloaded(src);
};

export const downloadAndMapAssetsToFileUrl = async ({
	localhostAsset,
	webpackBundle,
	localPort,
}: {
	localhostAsset: TAsset;
	webpackBundle: string;
	localPort: number;
}): Promise<TAsset> => {
	const {pathname} = new URL(localhostAsset.src);
	const newSrc = path.join(webpackBundle, pathname);
	if (isRemoteAsset(localhostAsset.src, localPort)) {
		await downloadAsset(localhostAsset.src, newSrc);
	}
	return {
		...localhostAsset,
		src: newSrc,
	};
};
