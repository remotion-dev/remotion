import {lookup} from 'node:dns/promises';
import {existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
import {isIP} from 'node:net';
import path from 'node:path';
import {
	detectFileType,
	isImageFileType,
	type DownloadRemoteAssetRequest,
	type DownloadRemoteAssetResponse,
	type ImageFileType,
	type InsertableCompositionElement,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {validateSameOrigin} from '../validate-same-origin';

const maxRemoteAssetSize = 50 * 1024 * 1024;
const remoteAssetDownloadTimeout = 15000;
const maxRemoteAssetRedirects = 5;
const remoteAssetAcceptHeader =
	'image/png,image/apng,image/jpeg,image/webp,image/bmp,image/gif';

const extensionsForFileType: Record<ImageFileType['type'], string[]> = {
	png: ['png'],
	apng: ['png', 'apng'],
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
	fileType: ImageFileType;
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

const fetchRemoteAsset = async ({
	signal,
	url,
}: {
	signal: AbortSignal;
	url: URL;
}) => {
	let currentUrl = url;

	for (let redirects = 0; redirects <= maxRemoteAssetRedirects; redirects++) {
		await ensureRemoteUrlIsAllowed(currentUrl);

		const response = await fetch(currentUrl, {
			headers: {
				accept: remoteAssetAcceptHeader,
			},
			redirect: 'manual',
			signal,
		});

		if (response.status < 300 || response.status >= 400) {
			return response;
		}

		const location = response.headers.get('location');
		if (location === null) {
			throw new Error('Remote asset redirect is missing a Location header');
		}

		if (redirects === maxRemoteAssetRedirects) {
			throw new Error('Remote asset redirected too many times');
		}

		await response.body?.cancel();
		currentUrl = new URL(location, currentUrl);
	}

	throw new Error('Remote asset redirected too many times');
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

	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, remoteAssetDownloadTimeout);

	let contents: Uint8Array;
	try {
		const response = await fetchRemoteAsset({
			signal: controller.signal,
			url,
		});

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

	const fileType = detectFileType(contents);
	if (!isImageFileType(fileType)) {
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
		assetType:
			fileType.type === 'gif'
				? 'gif'
				: fileType.type === 'apng' ||
					  (fileType.type === 'webp' && fileType.animated)
					? 'animated-image'
					: 'image',
		src: assetPath,
		srcType: 'static',
		dimensions: fileType.dimensions,
		position: null,
	};

	return {
		assetPath,
		sizeInBytes: contents.byteLength,
		created: !exists,
		element,
	};
};
