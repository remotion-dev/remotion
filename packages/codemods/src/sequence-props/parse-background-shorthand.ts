import {NoReactInternals} from 'remotion/no-react';

export type ParsedBackgroundShorthand = {
	backgroundAttachment: string;
	backgroundClip: string;
	backgroundColor: string;
	backgroundImage: string;
	backgroundOrigin: string;
	backgroundPosition: string;
	backgroundRepeat: string;
	backgroundSize: string;
};

const CSS_WIDE_KEYWORDS = new Set([
	'inherit',
	'initial',
	'revert',
	'revert-layer',
	'unset',
]);

const makeColorOnlyBackground = (
	backgroundColor: string,
): ParsedBackgroundShorthand => {
	return {
		backgroundColor,
		backgroundImage: 'none',
		backgroundPosition: '0% 0%',
		backgroundSize: 'auto auto',
		backgroundRepeat: 'repeat',
		backgroundOrigin: 'padding-box',
		backgroundClip: 'border-box',
		backgroundAttachment: 'scroll',
	};
};

export const parseBackgroundShorthand = (
	value: string,
): ParsedBackgroundShorthand | null => {
	const trimmed = value.trim();
	const lowerCaseValue = trimmed.toLowerCase();

	if (trimmed === '' || CSS_WIDE_KEYWORDS.has(lowerCaseValue)) {
		return null;
	}

	if (lowerCaseValue === 'none') {
		return makeColorOnlyBackground('transparent');
	}

	try {
		NoReactInternals.processColor(trimmed);
		return makeColorOnlyBackground(trimmed);
	} catch {
		return null;
	}
};
