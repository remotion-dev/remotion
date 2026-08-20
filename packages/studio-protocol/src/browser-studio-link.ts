import type {StudioElementPayload} from './element-payload';
import {parseStudioElementPayload} from './element-payload';
import {isRecord} from './validation';

const browserStudioHashKey = 'remotion-browser-studio';
const defaultBrowserStudioEndpoint =
	'https://www.remotion.dev/experimental_new';
const maxEncodedPayloadLength = 1_100_000;

const toBase64Url = (value: string) => {
	const bytes = new TextEncoder().encode(value);
	let binary = '';
	const chunkSize = 32_768;
	for (let offset = 0; offset < bytes.length; offset += chunkSize) {
		binary += String.fromCharCode(
			...bytes.subarray(offset, offset + chunkSize),
		);
	}

	return btoa(binary)
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replace(/=+$/, '');
};

const fromBase64Url = (value: string) => {
	if (!/^[A-Za-z0-9_-]+$/.test(value)) {
		return null;
	}

	try {
		const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
		const padded = base64.padEnd(
			base64.length + ((4 - (base64.length % 4)) % 4),
			'=',
		);
		const binary = atob(padded);
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index++) {
			bytes[index] = binary.charCodeAt(index);
		}

		return new TextDecoder('utf-8', {fatal: true}).decode(bytes);
	} catch {
		return null;
	}
};

export const makeBrowserStudioUrl = ({
	endpoint = defaultBrowserStudioEndpoint,
	payload,
}: {
	readonly endpoint?: string;
	readonly payload: StudioElementPayload;
}) => {
	if (parseStudioElementPayload(payload) === null) {
		throw new TypeError('Invalid Element payload');
	}

	const url = new URL(endpoint);
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new TypeError('Browser Studio endpoint must use HTTP or HTTPS');
	}

	const encoded = toBase64Url(
		JSON.stringify({
			payload,
			type: 'remotion-browser-studio',
			version: 1,
		}),
	);
	if (encoded.length > maxEncodedPayloadLength) {
		throw new TypeError('Browser Studio payload is too large');
	}

	url.hash = new URLSearchParams({[browserStudioHashKey]: encoded}).toString();
	return url.toString();
};

export const parseBrowserStudioHash = (
	hash: string,
): StudioElementPayload | null => {
	const encoded = new URLSearchParams(
		hash.startsWith('#') ? hash.slice(1) : hash,
	).get(browserStudioHashKey);
	if (
		encoded === null ||
		encoded.length === 0 ||
		encoded.length > maxEncodedPayloadLength
	) {
		return null;
	}

	const decoded = fromBase64Url(encoded);
	if (decoded === null) {
		return null;
	}

	try {
		const envelope: unknown = JSON.parse(decoded);
		if (
			!isRecord(envelope) ||
			envelope.type !== 'remotion-browser-studio' ||
			envelope.version !== 1
		) {
			return null;
		}

		return parseStudioElementPayload(envelope.payload);
	} catch {
		return null;
	}
};

export const openInBrowserStudio = ({
	endpoint,
	payload,
}: {
	readonly endpoint?: string;
	readonly payload: StudioElementPayload;
}) => {
	if (typeof window === 'undefined') {
		throw new Error('Browser Studio can only be opened in a browser');
	}

	window.open(makeBrowserStudioUrl({endpoint, payload}), '_blank', 'noopener');
};
