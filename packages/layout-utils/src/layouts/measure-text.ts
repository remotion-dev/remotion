export type Dimensions = {
	width: number;
	height: number;
};

export type ModifyableCSSProperties<T = Partial<CSSStyleDeclaration>> = {
	[P in keyof T as P extends 'length'
		? never
		: P extends keyof CSSPropertiesOnWord
			? never
			: T[P] extends string | number
				? P
				: never]: T[P];
};

type CSSPropertiesOnWord = {
	fontFamily: string;
	fontSize: number | string;
	fontWeight?: number | string;
	letterSpacing?: string;
	fontVariantNumeric?: string;
};

export type Word = {
	text: string;
	validateFontIsLoaded?: boolean;
	additionalElementStyles?: ModifyableCSSProperties;
} & CSSPropertiesOnWord;

const wordCache = new Map<string, Dimensions>();

const takeMeasurement = ({
	text,
	fontFamily,
	fontSize,
	fontWeight,
	letterSpacing,
	fontVariantNumeric,
	additionalElementStyles,
}: Omit<Word, 'fontFamily'> & {fontFamily: string | null}): {
	boundingBox: DOMRect;
	computedFontFamily: string;
} => {
	if (typeof document === 'undefined') {
		throw new Error('measureText() can only be called in a browser.');
	}

	const node = document.createElement('span');

	if (fontFamily) {
		node.style.fontFamily = fontFamily;
	}

	node.style.display = 'inline-block';
	node.style.position = 'absolute';
	node.style.top = `-10000px`;
	node.style.whiteSpace = 'pre';
	node.style.fontSize =
		typeof fontSize === 'string' ? fontSize : `${fontSize}px`;

	if (additionalElementStyles) {
		for (const key of Object.keys(
			additionalElementStyles,
		) as (keyof typeof additionalElementStyles)[]) {
			node.style[key] = additionalElementStyles[key];
		}
	}

	if (fontWeight) {
		node.style.fontWeight = fontWeight.toString();
	}

	if (letterSpacing) {
		node.style.letterSpacing = letterSpacing;
	}

	if (fontVariantNumeric) {
		node.style.fontVariantNumeric = fontVariantNumeric;
	}

	node.innerText = text;

	document.body.appendChild(node);
	const computedFontFamily = window.getComputedStyle(node).fontFamily;
	const boundingBox = node.getBoundingClientRect();
	document.body.removeChild(node);

	return {
		boundingBox,
		computedFontFamily,
	};
};

export const measureText = ({
	text,
	fontFamily,
	fontSize,
	fontWeight,
	letterSpacing,
	fontVariantNumeric,
	validateFontIsLoaded,
	additionalElementStyles,
}: Word): Dimensions => {
	const key = `${text}-${fontFamily}-${fontWeight}-${fontSize}-${letterSpacing}`;

	if (wordCache.has(key)) {
		return wordCache.get(key) as Dimensions;
	}

	const {boundingBox, computedFontFamily} = takeMeasurement({
		fontFamily,
		fontSize,
		text,
		fontVariantNumeric,
		fontWeight,
		letterSpacing,
		additionalElementStyles,
	});

	if (validateFontIsLoaded) {
		const {
			boundingBox: boundingBoxOfFallbackFont,
			computedFontFamily: computedFallback,
		} = takeMeasurement({
			fontFamily: null,
			fontSize,
			text,
			fontVariantNumeric,
			fontWeight,
			letterSpacing,
			additionalElementStyles,
		});

		const sameAsFallbackFont =
			boundingBox.height === boundingBoxOfFallbackFont.height &&
			boundingBox.width === boundingBoxOfFallbackFont.width;

		if (sameAsFallbackFont && computedFallback !== computedFontFamily) {
			const err = [
				`Called measureText() with "fontFamily": ${JSON.stringify(
					fontFamily,
				)} but it looks like the font is not loaded at the time of calling.`,
				`A measurement with the fallback font ${computedFallback} was taken and had the same dimensions, indicating that the browser used the fallback font.`,
				'See https://remotion.dev/docs/layout-utils/best-practices for best practices.',
			];
			throw new Error(err.join('\n'));
		}
	}

	const result = {height: boundingBox.height, width: boundingBox.width};
	wordCache.set(key, result);
	return result;
};
