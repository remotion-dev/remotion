import type {StudioElementLibrary} from '@remotion/studio-shared';

export type AddElementLibraryOptions = {
	readonly url: string;
	readonly displayName?: string;
	readonly captionStylesUrl?: string;
};

let elementLibraries: StudioElementLibrary[] = [];

export const addElementLibrary = (options: AddElementLibraryOptions) => {
	if (
		typeof options !== 'object' ||
		options === null ||
		Array.isArray(options)
	) {
		const receivedType = Array.isArray(options) ? 'an array' : typeof options;
		throw new Error(
			`Config.addElementLibrary() expects an object, got ${receivedType}`,
		);
	}

	const {url, displayName, captionStylesUrl} = options;
	if (typeof url !== 'string') {
		throw new Error(
			`Config.addElementLibrary() expects "url" to be a string, got ${typeof url}`,
		);
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch {
		throw new Error(
			`Config.addElementLibrary() expects an absolute URL, got ${JSON.stringify(url)}`,
		);
	}

	if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
		throw new Error(
			`Config.addElementLibrary() only supports HTTP and HTTPS URLs, got ${JSON.stringify(url)}`,
		);
	}

	let normalizedCaptionStylesUrl: string | null = null;
	if (captionStylesUrl !== undefined) {
		try {
			if (typeof captionStylesUrl !== 'string') {
				throw new Error('Invalid URL');
			}

			const parsed = new URL(captionStylesUrl);
			if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
				throw new Error('Unsupported protocol');
			}

			normalizedCaptionStylesUrl = parsed.href;
		} catch {
			throw new Error(
				'Config.addElementLibrary() expects "captionStylesUrl" to be an absolute HTTP or HTTPS URL',
			);
		}
	}

	if (displayName !== undefined && typeof displayName !== 'string') {
		throw new Error(
			`Config.addElementLibrary() expects the display name to be a string, got ${typeof displayName}`,
		);
	}

	const trimmedDisplayName = displayName?.trim() ?? null;
	if (trimmedDisplayName === '') {
		throw new Error(
			'Config.addElementLibrary() expects the display name to not be empty',
		);
	}

	elementLibraries.push({
		displayName: trimmedDisplayName,
		url: parsedUrl.href,
		captionStylesUrl: normalizedCaptionStylesUrl,
	});
};

export const getElementLibraries = (): readonly StudioElementLibrary[] =>
	elementLibraries;

export const resetElementLibraries = () => {
	elementLibraries = [];
};
