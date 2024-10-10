export type Position = {
	x: number;
	y: number;
};

export const paddingAndMargin = 20;
const height = 360;
const width = 640;
export const cardHeight = (height - paddingAndMargin * 3) / 2;
export const cardWidth = (width - paddingAndMargin * 3) / 2;

export const getPositionForIndex = (index: number): Position => {
	const x =
		index % 2 === 0 ? paddingAndMargin : cardWidth + paddingAndMargin * 2;
	const y = index < 2 ? paddingAndMargin : cardHeight + paddingAndMargin * 2;

	return {x, y};
};

export const getInitialPositions = () => {
	return new Array(4).fill(true).map((_, i) => getPositionForIndex(i));
};

export const getIndexFromPosition = (clientX: number, clientY: number) => {
	const left = clientX < cardWidth / 2 + paddingAndMargin;
	const top = clientY < cardHeight / 2 + paddingAndMargin;

	if (left && top) {
		return 0;
	}

	if (!left && top) {
		return 1;
	}

	if (left && !top) {
		return 2;
	}

	if (!left && !top) {
		return 3;
	}
};
