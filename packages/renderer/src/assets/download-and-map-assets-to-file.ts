import fs from 'node:fs';
import path, {extname} from 'node:path';
import type {TAsset} from 'remotion';
import {random} from 'remotion';
import {isAssetCompressed} from '../compress-assets';
import {ensureOutputDirectory} from '../ensure-output-directory';
import {getExt} from '../mime-types';
import {OffthreadVideoServerEmitter} from '../offthread-video-server';
import {downloadFile} from './download-file';
import type {DownloadMap} from './download-map';
import {sanitizeFilePath} from './sanitize-filepath';

export type RenderMediaOnDownload = (
	src: string
) =>
	| ((progress: {
			percent: number | null;
			downloaded: number;
			totalSize: number | null;
	  }) => void)
	| undefined
	| void;

const waitForAssetToBeDownloaded = ({
	src,
	downloadDir,
	downloadMap,
}: {
	src: string;
	downloadDir: string;
	downloadMap: DownloadMap;
}): Promise<string> => {
	if (process.env.NODE_ENV === 'test') {
		console.log('waiting for asset to be downloaded', src);
	}

	if (downloadMap.hasBeenDownloadedMap[src]?.[downloadDir]) {
		return Promise.resolve(
			downloadMap.hasBeenDownloadedMap[src]?.[downloadDir] as string
		);
	}

	if (!downloadMap.listeners[src]) {
		downloadMap.listeners[src] = {};
	}

	if (!downloadMap.listeners[src][downloadDir]) {
		downloadMap.listeners[src][downloadDir] = [];
	}

	return new Promise<string>((resolve) => {
		downloadMap.listeners[src][downloadDir].push(() => {
			const srcMap = downloadMap.hasBeenDownloadedMap[src];
			if (!srcMap?.[downloadDir]) {
				throw new Error(
					'Expected file for ' + src + 'to be available in ' + downloadDir
				);
			}

			resolve(srcMap[downloadDir] as string);
		});
	});
};

const notifyAssetIsDownloaded = ({
	src,
	downloadDir,
	to,
	downloadMap,
}: {
	src: string;
	downloadDir: string;
	to: string;
	downloadMap: DownloadMap;
}) => {
	if (!downloadMap.listeners[src]) {
		downloadMap.listeners[src] = {};
	}

	if (!downloadMap.listeners[src][downloadDir]) {
		downloadMap.listeners[src][downloadDir] = [];
	}

	if (!downloadMap.isDownloadingMap[src]) {
		downloadMap.isDownloadingMap[src] = {};
	}

	(
		downloadMap.isDownloadingMap[src] as {
			[downloadDir: string]: boolean;
		}
	)[downloadDir] = false;

	if (!downloadMap.hasBeenDownloadedMap[src]) {
		downloadMap.hasBeenDownloadedMap[src] = {};
	}

	(
		downloadMap.hasBeenDownloadedMap[src] as {
			[downloadDir: string]: string | null;
		}
	)[downloadDir] = to;

	downloadMap.listeners[src][downloadDir].forEach((fn) => fn());
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

export const downloadAsset = async ({
	src,
	downloadMap,
	emitter,
}: {
	src: string;
	emitter: OffthreadVideoServerEmitter;
	downloadMap: DownloadMap;
}): Promise<string> => {
	if (isAssetCompressed(src)) {
		return src;
	}

	const {downloadDir} = downloadMap;

	if (downloadMap.hasBeenDownloadedMap[src]?.[downloadDir]) {
		const claimedDownloadLocation = downloadMap.hasBeenDownloadedMap[src]?.[
			downloadDir
		] as string;
		// The OS might have deleted the file since even though we marked it as downloaded. In that case we reset the state and download it again
		if (fs.existsSync(claimedDownloadLocation)) {
			return claimedDownloadLocation;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		downloadMap.hasBeenDownloadedMap[src]![downloadDir] = null;
		if (!downloadMap.isDownloadingMap[src]) {
			downloadMap.isDownloadingMap[src] = {};
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		downloadMap.isDownloadingMap[src]![downloadDir] = false;
	}

	if (downloadMap.isDownloadingMap[src]?.[downloadDir]) {
		return waitForAssetToBeDownloaded({downloadMap, src, downloadDir});
	}

	if (!downloadMap.isDownloadingMap[src]) {
		downloadMap.isDownloadingMap[src] = {};
	}

	(
		downloadMap.isDownloadingMap[src] as {
			[downloadDir: string]: boolean;
		}
	)[downloadDir] = true;

	if (process.env.NODE_ENV === 'test') {
		console.log('Actually downloading asset', src);
	}

	emitter.dispatchDownload(src);

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

		const output = getSanitizedFilenameForAssetUrl({
			contentDisposition: null,
			downloadDir,
			src,
			contentType: mimeType,
		});
		ensureOutputDirectory(output);

		const buff = Buffer.from(assetData, encoding);
		await fs.promises.writeFile(output, buff);
		notifyAssetIsDownloaded({src, downloadMap, downloadDir, to: output});
		return output;
	}

	const {to} = await downloadFile({
		url: src,
		onProgress: (progress) => {
			emitter.dispatchDownloadProgress(
				src,
				progress.percent,
				progress.downloaded,
				progress.totalSize
			);
		},
		to: (contentDisposition, contentType) =>
			getSanitizedFilenameForAssetUrl({
				contentDisposition,
				downloadDir,
				src,
				contentType,
			}),
	});

	notifyAssetIsDownloaded({src, downloadMap, downloadDir, to});

	return to;
};

export const markAllAssetsAsDownloaded = (downloadMap: DownloadMap) => {
	Object.keys(downloadMap.hasBeenDownloadedMap).forEach((key) => {
		delete downloadMap.hasBeenDownloadedMap[key];
	});

	Object.keys(downloadMap.isDownloadingMap).forEach((key) => {
		delete downloadMap.isDownloadingMap[key];
	});
};

const getFilename = ({
	contentDisposition,
	src,
	contentType,
}: {
	src: string;
	contentDisposition: string | null;
	contentType: string | null;
}): {pathname: string; search: string} => {
	const filenameProbe = 'filename=';
	if (contentDisposition?.includes(filenameProbe)) {
		const start = contentDisposition.indexOf(filenameProbe);
		const onlyFromFileName = contentDisposition.substring(
			start + filenameProbe.length
		);

		const hasSemi = onlyFromFileName.indexOf(';');
		if (hasSemi === -1) {
			return {pathname: onlyFromFileName.trim(), search: ''};
		}

		return {
			search: '',
			pathname: onlyFromFileName.substring(0, hasSemi).trim(),
		};
	}

	const {pathname, search} = new URL(src);

	const ext = extname(pathname);

	// Has no file extension, check if we can derive it from contentType
	if (!ext && contentType) {
		const matchedExt = getExt(contentType);

		return {
			pathname: `${pathname}.${matchedExt}`,
			search,
		};
	}

	return {pathname, search};
};

export const getSanitizedFilenameForAssetUrl = ({
	src,
	downloadDir,
	contentDisposition,
	contentType,
}: {
	src: string;
	downloadDir: string;
	contentDisposition: string | null;
	contentType: string | null;
}) => {
	if (isAssetCompressed(src)) {
		return src;
	}

	const {pathname, search} = getFilename({
		contentDisposition,
		contentType,
		src,
	});

	const split = pathname.split('.');
	const fileExtension =
		split.length > 1 && split[split.length - 1]
			? `.${split[split.length - 1]}`
			: '';
	const hashedFileName = String(random(`${pathname}${search}`)).replace(
		'0.',
		''
	);

	const filename = hashedFileName + fileExtension;

	return path.join(downloadDir, sanitizeFilePath(filename));
};

export const downloadAndMapAssetsToFileUrl = async ({
	asset,
	onDownload,
	downloadMap,
}: {
	asset: TAsset;
	onDownload: RenderMediaOnDownload | null;
	downloadMap: DownloadMap;
}): Promise<TAsset> => {
	const emitter = new OffthreadVideoServerEmitter();
	const cleanup = attachDownloadListenerToEmitter(emitter, onDownload);
	const newSrc = await downloadAsset({
		src: asset.src,
		emitter,
		downloadMap,
	});
	cleanup();

	return {
		...asset,
		src: newSrc,
	};
};

export const attachDownloadListenerToEmitter = (
	emitter: OffthreadVideoServerEmitter,
	onDownload: RenderMediaOnDownload | null
) => {
	const cleanup: CleanupFn[] = [];
	if (!onDownload) {
		return () => undefined;
	}

	const a = emitter.addEventListener(
		'download',
		({detail: {src: initialSrc}}) => {
			const progress = onDownload(initialSrc);
			const b = emitter.addEventListener(
				'progress',
				({detail: {downloaded, percent, src: progressSrc, totalSize}}) => {
					if (initialSrc === progressSrc) {
						progress?.({downloaded, percent, totalSize});
					}
				}
			);
			cleanup.push(b);
		}
	);
	cleanup.push(() => a());

	return () => {
		cleanup.forEach((c) => c());
	};
};

type CleanupFn = () => void;
