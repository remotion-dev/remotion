import fs from 'fs';
import path from 'path';
import type {TAsset} from 'remotion';
import {Internals, random} from 'remotion';
import {ensureOutputDirectory} from '../ensure-output-directory';
import {downloadFile} from './download-file';
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

const isDownloadingMap: {
	[src: string]: {[downloadDir: string]: boolean} | undefined;
} = {};
const hasBeenDownloadedMap: {
	[src: string]: {[downloadDir: string]: string | null} | undefined;
} = {};
const listeners: {[key: string]: {[downloadDir: string]: (() => void)[]}} = {};

const waitForAssetToBeDownloaded = ({
	src,
	downloadDir,
}: {
	src: string;
	downloadDir: string;
}): Promise<string> => {
	if (hasBeenDownloadedMap[src]?.[downloadDir]) {
		return Promise.resolve(hasBeenDownloadedMap[src]?.[downloadDir] as string);
	}

	if (!listeners[src]) {
		listeners[src] = {};
	}

	if (!listeners[src][downloadDir]) {
		listeners[src][downloadDir] = [];
	}

	return new Promise<string>((resolve) => {
		listeners[src][downloadDir].push(() => {
			const srcMap = hasBeenDownloadedMap[src];
			if (!srcMap || !srcMap[downloadDir]) {
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
}: {
	src: string;
	downloadDir: string;
	to: string;
}) => {
	if (!listeners[src]) {
		listeners[src] = {};
	}

	if (!listeners[src][downloadDir]) {
		listeners[src][downloadDir] = [];
	}

	if (!isDownloadingMap[src]) {
		isDownloadingMap[src] = {};
	}

	(
		isDownloadingMap[src] as {
			[downloadDir: string]: boolean;
		}
	)[downloadDir] = true;

	if (!hasBeenDownloadedMap[src]) {
		hasBeenDownloadedMap[src] = {};
	}

	(
		hasBeenDownloadedMap[src] as {
			[downloadDir: string]: string | null;
		}
	)[downloadDir] = to;

	listeners[src][downloadDir].forEach((fn) => fn());
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
	onDownload,
	downloadDir,
}: {
	src: string;
	onDownload: RenderMediaOnDownload;
	downloadDir: string;
}): Promise<string> => {
	if (Internals.AssetCompression.isAssetCompressed(src)) {
		return src;
	}

	if (hasBeenDownloadedMap[src]?.[downloadDir]) {
		const claimedDownloadLocation = hasBeenDownloadedMap[src]?.[
			downloadDir
		] as string;
		// The OS might have deleted the file since even though we marked it as downloaded. In that case we reset the state and download it again
		if (fs.existsSync(claimedDownloadLocation)) {
			return claimedDownloadLocation;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		hasBeenDownloadedMap[src]![downloadDir] = null;
		if (!isDownloadingMap[src]) {
			isDownloadingMap[src] = {};
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		isDownloadingMap[src]![downloadDir] = false;
	}

	if (isDownloadingMap[src]?.[downloadDir]) {
		return waitForAssetToBeDownloaded({src, downloadDir});
	}

	if (!isDownloadingMap[src]) {
		isDownloadingMap[src] = {};
	}

	(
		isDownloadingMap[src] as {
			[downloadDir: string]: boolean;
		}
	)[downloadDir] = true;

	const onProgress = onDownload(src);

	if (src.startsWith('data:')) {
		const output = getSanitizedFilenameForAssetUrl({
			contentDisposition: null,
			downloadDir,
			src,
		});
		ensureOutputDirectory(output);
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
		await fs.promises.writeFile(output, buff);
		notifyAssetIsDownloaded({src, downloadDir, to: output});
		return output;
	}

	const {to} = await downloadFile({
		url: src,
		onProgress: (progress) => {
			onProgress?.(progress);
		},
		to: (contentDisposition) =>
			getSanitizedFilenameForAssetUrl({contentDisposition, downloadDir, src}),
	});
	notifyAssetIsDownloaded({src, downloadDir, to});

	return to;
};

export const markAllAssetsAsDownloaded = () => {
	Object.keys(hasBeenDownloadedMap).forEach((key) => {
		delete hasBeenDownloadedMap[key];
	});

	Object.keys(isDownloadingMap).forEach((key) => {
		delete isDownloadingMap[key];
	});
};

const getFilename = ({
	contentDisposition,
	src,
}: {
	src: string;
	contentDisposition: string | null;
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

	return {pathname, search};
};

export const getSanitizedFilenameForAssetUrl = ({
	src,
	downloadDir,
	contentDisposition,
}: {
	src: string;
	downloadDir: string;
	contentDisposition: string | null;
}) => {
	if (Internals.AssetCompression.isAssetCompressed(src)) {
		return src;
	}

	const {pathname, search} = getFilename({contentDisposition, src});

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
	downloadDir,
	onDownload,
}: {
	asset: TAsset;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
}): Promise<TAsset> => {
	const newSrc = await downloadAsset({
		src: asset.src,
		downloadDir,
		onDownload,
	});

	return {
		...asset,
		src: newSrc,
	};
};
