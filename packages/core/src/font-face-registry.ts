export type RegisteredFontFace = {
	fontFamily: string;
	fontUrl: string;
	format: 'woff2' | 'woff' | 'opentype' | 'truetype';
	style: string | null;
	weight: string | null;
	stretch: string | null;
	unicodeRange: string | null;
};

const registeredFontFaces: RegisteredFontFace[] = [];

export const registerFontFace = (fontFace: RegisteredFontFace) => {
	if (
		registeredFontFaces.some(
			(registered) =>
				registered.fontFamily === fontFace.fontFamily &&
				registered.fontUrl === fontFace.fontUrl &&
				registered.format === fontFace.format &&
				registered.style === fontFace.style &&
				registered.weight === fontFace.weight &&
				registered.stretch === fontFace.stretch &&
				registered.unicodeRange === fontFace.unicodeRange,
		)
	) {
		return;
	}

	registeredFontFaces.push(fontFace);
};

export const getRegisteredFontFaces = (): RegisteredFontFace[] => {
	return registeredFontFaces.slice();
};
