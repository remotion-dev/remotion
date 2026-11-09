import {lookup} from 'node:dns/promises';
import {existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
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
import {httpGet} from '../../helpers/http-get';
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
		const response = await httpGet({
			url,
			headers: acceptHeader === null ? {} : {accept: acceptHeader},
			signal: controller.signal,
			maxSize,
			tooLargeMessage: 'Remote asset exceeds the 50MB size limit',
			maxRedirects: maxRemoteAssetRedirects,
			validateUrl: ensureRemoteUrlIsAllowed,
		});
		if (response.statusCode < 200 || response.statusCode >= 300) {
			throw new Error(
				`Could not download remote asset: ${response.statusCode}`,
			);
		}

		return response.body;
	} catch (err) {
		if (controller.signal.aborted) {
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
