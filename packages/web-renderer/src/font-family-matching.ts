import {NoReactInternals} from 'remotion/no-react';
import {parseFontFamilies} from './drawing/parse-font-families';

// Pending buffer-source FontFace family strings can be literal (Chromium/WebKit)
// or CSS-parsed (Firefox). Preserve both possibilities, including literal spaces.
export const fontFamilyAliases = (value: string): string[] => {
	const parsed = parseFontFamilies(value);
	return [
		...new Set([value.toLowerCase(), ...(parsed.length === 1 ? parsed : [])]),
	];
};

const literalFamily = (value: string): string | null => {
	const parsed = parseFontFamilies(value);
	const literal = value.toLowerCase();
	return parsed.length === 1 && parsed[0] === literal && !/["'\\,]/.test(value)
		? literal
		: null;
};

// A quoted getter is not universal CSS serialization: a buffer-created face can
// literally contain those quotes. Known SDK constructor input resolves only the
// unambiguous case, and only while the actual getter remains unchanged.
export const certainNativeFontFamily = (face: FontFace): string | null => {
	const direct = literalFamily(face.family);
	if (direct !== null) return direct;
	const input = NoReactInternals.getFontFaceFamilyInput(face);
	return input === null ? null : literalFamily(input);
};
