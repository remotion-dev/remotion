import {createWriteStream, mkdirSync} from 'fs';
import got from 'got';
import path from 'path';
import {random, TAsset} from 'remotion';
import sanitizeFilename from 'sanitize-filename';
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

export const markAllAssetsAsDownloaded = () => {
	Object.keys(hasBeenDownloadedMap).forEach((key) => {
		delete hasBeenDownloadedMap[key];
	});

	Object.keys(isDownloadingMap).forEach((key) => {
		delete isDownloadingMap[key];
	});
};

export const getSanitizedFilenameForAssetUrl = ({
	src,
	isRemote,
	webpackBundle,
}: {
	src: string;
	isRemote: boolean;
	webpackBundle: string;
}) => {
	const {pathname, search} = new URL(src);

	if (!isRemote) {
		return path.join(webpackBundle, sanitizeFilename(pathname));
	}

	const split = pathname.split('.');
	const fileExtension =
		split.length > 1 && split[split.length - 1]
			? `.${split[split.length - 1]}`
			: '';
	const hashedFileName = String(random(`${pathname}${search}`)).replace(
		'0.',
		''
	);
	return path.join(
		webpackBundle,
		sanitizeFilename(hashedFileName + fileExtension)
	);
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
	const newSrc = getSanitizedFilenameForAssetUrl({
		src: localhostAsset.src,
		isRemote: localhostAsset.isRemote,
		webpackBundle,
	});

	if (localhostAsset.isRemote) {
		await downloadAsset(localhostAsset.src, newSrc, onDownload);
	}

	return {
		...localhostAsset,
		src: newSrc,
	};
};
