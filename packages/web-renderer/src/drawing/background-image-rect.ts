type LengthPercentage = {
	unit: '%' | 'px';
	value: number;
};

const firstLayer = (value: string) => value.split(',')[0].trim();

const parseLengthPercentage = (value: string): LengthPercentage | null => {
	const match = value.match(/^(-?(?:\d+\.?\d*|\.\d+))(%|px)$/);
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

const resolveSize = ({
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

const resolvePosition = ({
	containerSize,
	imageSize,
	value,
}: {
	containerSize: number;
	imageSize: number;
	value: string;
}) => {
	const keywordPercentage = positionKeywordToPercentage(value);
	if (keywordPercentage !== null) {
		return (containerSize - imageSize) * (keywordPercentage / 100);
	}

	const parsed = parseLengthPercentage(value);
	if (!parsed) {
		return 0;
	}

	return parsed.unit === '%'
		? (containerSize - imageSize) * (parsed.value / 100)
		: parsed.value;
};

const parsePosition = (value: string) => {
	const parts = firstLayer(value).split(/\s+/);
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
