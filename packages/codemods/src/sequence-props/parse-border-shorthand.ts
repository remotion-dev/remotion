export type ParsedBorderShorthand = {
	borderWidth: number;
	borderStyle: string;
	borderColor: string;
};

const BORDER_STYLES = new Set([
	'none',
	'hidden',
	'dotted',
	'dashed',
	'solid',
	'double',
	'groove',
	'ridge',
	'inset',
	'outset',
]);

const CSS_WIDE_KEYWORDS = new Set([
	'inherit',
	'initial',
	'revert',
	'revert-layer',
	'unset',
]);

const BORDER_WIDTH_KEYWORDS: Record<string, number> = {
	// Chromium resolves these CSS keywords to these pixel values.
	thin: 1,
	medium: 3,
	thick: 5,
};

const splitCssWhitespace = (value: string): string[] | null => {
	const parts: string[] = [];
	let current = '';
	let parenthesisDepth = 0;
	let quote: '"' | "'" | null = null;

	for (const char of value.trim()) {
		if (quote !== null) {
			current += char;
			if (char === quote) {
				quote = null;
			}

			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;
			current += char;
			continue;
		}

		if (char === '(') {
			parenthesisDepth++;
			current += char;
			continue;
		}

		if (char === ')') {
			parenthesisDepth--;
			if (parenthesisDepth < 0) {
				return null;
			}

			current += char;
			continue;
		}

		if (/\s/.test(char) && parenthesisDepth === 0) {
			if (current !== '') {
				parts.push(current);
				current = '';
			}

			continue;
		}

		current += char;
	}

	if (quote !== null || parenthesisDepth !== 0) {
		return null;
	}

	if (current !== '') {
		parts.push(current);
	}

	return parts;
};

const parsePixelWidth = (token: string): number | null => {
	if (token === '0') {
		return 0;
	}

	const match = token.match(/^(\d+(?:\.\d+)?|\.\d+)px$/i);
	if (!match) {
		return null;
	}

	return Number(match[1]);
};

export const parseBorderShorthand = (
	value: string,
): ParsedBorderShorthand | null => {
	const tokens = splitCssWhitespace(value);
	if (!tokens || tokens.length === 0) {
		return null;
	}

	let borderWidth: number | null = null;
	let borderStyle: string | null = null;
	let borderColor: string | null = null;

	for (const token of tokens) {
		const lowerCaseToken = token.toLowerCase();
		if (CSS_WIDE_KEYWORDS.has(lowerCaseToken)) {
			return null;
		}

		if (BORDER_STYLES.has(lowerCaseToken)) {
			if (borderStyle !== null) {
				return null;
			}

			borderStyle = lowerCaseToken;
			continue;
		}

		const width = parsePixelWidth(token);
		if (width !== null) {
			if (borderWidth !== null) {
				return null;
			}

			borderWidth = width;
			continue;
		}

		const keywordWidth = BORDER_WIDTH_KEYWORDS[lowerCaseToken];
		if (keywordWidth !== undefined) {
			if (borderWidth !== null) {
				return null;
			}

			borderWidth = keywordWidth;
			continue;
		}

		if (borderColor === null) {
			borderColor = token;
			continue;
		}

		return null;
	}

	return {
		borderWidth: borderWidth ?? BORDER_WIDTH_KEYWORDS.medium,
		borderStyle: borderStyle ?? 'none',
		borderColor: borderColor ?? 'currentColor',
	};
};
