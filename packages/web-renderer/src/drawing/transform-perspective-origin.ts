export type Transform = {
	matrices: DOMMatrix[];
	element: Element;
	transformOrigin: string;
	boundingClientRect: DOMRect | null;
};

export const parseTransformOriginOrPerspectiveOrigin = (
	transformOrigin: string,
) => {
	if (transformOrigin.trim() === '') {
		return null;
	}

	const [x, y] = transformOrigin.split(' ');
	return {x: parseFloat(x), y: parseFloat(y)};
};

const getInternalOrigin = (origin: string, boundingClientRect: DOMRect) => {
	return (
		parseTransformOriginOrPerspectiveOrigin(origin) ?? {
			x: boundingClientRect.width / 2,
			y: boundingClientRect.height / 2,
		}
	);
};

export const getAbsoluteOrigin = ({
	origin,
	boundingClientRect,
}: {
	origin: string;
	boundingClientRect: DOMRect;
}) => {
	const {x, y} = getInternalOrigin(origin, boundingClientRect);

	return {
		x: x + boundingClientRect.left,
		y: y + boundingClientRect.top,
	};
};
