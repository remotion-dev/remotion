type LengthPercentage = {
	unit: '%' | 'px';
	value: number;
};

const firstLayer = (value: string) => value.split(',')[0].trim();

export const parseLengthPercentage = (
	value: string,
): LengthPercentage | null => {
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
	intrinsicSize,
}: {
	backgroundPosition: string;
	backgroundSize: string;
	positioningArea: DOMRect;
	intrinsicSize: {width: number; height: number} | null;
}) => {
	const [x, y = 'auto'] = firstLayer(backgroundSize).split(/\s+/);
	let width: number;
	let height: number;
	if (
		intrinsicSize &&
		(backgroundSize === 'contain' || backgroundSize === 'cover')
	) {
		const factor = (backgroundSize === 'contain' ? Math.min : Math.max)(
			positioningArea.width / intrinsicSize.width,
			positioningArea.height / intrinsicSize.height,
		);
		width = intrinsicSize.width * factor;
		height = intrinsicSize.height * factor;
	} else if (intrinsicSize && x === 'auto' && y === 'auto') {
		({width, height} = intrinsicSize);
	} else if (intrinsicSize && x === 'auto') {
		height = resolveSize({containerSize: positioningArea.height, value: y});
		width = (height * intrinsicSize.width) / intrinsicSize.height;
	} else {
		width = resolveSize({containerSize: positioningArea.width, value: x});
		height =
			intrinsicSize && y === 'auto'
				? (width * intrinsicSize.height) / intrinsicSize.width
				: resolveSize({containerSize: positioningArea.height, value: y});
	}

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
