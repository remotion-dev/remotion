import {lookup} from 'node:dns/promises';
import {existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
import {isIP} from 'node:net';
import path from 'node:path';
import type {
	DownloadRemoteAssetRequest,
	DownloadRemoteAssetResponse,
	InsertableCompositionElement,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {validateSameOrigin} from '../validate-same-origin';

const maxRemoteAssetSize = 50 * 1024 * 1024;
const remoteAssetDownloadTimeout = 15000;

type RemoteImageFileType = {
	type: 'png' | 'jpeg' | 'webp' | 'bmp' | 'gif';
	dimensions: {width: number; height: number} | null;
};

const matchesPattern = (pattern: Uint8Array) => {
	return (data: Uint8Array) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

const getPngDimensions = (pngData: Uint8Array) => {
	if (pngData.length < 24) {
		return null;
	}

	const view = new DataView(pngData.buffer, pngData.byteOffset);
	const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
	for (let i = 0; i < 8; i++) {
		if (pngData[i] !== pngSignature[i]) {
			return null;
		}
	}

	return {
		width: view.getUint32(16, false),
		height: view.getUint32(20, false),
	};
};

const getJpegDimensions = (data: Uint8Array) => {
	const readUint16BE = (index: number): number => {
		return (data[index] << 8) | data[index + 1];
	};

	if (data.length < 4 || readUint16BE(0) !== 0xffd8) {
		return null;
	}

	let offset = 2;
	while (offset + 9 < data.length) {
		if (data[offset] !== 0xff) {
			offset++;
			continue;
		}

		const marker = data[offset + 1];
		if (marker === 0xc0 || marker === 0xc2) {
			const height = readUint16BE(offset + 5);
			const width = readUint16BE(offset + 7);
			return {width, height};
		}

		if (offset + 3 >= data.length) {
			return null;
		}

		const length = readUint16BE(offset + 2);
		if (length <= 0) {
			return null;
		}

		offset += length + 2;
	}

	return null;
};

const getGifDimensions = (data: Uint8Array) => {
	if (data.length < 10) {
		return null;
	}

	const view = new DataView(data.buffer, data.byteOffset);
	return {
		width: view.getUint16(6, true),
		height: view.getUint16(8, true),
	};
};

const getWebPDimensions = (bytes: Uint8Array) => {
	if (bytes.length < 30) {
		return null;
	}

	if (
		bytes[0] !== 0x52 ||
		bytes[1] !== 0x49 ||
		bytes[2] !== 0x46 ||
		bytes[3] !== 0x46 ||
		bytes[8] !== 0x57 ||
		bytes[9] !== 0x45 ||
		bytes[10] !== 0x42 ||
		bytes[11] !== 0x50
	) {
		return null;
	}

	if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38) {
		if (bytes[15] === 0x20) {
			return {
				width: bytes[26] | ((bytes[27] << 8) & 0x3fff),
				height: bytes[28] | ((bytes[29] << 8) & 0x3fff),
			};
		}
	}

	if (
		bytes[12] === 0x56 &&
		bytes[13] === 0x50 &&
		bytes[14] === 0x38 &&
		bytes[15] === 0x4c
	) {
		return {
			width: 1 + (bytes[21] | ((bytes[22] & 0x3f) << 8)),
			height:
				1 +
				(((bytes[22] & 0xc0) >> 6) |
					(bytes[23] << 2) |
					((bytes[24] & 0x0f) << 10)),
		};
	}

	if (
		bytes[12] === 0x56 &&
		bytes[13] === 0x50 &&
		bytes[14] === 0x38 &&
		bytes[15] === 0x58
	) {
		return {
			width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
			height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
		};
	}

	return null;
};

const getBmpDimensions = (bmpData: Uint8Array) => {
	if (bmpData.length < 26) {
		return null;
	}

	const view = new DataView(bmpData.buffer, bmpData.byteOffset);

	return {
		width: view.getUint32(18, true),
		height: Math.abs(view.getInt32(22, true)),
	};
};

export const detectRemoteImageFileType = (
	data: Uint8Array,
): RemoteImageFileType | null => {
	if (matchesPattern(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))(data)) {
		return {type: 'png', dimensions: getPngDimensions(data)};
	}

	if (matchesPattern(new Uint8Array([0xff, 0xd8]))(data)) {
		return {type: 'jpeg', dimensions: getJpegDimensions(data)};
	}

	if (matchesPattern(new Uint8Array([0x47, 0x49, 0x46, 0x38]))(data)) {
		return {type: 'gif', dimensions: getGifDimensions(data)};
	}

	if (matchesPattern(new Uint8Array([0x52, 0x49, 0x46, 0x46]))(data)) {
		return {type: 'webp', dimensions: getWebPDimensions(data)};
	}

	if (matchesPattern(new Uint8Array([0x42, 0x4d]))(data)) {
		return {type: 'bmp', dimensions: getBmpDimensions(data)};
	}

	return null;
};

const extensionsForFileType: Record<RemoteImageFileType['type'], string[]> = {
	png: ['png'],
	jpeg: ['jpg', 'jpeg'],
	webp: ['webp'],
	bmp: ['bmp'],
	gif: ['gif'],
};

const safeDecodeURIComponent = (value: string) => {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
};

const sanitizeAssetFilename = (filename: string) => {
	return Array.from(filename)
		.map((character) => {
			const charCode = character.charCodeAt(0);
			return charCode <= 31 || '<>:"/\\|?*'.includes(character)
				? '-'
				: character;
		})
		.join('')
		.trim()
		.replace(/^[. ]+|[. ]+$/g, '');
};

export const getRemoteAssetFilename = ({
	fileType,
	url,
}: {
	fileType: RemoteImageFileType;
	url: URL;
}) => {
	const basename = safeDecodeURIComponent(path.posix.basename(url.pathname));
	const sanitized = sanitizeAssetFilename(basename);
	const filenameWithoutFallback = sanitized === '' ? 'image' : sanitized;
	const extensions = extensionsForFileType[fileType.type];
	const extension = path
		.extname(filenameWithoutFallback)
		.slice(1)
		.toLowerCase();

	if (extensions.includes(extension)) {
		return filenameWithoutFallback;
	}

	const withoutExtension = extension
		? filenameWithoutFallback.slice(0, -(extension.length + 1))
		: filenameWithoutFallback;
	const safeName = withoutExtension === '' ? 'image' : withoutExtension;
	return `${safeName}.${extensions[0]}`;
};

const isForbiddenIpv4Address = (address: string) => {
	const parts = address.split('.').map((part) => Number(part));
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	) {
		return true;
	}

	const [first, second] = parts;
	return (
		first === 0 ||
		first === 10 ||
		first === 127 ||
		(first === 100 && second >= 64 && second <= 127) ||
		(first === 169 && second === 254) ||
		(first === 172 && second >= 16 && second <= 31) ||
		(first === 192 && second === 168) ||
		(first === 198 && (second === 18 || second === 19)) ||
		first >= 224
	);
};

const isForbiddenIpv6Address = (address: string) => {
	const normalized = address.toLowerCase();
	const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
	if (mappedIpv4) {
		return isForbiddenIpv4Address(mappedIpv4);
	}

	return (
		normalized === '::' ||
		normalized === '::1' ||
		normalized.startsWith('fc') ||
		normalized.startsWith('fd') ||
		normalized.startsWith('fe8') ||
		normalized.startsWith('fe9') ||
		normalized.startsWith('fea') ||
		normalized.startsWith('feb')
	);
};

const ensureRemoteUrlIsAllowed = async (url: URL) => {
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('Only HTTP(S) URLs can be imported');
	}

	if (url.username !== '' || url.password !== '') {
		throw new Error('Remote asset URLs cannot include credentials');
	}

	if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
		throw new Error('Localhost URLs cannot be imported');
	}

	const hostnameAsIp = isIP(url.hostname);
	if (hostnameAsIp === 4 && isForbiddenIpv4Address(url.hostname)) {
		throw new Error('Private IP addresses cannot be imported');
	}

	if (hostnameAsIp === 6 && isForbiddenIpv6Address(url.hostname)) {
		throw new Error('Private IP addresses cannot be imported');
	}

	const addresses = hostnameAsIp
		? [{address: url.hostname, family: hostnameAsIp}]
		: await lookup(url.hostname, {all: true});

	if (addresses.length === 0) {
		throw new Error(`Could not resolve ${url.hostname}`);
	}

	for (const address of addresses) {
		if (
			(address.family === 4 && isForbiddenIpv4Address(address.address)) ||
			(address.family === 6 && isForbiddenIpv6Address(address.address))
		) {
			throw new Error('Private IP addresses cannot be imported');
		}
	}
};

const readRemoteAsset = async ({
	response,
	abort,
}: {
	response: Response;
	abort: () => void;
}) => {
	const contentLength = response.headers.get('content-length');
	if (contentLength !== null && Number(contentLength) > maxRemoteAssetSize) {
		abort();
		throw new Error('Remote asset exceeds the 50MB size limit');
	}

	if (!response.body) {
		const buffer = await response.arrayBuffer();
		if (buffer.byteLength > maxRemoteAssetSize) {
			throw new Error('Remote asset exceeds the 50MB size limit');
		}

		return new Uint8Array(buffer);
	}

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;

	while (true) {
		const {done, value} = await reader.read();
		if (done) {
			break;
		}

		if (!value) {
			continue;
		}

		size += value.byteLength;
		if (size > maxRemoteAssetSize) {
			abort();
			await reader.cancel();
			throw new Error('Remote asset exceeds the 50MB size limit');
		}

		chunks.push(value);
	}

	const result = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return result;
};

export const downloadRemoteAssetHandler: ApiHandler<
	DownloadRemoteAssetRequest,
	DownloadRemoteAssetResponse
> = async ({input, publicDir, request}) => {
	validateSameOrigin(request);

	if (typeof input.url !== 'string') {
		throw new Error('No `url` provided');
	}

	if (typeof fetch !== 'function') {
		throw new Error(
			'Downloading remote assets requires Node.js 18 or newer. Drag a local file instead.',
		);
	}

	const url = new URL(input.url);
	await ensureRemoteUrlIsAllowed(url);

	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, remoteAssetDownloadTimeout);

	let contents: Uint8Array;
	try {
		const response = await fetch(url, {
			headers: {
				accept: 'image/png,image/jpeg,image/webp,image/bmp,image/gif',
			},
			redirect: 'manual',
			signal: controller.signal,
		});

		if (response.status >= 300 && response.status < 400) {
			throw new Error('Remote asset redirects are not supported');
		}

		if (!response.ok) {
			throw new Error(`Could not download remote asset: ${response.status}`);
		}

		contents = await readRemoteAsset({
			response,
			abort: () => controller.abort(),
		});
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new Error('Timed out downloading remote asset');
		}

		throw err;
	} finally {
		clearTimeout(timeout);
	}

	const fileType = detectRemoteImageFileType(contents);
	if (fileType === null) {
		throw new Error('Remote asset is not a supported image');
	}

	const assetPath = getRemoteAssetFilename({fileType, url});
	const absolutePath = path.join(publicDir, assetPath);
	const relativeToPublicDir = path.relative(publicDir, absolutePath);
	if (
		relativeToPublicDir.startsWith('..') ||
		path.isAbsolute(relativeToPublicDir)
	) {
		throw new Error(`Not allowed to write to ${relativeToPublicDir}`);
	}

	const exists = existsSync(absolutePath);
	if (exists) {
		const stat = statSync(absolutePath);
		if (!stat.isFile()) {
			throw new Error(`${assetPath} already exists and is not a file`);
		}

		if (stat.size !== contents.byteLength) {
			throw new Error(
				`File with name ${assetPath} already exists and is different`,
			);
		}
	} else {
		mkdirSync(path.dirname(absolutePath), {recursive: true});
		writeFileSync(absolutePath, contents);
	}

	const element: InsertableCompositionElement = {
		type: 'asset',
		assetType: fileType.type === 'gif' ? 'gif' : 'image',
		src: assetPath,
		dimensions: fileType.dimensions,
	};

	return {
		assetPath,
		sizeInBytes: contents.byteLength,
		created: !exists,
		element,
	};
};
