import fs from 'node:fs';
import path, {extname} from 'node:path';
import type {AudioOrVideoAsset} from 'remotion/no-react';
import {random} from 'remotion/no-react';
import {isAssetCompressed} from '../compress-assets';
import {ensureOutputDirectory} from '../ensure-output-directory';
import type {LogLevel} from '../log-level';
import type {CancelSignal} from '../make-cancel-signal';
import {getExt} from '../mime-types';
import {downloadFile} from './download-file';
import type {AssetDownloadState, DownloadMap} from './download-map';
import {getAudioChannelsAndDuration} from './get-audio-channels';
import {sanitizeFilePath} from './sanitize-filepath';

export type RenderMediaOnDownload = (
	src: string,
) =>
	| ((progress: {
			percent: number | null;
			downloaded: number;
			totalSize: number | null;
	  }) => void)
	| undefined
	| void;

type AssetDownloadEvent =
	| {type: 'start'; promise: Promise<string>}
	| {type: 'succeeded'; path: string}
	| {type: 'failed'; promise: Promise<string>}
	| {type: 'file-missing'};

export const assetDownloadTransition = (
	state: AssetDownloadState | null,
	event: AssetDownloadEvent,
): AssetDownloadState | null => {
	switch (event.type) {
		case 'start':
			return {type: 'downloading', promise: event.promise};
		case 'succeeded':
			return {type: 'downloaded', path: event.path};
		case 'failed':
			return state?.type === 'downloading' && state.promise === event.promise
				? null
				: state;
		case 'file-missing':
			return state?.type === 'downloaded' ? null : state;
		default:
			throw new Error(
				'Unknown asset download event ' + (event satisfies never),
			);
	}
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
	dataUrl: string,
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
	indent,
	logLevel,
	shouldAnalyzeAudioImmediately,
	binariesDirectory,
	cancelSignalForAudioAnalysis,
	audioStreamIndex,
}: {
	src: string;
	downloadMap: DownloadMap;
	indent: boolean;
	logLevel: LogLevel;
	shouldAnalyzeAudioImmediately: boolean;
	binariesDirectory: string | null;
	cancelSignalForAudioAnalysis: CancelSignal | undefined;
	audioStreamIndex: number | undefined;
}): Promise<string> => {
	if (isAssetCompressed(src)) {
		return src;
	}

	const {downloadDir} = downloadMap;

	const apply = (event: AssetDownloadEvent) => {
		const next = assetDownloadTransition(
			downloadMap.assetDownloads.get(src) ?? null,
			event,
		);
		if (next === null) {
			downloadMap.assetDownloads.delete(src);
		} else {
			downloadMap.assetDownloads.set(src, next);
		}
	};

	const existing = downloadMap.assetDownloads.get(src) ?? null;
	if (existing?.type === 'downloaded') {
		// The OS might have deleted the file since even though we marked it as downloaded. In that case we reset the state and download it again
		if (fs.existsSync(existing.path)) {
			return existing.path;
		}

		apply({type: 'file-missing'});
	}

	if (existing?.type === 'downloading') {
		return existing.promise;
	}

	let resolveDownload: (path: string) => void = () => undefined;
	let rejectDownload: (err: unknown) => void = () => undefined;
	const promise = new Promise<string>((resolve, reject) => {
		resolveDownload = resolve;
		rejectDownload = reject;
	});
	// Avoid an unhandled rejection if nobody else waits
	promise.catch(() => undefined);

	apply({type: 'start', promise});
	downloadMap.emitter.dispatchDownload(src);

	const isDataUrl = src.startsWith('data:');
	let to: string;
	try {
		if (isDataUrl) {
			const [assetDetails, assetData] = src
				.substring('data:'.length)
				.split(',');
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

			to = getSanitizedFilenameForAssetUrl({
				contentDisposition: null,
				downloadDir,
				src,
				contentType: mimeType,
			});
			ensureOutputDirectory(to);

			const buff = Buffer.from(assetData, encoding);
			await fs.promises.writeFile(to, buff as never as Uint8Array);
		} else {
			const result = await downloadFile({
				url: src,
				onProgress: (progress) => {
					downloadMap.emitter.dispatchDownloadProgress(
						src,
						progress.percent,
						progress.downloaded,
						progress.totalSize,
					);
				},
				to: (contentDisposition, contentType) =>
					getSanitizedFilenameForAssetUrl({
						contentDisposition,
						downloadDir,
						src,
						contentType,
					}),
				indent,
				logLevel,
				abortSignal: downloadMap.cleanupController.signal,
			});
			to = result.to;
		}
	} catch (err) {
		// https://github.com/remotion-dev/remotion/issues/12817
		apply({type: 'failed', promise});
		rejectDownload(err);
		throw err;
	}

	apply({type: 'succeeded', path: to});
	resolveDownload(to);

	if (isDataUrl) {
		return to;
	}

	if (shouldAnalyzeAudioImmediately) {
		await getAudioChannelsAndDuration({
			binariesDirectory,
			downloadMap,
			src: to,
			indent,
			logLevel,
			cancelSignal: cancelSignalForAudioAnalysis,
			audioStreamIndex,
		});
	}

	return to;
};

export const markAllAssetsAsDownloaded = (downloadMap: DownloadMap) => {
	downloadMap.assetDownloads.clear();
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
			start + filenameProbe.length,
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
	const hashedFileName = String(random(`${src}${pathname}${search}`)).replace(
		'0.',
		'',
	);

	const filename = hashedFileName + fileExtension;

	return path.join(downloadDir, sanitizeFilePath(filename));
};

export const downloadAndMapAssetsToFileUrl = async ({
	renderAsset,
	onDownload,
	downloadMap,
	logLevel,
	indent,
	binariesDirectory,
	cancelSignalForAudioAnalysis,
	shouldAnalyzeAudioImmediately,
}: {
	renderAsset: AudioOrVideoAsset;
	onDownload: RenderMediaOnDownload | null;
	downloadMap: DownloadMap;
	logLevel: LogLevel;
	indent: boolean;
	shouldAnalyzeAudioImmediately: boolean;
	binariesDirectory: string | null;
	cancelSignalForAudioAnalysis: CancelSignal | undefined;
}): Promise<AudioOrVideoAsset> => {
	const cleanup = attachDownloadListenerToEmitter(downloadMap, onDownload);
	const newSrc = await downloadAsset({
		src: renderAsset.src,
		downloadMap,
		indent,
		logLevel,
		shouldAnalyzeAudioImmediately,
		binariesDirectory,
		cancelSignalForAudioAnalysis,
		audioStreamIndex: renderAsset.audioStreamIndex,
	});
	cleanup();

	return {
		...renderAsset,
		src: newSrc,
	};
};

export const attachDownloadListenerToEmitter = (
	downloadMap: DownloadMap,
	onDownload: RenderMediaOnDownload | null,
) => {
	const cleanup: CleanupFn[] = [];
	if (!onDownload) {
		return () => undefined;
	}

	if (downloadMap.downloadListeners.includes(onDownload)) {
		return () => undefined;
	}

	downloadMap.downloadListeners.push(onDownload);
	cleanup.push(() => {
		downloadMap.downloadListeners = downloadMap.downloadListeners.filter(
			(l) => l !== onDownload,
		);
		return Promise.resolve();
	});

	const cleanupDownloadListener = downloadMap.emitter.addEventListener(
		'download',
		({detail: {src: initialSrc}}) => {
			const progress = onDownload(initialSrc);
			const cleanupProgressListener = downloadMap.emitter.addEventListener(
				'progress',
				({detail: {downloaded, percent, src: progressSrc, totalSize}}) => {
					if (initialSrc === progressSrc) {
						progress?.({downloaded, percent, totalSize});
					}
				},
			);
			cleanup.push(() => {
				cleanupProgressListener();
				return Promise.resolve();
			});
		},
	);
	cleanup.push(() => {
		cleanupDownloadListener();
		return Promise.resolve();
	});

	return () => {
		cleanup.forEach((c) => c());
	};
};

type CleanupFn = () => Promise<unknown>;
