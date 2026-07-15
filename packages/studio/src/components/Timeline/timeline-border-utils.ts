import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

export const BORDER_STYLE_KEYWORDS = [
	'none',
	'hidden',
	'solid',
	'dashed',
	'dotted',
	'double',
	'groove',
	'ridge',
	'inset',
	'outset',
] as const;

export type BorderStyleKeyword = (typeof BORDER_STYLE_KEYWORDS)[number];

export type ParsedBorder = {
	readonly width: number;
	readonly widthUnit: string;
	readonly style: BorderStyleKeyword;
	readonly color: string;
};

const borderStyleKeywordSet = new Set<string>(BORDER_STYLE_KEYWORDS);

const WIDTH_PATTERN = /^(-?\d*\.?\d+)([a-z%]*)$/i;

// CSS line-width keywords resolve to fixed pixel widths so they can be shown
// in the numeric width control.
const LINE_WIDTH_KEYWORDS: Record<string, number> = {
	thin: 1,
	medium: 3,
	thick: 5,
};
const borderDecimalPlaces = 2;

export const DEFAULT_BORDER: ParsedBorder = {
	width: 1,
	widthUnit: 'px',
	style: 'solid',
	color: '#000000',
};

// Split on whitespace, but keep parenthesized groups (e.g. rgba(24, 24, 27, 0.08))
// together so the color token is not broken apart.
const tokenizeBorder = (value: string): string[] => {
	const tokens: string[] = [];
	let depth = 0;
	let current = '';

	for (const char of value.trim()) {
		if (char === '(') {
			depth++;
		} else if (char === ')') {
			depth = Math.max(0, depth - 1);
		}

		if (/\s/.test(char) && depth === 0) {
			if (current !== '') {
				tokens.push(current);
				current = '';
			}
		} else {
			current += char;
		}
	}

	if (current !== '') {
		tokens.push(current);
	}

	return tokens;
};

export const parseBorder = (value: unknown): ParsedBorder => {
	if (typeof value !== 'string') {
		return DEFAULT_BORDER;
	}

	const tokens = tokenizeBorder(value);
	if (tokens.length === 0) {
		return DEFAULT_BORDER;
	}

	let {width, widthUnit, style} = DEFAULT_BORDER;
	let styleFound = false;
	let widthFound = false;
	const colorTokens: string[] = [];

	for (const token of tokens) {
		if (!styleFound && borderStyleKeywordSet.has(token.toLowerCase())) {
			style = token.toLowerCase() as BorderStyleKeyword;
			styleFound = true;
			continue;
		}

		const keywordWidth = LINE_WIDTH_KEYWORDS[token.toLowerCase()];
		if (!widthFound && keywordWidth !== undefined) {
			width = keywordWidth;
			widthUnit = 'px';
			widthFound = true;
			continue;
		}

		const widthMatch = token.match(WIDTH_PATTERN);
		if (!widthFound && widthMatch) {
			width = normalizeTimelineNumber(Number(widthMatch[1]));
			widthUnit = widthMatch[2] === '' ? 'px' : widthMatch[2];
			widthFound = true;
			continue;
		}

		colorTokens.push(token);
	}

	return {
		width,
		widthUnit,
		style,
		color:
			colorTokens.length === 0 ? DEFAULT_BORDER.color : colorTokens.join(' '),
	};
};

const formatBorderWidth = (width: number, unit: string): string => {
	const normalized = normalizeTimelineNumber(width);
	const rounded = roundToDecimalPlaces(normalized, borderDecimalPlaces);
	return `${Object.is(rounded, -0) ? 0 : rounded}${unit}`;
};

export const serializeBorder = (parsed: ParsedBorder): string => {
	return `${formatBorderWidth(parsed.width, parsed.widthUnit)} ${parsed.style} ${parsed.color}`;
};
