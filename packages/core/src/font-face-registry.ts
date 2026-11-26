export type RegisteredFontFace = {
	ascentOverride: string | null;
	descentOverride: string | null;
	display: 'auto' | 'block' | 'fallback' | 'optional' | 'swap' | null;
	featureSettings: string | null;
	fontFamily: string;
	fontData: ArrayBuffer;
	fontUrl: string;
	format: 'woff2' | 'woff' | 'opentype' | 'truetype';
	lineGapOverride: string | null;
	style: string | null;
	weight: string | null;
	stretch: string | null;
	unicodeRange: string | null;
	variant: string | null;
};

const registeredFontFaces: RegisteredFontFace[] = [];
const fontDataByUrl = new Map<string, Promise<ArrayBuffer>>();

export const fetchFontData = (fontUrl: string): Promise<ArrayBuffer> => {
	const cached = fontDataByUrl.get(fontUrl);
	if (cached) {
		return cached;
	}

	const promise = fetch(fontUrl)
		.then((response) => {
			if (!response.ok) {
				throw new Error(
					`Failed to load font ${JSON.stringify(fontUrl)}: ${response.status} ${response.statusText}`,
				);
			}

			return response.arrayBuffer();
		})
		.catch((error) => {
			fontDataByUrl.delete(fontUrl);
			throw error;
		});

	fontDataByUrl.set(fontUrl, promise);
	return promise;
};

export const registerFontFace = (fontFace: RegisteredFontFace) => {
	if (
		registeredFontFaces.some(
			(registered) =>
				registered.ascentOverride === fontFace.ascentOverride &&
				registered.descentOverride === fontFace.descentOverride &&
				registered.display === fontFace.display &&
				registered.featureSettings === fontFace.featureSettings &&
				registered.fontFamily === fontFace.fontFamily &&
				registered.fontUrl === fontFace.fontUrl &&
				registered.format === fontFace.format &&
				registered.lineGapOverride === fontFace.lineGapOverride &&
				registered.style === fontFace.style &&
				registered.weight === fontFace.weight &&
				registered.stretch === fontFace.stretch &&
				registered.unicodeRange === fontFace.unicodeRange &&
				registered.variant === fontFace.variant,
		)
	) {
		return;
	}

	registeredFontFaces.push(fontFace);
};

export const getRegisteredFontFaces = (): RegisteredFontFace[] => {
	return registeredFontFaces.slice();
};

const pendingFontLoads = new Set<Promise<void>>();

export const startFontLoad = (): {
	finish: () => void;
	fail: (error: unknown) => void;
} => {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const load = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	// A load can fail while no render is waiting for it.
	load.catch(() => undefined);
	pendingFontLoads.add(load);
	return {
		finish: () => {
			pendingFontLoads.delete(load);
			resolve();
		},
		fail: (error) => {
			pendingFontLoads.delete(load);
			reject(error);
		},
	};
};

export const getPendingFontLoads = (): Promise<void>[] => {
	return [...pendingFontLoads];
};
