import {lookup} from 'node:dns/promises';
import {existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
import type {IncomingMessage} from 'node:http';
import http from 'node:http';
import https from 'node:https';
import {isIP} from 'node:net';
import path from 'node:path';
import {
	detectFileType,
	getRemoteAssetElement,
	getRemoteAssetFilename,
	isImageFileType,
	maxRemoteAssetSize,
	remoteAssetAcceptHeader,
	remoteAssetDownloadTimeout,
	type DownloadRemoteAssetRequest,
	type DownloadRemoteAssetResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {validateSameOrigin} from '../validate-same-origin';

const maxRemoteAssetRedirects = 5;
export {getRemoteAssetFilename};

const isForbiddenIpv4Address = (address: string) => {
	const parts = address.split('.').map((part) => Number(part));
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	) {
		return true;
	}

	const [first, second, third] = parts;
	return (
		first === 0 ||
		first === 10 ||
		first === 127 ||
		(first === 100 && second >= 64 && second <= 127) ||
		(first === 169 && second === 254) ||
		(first === 172 && second >= 16 && second <= 31) ||
		(first === 192 && second === 0 && (third === 0 || third === 2)) ||
		(first === 192 && second === 88 && third === 99) ||
		(first === 192 && second === 168) ||
		(first === 198 && (second === 18 || second === 19)) ||
		(first === 198 && second === 51 && third === 100) ||
		(first === 203 && second === 0 && third === 113) ||
		first >= 224
	);
};

const isForbiddenIpv6Address = (address: string) => {
	if (isIP(address) !== 6) {
		return true;
	}

	const normalized = new URL(`http://[${address}]`).hostname.slice(1, -1);
	const [left, right] = normalized.split('::');
	const start = left ? left.split(':') : [];
	const end = right ? right.split(':') : [];
	const parts = (
		right === undefined
			? start
			: [...start, ...Array(8 - start.length - end.length).fill('0'), ...end]
	).map((part) => parseInt(part, 16));
	const embeddedIpv4 = `${parts[6] >> 8}.${parts[6] & 255}.${parts[7] >> 8}.${parts[7] & 255}`;

	if (
		(parts.slice(0, 5).every((part) => part === 0) && parts[5] === 0xffff) ||
		(parts[0] === 0x64 &&
			parts[1] === 0xff9b &&
			parts.slice(2, 6).every((part) => part === 0))
	) {
		return isForbiddenIpv4Address(embeddedIpv4);
	}

	if (parts[0] === 0x2002) {
		return isForbiddenIpv4Address(
			`${parts[1] >> 8}.${parts[1] & 255}.${parts[2] >> 8}.${parts[2] & 255}`,
		);
	}

	if (
		parts[0] < 0x2000 ||
		parts[0] > 0x3fff ||
		(parts[0] === 0x2001 && parts[1] <= 0x1ff) ||
		(parts[0] === 0x2001 && parts[1] === 0xdb8) ||
		(parts[0] === 0x3fff && parts[1] < 0x1000)
	) {
		return true;
	}

	return (
		(parts[4] === 0 || parts[4] === 0x200) &&
		parts[5] === 0x5efe &&
		isForbiddenIpv4Address(embeddedIpv4)
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

	const hostname = url.hostname.replace(/^\[|\]$/g, '');
	const hostnameAsIp = isIP(hostname);
	const addresses = hostnameAsIp
		? [{address: hostname, family: hostnameAsIp}]
		: await lookup(hostname, {all: true});

	if (addresses.length === 0) {
		throw new Error(`Could not resolve ${url.hostname}`);
	}

	for (const address of addresses) {
		if (
			(address.family !== 4 && address.family !== 6) ||
			(address.family === 4 && isForbiddenIpv4Address(address.address)) ||
			(address.family === 6 && isForbiddenIpv6Address(address.address))
		) {
			throw new Error('Private IP addresses cannot be imported');
		}
	}

	return addresses;
};

const fetchRemoteAsset = async ({
	acceptHeader,
	signal,
	url,
}: {
	acceptHeader: string | null;
	signal: AbortSignal;
	url: URL;
}) => {
	let currentUrl = url;

	for (let redirects = 0; redirects <= maxRemoteAssetRedirects; redirects++) {
		const addresses = await ensureRemoteUrlIsAllowed(currentUrl);
		const response = await new Promise<IncomingMessage>((resolve, reject) => {
			const request = (currentUrl.protocol === 'https:' ? https : http).request(
				currentUrl,
				{
					agent: false,
					headers: {
						'accept-encoding': 'identity',
						...(acceptHeader === null ? {} : {accept: acceptHeader}),
					},
					lookup: (_hostname, options, callback) => {
						if (options.all) {
							callback(null, addresses);
							return;
						}

						callback(null, addresses[0].address, addresses[0].family);
					},
					signal,
				},
				(incoming) => {
					incoming.on('error', reject);
					resolve(incoming);
				},
			);
			request.on('error', reject);
			request.end();
		});

		const status = response.statusCode ?? 0;
		if (status < 300 || status >= 400) {
			return response;
		}

		const {location} = response.headers;
		response.destroy();
		if (location === undefined) {
			throw new Error('Remote asset redirect is missing a Location header');
		}

		if (redirects === maxRemoteAssetRedirects) {
			throw new Error('Remote asset redirected too many times');
		}

		currentUrl = new URL(location, currentUrl);
	}

	throw new Error('Remote asset redirected too many times');
};

const readRemoteAsset = async ({
	response,
	abort,
	maxSize,
}: {
	response: IncomingMessage;
	abort: () => void;
	maxSize: number;
}) => {
	const contentLength = response.headers['content-length'];
	if (contentLength !== undefined && Number(contentLength) > maxSize) {
		abort();
		throw new Error('Remote asset exceeds the 50MB size limit');
	}

	const chunks: Uint8Array[] = [];
	let size = 0;

	for await (const value of response) {
		size += value.byteLength;
		if (size > maxSize) {
			abort();
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

export const downloadRemoteAssetBytes = async ({
	acceptHeader,
	maxSize,
	url,
}: {
	acceptHeader: string | null;
	maxSize: number;
	url: URL;
}) => {
	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		remoteAssetDownloadTimeout,
	);
	try {
		const response = await fetchRemoteAsset({
			acceptHeader,
			signal: controller.signal,
			url,
		});
		const status = response.statusCode ?? 0;
		if (status < 200 || status >= 300) {
			response.destroy();
			throw new Error(`Could not download remote asset: ${status}`);
		}

		return await readRemoteAsset({
			response,
			abort: () => controller.abort(),
			maxSize,
		});
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new Error('Timed out downloading remote asset');
		}

		throw err;
	} finally {
		clearTimeout(timeout);
	}
};

export const downloadRemoteAssetHandler: ApiHandler<
	DownloadRemoteAssetRequest,
	DownloadRemoteAssetResponse
> = async ({input, publicDir, request}) => {
	validateSameOrigin(request);

	if (typeof input.url !== 'string') {
		throw new Error('No `url` provided');
	}

	const url = new URL(input.url);
	const contents = await downloadRemoteAssetBytes({
		acceptHeader: remoteAssetAcceptHeader,
		maxSize: maxRemoteAssetSize,
		url,
	});

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

	const element = getRemoteAssetElement({assetPath, fileType});

	return {
		assetPath,
		sizeInBytes: contents.byteLength,
		created: !exists,
		element,
	};
};
