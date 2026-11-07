type LengthPercentage = {
	unit: '%' | 'px';
	value: number;
};

const splitAtTopLevel = (value: string, separator: ',' | ' ') => {
	const parts: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < value.length; i++) {
		if (value[i] === '(') depth++;
		if (value[i] === ')') depth--;
		if (
			depth === 0 &&
			(separator === ',' ? value[i] === ',' : /\s/.test(value[i]))
		) {
			const part = value.slice(start, i).trim();
			if (part) parts.push(part);
			start = i + 1;
		}
	}

	parts.push(value.slice(start).trim());
	return parts;
};

const firstLayer = (value: string) => splitAtTopLevel(value, ',')[0];

export const parseLengthPercentage = (
	value: string,
): LengthPercentage | null => {
	const match = value.match(
		/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|px)$/i,
	);
	if (match) {
		return {
			unit: match[2] as LengthPercentage['unit'],
			value: Number(match[1]),
		};
	}

	if (value === '0') {
		return {unit: 'px', value: 0};
	}

	return null;
};

export const resolveSize = ({
	containerSize,
	value,
}: {
	containerSize: number;
	value: string | undefined;
}) => {
	if (value === undefined || value === 'auto') {
		return containerSize;
	}

	const parsed = parseLengthPercentage(value);
	if (!parsed) {
		return containerSize;
	}

	return parsed.unit === '%'
		? containerSize * (parsed.value / 100)
		: parsed.value;
};

const positionKeywordToPercentage = (value: string) => {
	if (value === 'left' || value === 'top') {
		return 0;
	}

	if (value === 'center') {
		return 50;
	}

	if (value === 'right' || value === 'bottom') {
		return 100;
	}

	return null;
};

export const resolvePosition = ({
	containerSize,
	imageSize,
	value,
}: {
	containerSize: number;
	imageSize: number;
	value: string;
}): number => {
	const keywordPercentage = positionKeywordToPercentage(value);
	if (keywordPercentage !== null) {
		return (containerSize - imageSize) * (keywordPercentage / 100);
	}

	if (value.startsWith('calc(')) {
		// Keep computed sums fast, without treating other math as a sum.
		const expression = value.slice(5, -1).replace(/\s/g, '');
		const terms = expression.match(
			/[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:%|px)/gi,
		);
		if (terms && terms.join('') === expression) {
			return terms.reduce(
				(sum, term) =>
					sum + resolvePosition({containerSize, imageSize, value: term}),
				0,
			);
		}
	}

	if (value.includes('(')) {
		// Resolve percentages against the fitted content's free space before
		// letting the browser evaluate nested CSS math. The free space can be
		// negative for cover/none, so an element width cannot represent the basis.
		const pixels = value.replace(
			/([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)%/gi,
			(_, number) =>
				`${(Number(number) * (containerSize - imageSize)) / 100}px`,
		);
		if (typeof CSSNumericValue !== 'undefined') {
			return CSSNumericValue.parse(pixels).to('px').value;
		}

		// Without Typed OM, resolve the same absolute-length expression
		// through the browser's computed style.
		const probe = document.createElement('div');
		probe.style.cssText =
			'all: initial !important; position: fixed !important; visibility: hidden !important; contain: strict !important;';
		probe.style.setProperty('left', pixels, 'important');
		document.body.appendChild(probe);
		try {
			return parseFloat(getComputedStyle(probe).left);
		} finally {
			probe.remove();
		}
	}

	const parsed = parseLengthPercentage(value);
	if (!parsed) {
		return 0;
	}

	return parsed.unit === '%'
		? (containerSize - imageSize) * (parsed.value / 100)
		: parsed.value;
};

export const parsePosition = (value: string) => {
	const parts = splitAtTopLevel(firstLayer(value), ' ');
	if (parts.length === 1) {
		if (parts[0] === 'top' || parts[0] === 'bottom') {
			return {x: 'center', y: parts[0]};
		}

		return {x: parts[0], y: 'center'};
	}

	if (parts[0] === 'top' || parts[0] === 'bottom') {
		return {x: parts[1], y: parts[0]};
	}

	return {x: parts[0], y: parts[1]};
};

export const getBackgroundImageRect = ({
	backgroundPosition,
	backgroundSize,
	positioningArea,
}: {
	backgroundPosition: string;
	backgroundSize: string;
	positioningArea: DOMRect;
}) => {
	const sizeParts = firstLayer(backgroundSize).split(/\s+/);
	const width = resolveSize({
		containerSize: positioningArea.width,
		value: sizeParts[0],
	});
	const height = resolveSize({
		containerSize: positioningArea.height,
		value: sizeParts[1],
	});
	const position = parsePosition(backgroundPosition);

	return new DOMRect(
		positioningArea.left +
			resolvePosition({
				containerSize: positioningArea.width,
				imageSize: width,
				value: position.x,
			}),
		positioningArea.top +
			resolvePosition({
				containerSize: positioningArea.height,
				imageSize: height,
				value: position.y,
			}),
		width,
		height,
	);
};
