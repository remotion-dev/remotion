import {GOOGLE_FONTS_LIST} from '../components/Timeline/google-fonts-list';

const fontLoads = new Map<string, Promise<void>>();

export const loadGoogleFontForPreview = ({
	fontFamily,
	document,
}: {
	readonly fontFamily: string;
	readonly document: Document;
}): Promise<void> => {
	const existing = fontLoads.get(fontFamily);
	if (existing) {
		return existing;
	}

	const font = GOOGLE_FONTS_LIST.find(
		(entry) => entry.fontFamily === fontFamily,
	);
	if (!font) {
		return Promise.resolve();
	}

	const commonWeights = font.weights.filter((weight) =>
		['400', '700', '800'].includes(weight),
	);
	const weights = commonWeights.length
		? commonWeights
		: font.weights.slice(0, 1);
	const promise = Promise.all(
		weights.map(async (weight) => {
			const response = await fetch(
				`https://fonts.googleapis.com/css?family=${font.previewUrl}:${weight}`,
			);
			if (!response.ok) {
				throw new Error(
					`Could not load font "${fontFamily}" for Studio preview`,
				);
			}

			const cssText = await response.text();
			const urls = [...cssText.matchAll(/url\(([^)]+)\)/g)].map(
				(match) => match[1],
			);
			if (urls.length === 0) {
				throw new Error(
					`Could not load font "${fontFamily}" for Studio preview`,
				);
			}

			await Promise.all(
				urls.map(async (url) => {
					const fontFace = new FontFace(fontFamily, `url(${url})`, {weight});
					await fontFace.load();
					document.fonts.add(fontFace);
				}),
			);
		}),
	)
		.then(() => undefined)
		.catch((error) => {
			// Successful loads stay cached; failed downloads can be retried.
			fontLoads.delete(fontFamily);
			throw error;
		});
	fontLoads.set(fontFamily, promise);
	return promise;
};
