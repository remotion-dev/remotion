import {continueRender, delayRender} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

const loadedFonts: Record<string, Promise<void> | undefined> = {};

export type FontInfo = {
	fontFamily: string;
	importName: string;
	version: string;
	url: string;
	unicodeRanges: Record<string, string>;
	fonts: Record<string, Record<string, Record<string, string>>>;
};

interface WithResolvers<T> {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void;
}

export const withResolvers = function <T>() {
	let resolve: WithResolvers<T>['resolve'];
	let reject: WithResolvers<T>['reject'];
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return {promise, resolve: resolve!, reject: reject!};
};

const loadFontFaceOrTimeoutAfter20Seconds = (fontFace: FontFace) => {
	const timeout = withResolvers();

	const int = setTimeout(() => {
		timeout.reject(new Error('Timed out loading Google Font'));
	}, 18_000);

	return Promise.race([
		fontFace.load().then(() => {
			clearTimeout(int);
		}),
		timeout.promise,
	]);
};

type FontLoadOptions = {
	document?: Document;
	ignoreTooManyRequestsWarning?: boolean;
};

type V4Options = FontLoadOptions & {
	weights?: string[];
	subsets?: string[];
};

// weights and subsets are required in v5
type V5Options = FontLoadOptions & {
	weights: string[];
	subsets: string[];
};

/**
 * @description Load a Google Font for use in Remotion.
 * @param meta
 * @param {string} style The font style we want to load. While each font has a different set of styles, common options are: normal, italic etc.
 * @param {Array} options
 * @returns An object with the following properties: fontFamily, unicodeRanges, fonts
 * @see [Documentation](https://www.remotion.dev/docs/google-fonts/load-font)
 */
export const loadFonts = (
	meta: FontInfo,
	style?: string,
	// TODO: Before release of v5, change `extends false` to `extends true`
	options?: typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES extends false
		? V5Options
		: V4Options,
): {
	fontFamily: FontInfo['fontFamily'];
	fonts: FontInfo['fonts'];
	unicodeRanges: FontInfo['unicodeRanges'];
	waitUntilDone: () => Promise<undefined>;
} => {
	const weightsAndSubsetsAreSpecified =
		Array.isArray(options?.weights) &&
		Array.isArray(options?.subsets) &&
		options.weights.length > 0 &&
		options.subsets.length > 0;

	if (
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES &&
		!weightsAndSubsetsAreSpecified
	) {
		throw new Error(
			'Loading Google Fonts without specifying weights and subsets is not supported in Remotion v5. Please specify the weights and subsets you need.',
		);
	}

	const promises: Promise<void>[] = [];
	const styles = style ? [style] : Object.keys(meta.fonts);

	let fontsLoaded = 0;

	for (const style of styles) {
		// Don't load fonts on server
		if (typeof FontFace === 'undefined') {
			continue;
		}

		if (!meta.fonts[style]) {
			throw new Error(
				`The font ${meta.fontFamily} does not have a style ${style}`,
			);
		}
		const weights = options?.weights ?? Object.keys(meta.fonts[style]);
		for (const weight of weights) {
			if (!meta.fonts[style][weight]) {
				throw new Error(
					`The font ${meta.fontFamily} does not  have a weight ${weight} in style ${style}`,
				);
			}
			const subsets =
				options?.subsets ?? Object.keys(meta.fonts[style][weight]);
			for (const subset of subsets) {
				//  Get font url from meta
				let font = meta.fonts[style]?.[weight]?.[subset];

				//  Check is font available in meta
				if (!font) {
					throw new Error(
						`weight: ${weight} subset: ${subset} is not available for '${meta.fontFamily}'`,
					);
				}

				//  Check is font already loaded
				let fontKey = `${meta.fontFamily}-${style}-${weight}-${subset}`;
				const previousPromise = loadedFonts[fontKey];
				if (previousPromise) {
					promises.push(previousPromise);
					continue;
				}

				const baseLabel = `Fetching ${meta.fontFamily} font ${JSON.stringify({
					style,
					weight,
					subset,
				})}`;

				const label = weightsAndSubsetsAreSpecified
					? baseLabel
					: `${baseLabel}. This might be caused by loading too many font variations. Read more: https://www.remotion.dev/docs/troubleshooting/font-loading-errors#render-timeout-when-loading-google-fonts`;

				const handle = delayRender(label, {timeoutInMilliseconds: 60000});
				fontsLoaded++;

				//  Create font-face
				const fontFace = new FontFace(
					meta.fontFamily,
					`url(${font}) format('woff2')`,
					{
						weight: weight,
						style: style,
						unicodeRange: meta.unicodeRanges[subset],
					},
				);

				let attempts = 2;

				const tryToLoad = () => {
					//  Load font-face
					if (fontFace.status === 'loaded') {
						continueRender(handle);
						return;
					}

					const promise = loadFontFaceOrTimeoutAfter20Seconds(fontFace)
						.then(() => {
							(options?.document ?? document).fonts.add(fontFace);
							continueRender(handle);
						})
						.catch((err) => {
							//  Mark font as not loaded
							loadedFonts[fontKey] = undefined;
							if (attempts === 0) {
								throw err;
							} else {
								attempts--;
								tryToLoad();
							}
						});

					//  Mark font as loaded
					loadedFonts[fontKey] = promise;

					promises.push(promise);
				};

				tryToLoad();
			}
		}

		if (fontsLoaded > 20) {
			console.warn(
				`Made ${fontsLoaded} network requests to load fonts for ${meta.fontFamily}. Consider loading fewer weights and subsets by passing options to loadFont(). Disable this warning by passing "ignoreTooManyRequestsWarning: true" to "options".`,
			);
		}
	}

	return {
		fontFamily: meta.fontFamily,
		fonts: meta.fonts,
		unicodeRanges: meta.unicodeRanges,
		waitUntilDone: () => Promise.all<void>(promises).then(() => undefined),
	};
};
