import fs from 'fs';
import path from 'path';
import {Internals, random, TAsset} from 'remotion';
import {ensureOutputDirectory} from '../ensure-output-directory';
import {downloadFile} from './download-file';
import {sanitizeFilePath} from './sanitize-filepath';

export type RenderMediaOnDownload = (
	src: string
) => ((progress: {percent: number}) => void) | undefined | void;

const isDownloadingMap: {[key: string]: boolean} = {};
const hasBeenDownloadedMap: {[key: string]: string | null} = {};
const listeners: {[key: string]: ((to: string) => void)[]} = {};

export const waitForAssetToBeDownloaded = (src: string): Promise<string> => {
	if (hasBeenDownloadedMap[src]) {
		return Promise.resolve(hasBeenDownloadedMap[src] as string);
	}

	if (!listeners[src]) {
		listeners[src] = [];
	}

	return new Promise<string>((resolve) => {
		listeners[src].push((to: string) => resolve(to));
	});
};

const notifyAssetIsDownloaded = (src: string, to: string) => {
	if (!listeners[src]) {
		listeners[src] = [];
	}

	listeners[src].forEach((fn) => fn(to));
	isDownloadingMap[src] = false;
	hasBeenDownloadedMap[src] = to;
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
	if (hasBeenDownloadedMap[src]) {
		return;
	}

	if (isDownloadingMap[src]) {
		return waitForAssetToBeDownloaded(src);
	}

	isDownloadingMap[src] = true;

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
