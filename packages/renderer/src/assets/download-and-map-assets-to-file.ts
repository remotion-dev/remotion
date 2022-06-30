import fs from 'fs';
import path from 'path';
import type {TAsset} from 'remotion';
import {Internals, random} from 'remotion';
import {ensureOutputDirectory} from '../ensure-output-directory';
import {downloadFile} from './download-file';
import {sanitizeFilePath} from './sanitize-filepath';

export type RenderMediaOnDownload = (
	src: string
) => ((progress: {percent: number}) => void) | undefined | void;

const isDownloadingMap: {[src: string]: {[to: string]: boolean} | undefined} =
	{};
const hasBeenDownloadedMap: {
	[src: string]: {[to: string]: boolean} | undefined;
} = {};
const listeners: {[key: string]: {[to: string]: (() => void)[]}} = {};

export const waitForAssetToBeDownloaded = (
	src: string,
	to: string
): Promise<void> => {
	if (hasBeenDownloadedMap[src]?.[to]) {
		return Promise.resolve();
	}

	if (!listeners[src]) {
		listeners[src] = {};
	}

	if (!listeners[src][to]) {
		listeners[src][to] = [];
	}

	return new Promise<void>((resolve) => {
		listeners[src][to].push(() => resolve());
	});
};

const notifyAssetIsDownloaded = (src: string, to: string) => {
	if (!listeners[src]) {
		listeners[src] = {};
	}

	if (!listeners[src][to]) {
		listeners[src][to] = [];
	}

	listeners[src][to].forEach((fn) => fn());

	if (!isDownloadingMap[src]) {
		isDownloadingMap[src] = {};
	}

	(
		isDownloadingMap[src] as {
			[to: string]: boolean;
		}
	)[to] = false;

	if (!hasBeenDownloadedMap[src]) {
		hasBeenDownloadedMap[src] = {};
	}

	(
		hasBeenDownloadedMap[src] as {
			[to: string]: boolean;
		}
	)[to] = true;
};

const validateMimeType = (mimeType: string, src: string) => {
	if (!mimeType.includes('/')) {
		const errMessage = [
			'A data URL was passed but did not have the correct format so that Remotion could convert it for the video to be rendered.',
			'The format of the data URL must be `data:[mime-type];[encoding],[data]`.',
			'The `mime-type` parameter must be a valid mime type.',
			'The data that was received is (truncated to 100 characters):',
			src.substr(0, 100),
		].join(' ');
		throw new TypeError(errMessage);
	}
};

function validateBufferEncoding(
	potentialEncoding: string,
	dataUrl: string
): asserts potentialEncoding is BufferEncoding {
	const asserted = potentialEncoding as BufferEncoding;
	const validEncodings: BufferEncoding[] = [
		'ascii',
		'base64',
		'base64url',
		'binary',
		'hex',
		'latin1',
		'ucs-2',
		'ucs2',
		'utf-8',
		'utf16le',
		'utf8',
	];
	if (!validEncodings.find((en) => asserted === en)) {
		const errMessage = [
			'A data URL was passed but did not have the correct format so that Remotion could convert it for the video to be rendered.',
			'The format of the data URL must be `data:[mime-type];[encoding],[data]`.',
			'The `encoding` parameter must be one of the following:',
			`${validEncodings.join(' ')}.`,
			'The data that was received is (truncated to 100 characters):',
			dataUrl.substr(0, 100),
		].join(' ');
		throw new TypeError(errMessage);
	}
}

const downloadAsset = async (
	src: string,
	to: string,
	onDownload: RenderMediaOnDownload
) => {
	if (hasBeenDownloadedMap[src]?.[to]) {
		return;
	}

	if (isDownloadingMap[src]?.[to]) {
		return waitForAssetToBeDownloaded(src, to);
	}

	if (!isDownloadingMap[src]) {
		isDownloadingMap[src] = {};
	}

	(
		isDownloadingMap[src] as {
			[to: string]: boolean;
		}
	)[to] = true;

	const onProgress = onDownload(src);
	ensureOutputDirectory(to);

	if (src.startsWith('data:')) {
		const [assetDetails, assetData] = src.substring('data:'.length).split(',');
		if (!assetDetails.includes(';')) {
			const errMessage = [
				'A data URL was passed but did not have the correct format so that Remotion could convert it for the video to be rendered.',
				'The format of the data URL must be `data:[mime-type];[encoding],[data]`.',
				'The data that was received is (truncated to 100 characters):',
				src.substring(0, 100),
			].join(' ');
			throw new TypeError(errMessage);
		}

		const [mimeType, encoding] = assetDetails.split(';');

		validateMimeType(mimeType, src);
		validateBufferEncoding(encoding, src);

		const buff = Buffer.from(assetData, encoding);
		await fs.promises.writeFile(to, buff);
		notifyAssetIsDownloaded(src, to);
		return;
	}

	await downloadFile(src, to, ({progress}) => {
		onProgress?.({
			percent: progress,
		});
	});
	notifyAssetIsDownloaded(src, to);
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
	downloadDir,
}: {
	src: string;
	downloadDir: string;
}) => {
	if (Internals.AssetCompression.isAssetCompressed(src)) {
		return src;
	}

	const {pathname, search} = new URL(src);

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
		downloadDir,
		sanitizeFilePath(hashedFileName + fileExtension)
	);
};

export const downloadAndMapAssetsToFileUrl = async ({
	asset,
	downloadDir,
	onDownload,
}: {
	asset: TAsset;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
}): Promise<TAsset> => {
	const newSrc = await startDownloadForSrc({
		src: asset.src,
		downloadDir,
		onDownload,
	});

	return {
		...asset,
		src: newSrc,
	};
};

export const startDownloadForSrc = async ({
	src,
	downloadDir,
	onDownload,
}: {
	src: string;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
}) => {
	const newSrc = getSanitizedFilenameForAssetUrl({downloadDir, src});
	if (!Internals.AssetCompression.isAssetCompressed(newSrc)) {
		await downloadAsset(src, newSrc, onDownload);
	}

	return newSrc;
};
