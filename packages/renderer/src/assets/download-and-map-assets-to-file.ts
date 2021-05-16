import {createWriteStream, mkdirSync} from 'fs';
import got from 'got';
import path from 'path';
import crypto from 'crypto';
import {TAsset} from 'remotion';
import stream from 'stream';
import {promisify} from 'util';

const isDownloadingMap: {[key: string]: boolean} = {};
const hasBeenDownloadedMap: {[key: string]: boolean} = {};
const listeners: {[key: string]: (() => void)[]} = {};

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

const downloadAsset = async (
	src: string,
	to: string,
	onDownload: (src: string) => void
) => {
	if (hasBeenDownloadedMap[src]) {
		return;
	}

	if (isDownloadingMap[src]) {
		return waitForAssetToBeDownloaded(src);
	}

	isDownloadingMap[src] = true;
	onDownload(src);
	mkdirSync(path.resolve(to, '..'), {
		recursive: true,
	});
	await pipeline(got.stream(src), createWriteStream(to));
	notifyAssetIsDownloaded(src);
};

export const downloadAndMapAssetsToFileUrl = async ({
	localhostAsset,
	webpackBundle,
	onDownload,
}: {
	localhostAsset: TAsset;
	webpackBundle: string;
	onDownload: (src: string) => void;
}): Promise<TAsset> => {
	const {pathname, search} = new URL(localhostAsset.src);
	const hashedFileName =  crypto.createHash('sha1')
			.update(`${pathname}${search}`)
			.digest('base64')
			.substring(0, 10);
	const newSrc = path.join(webpackBundle, hashedFileName);
	if (localhostAsset.isRemote) {
		await downloadAsset(localhostAsset.src, newSrc, onDownload);
	}

	return {
		...localhostAsset,
		src: newSrc,
	};
};
