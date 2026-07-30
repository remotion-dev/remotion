export type SelectionRectangle = {
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly width: number;
	readonly height: number;
};

const containsRectangle = (element: Element, selection: SelectionRectangle) => {
	const rect = element.getBoundingClientRect();
	const tolerance = 0.5;
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		rect.left <= selection.left + tolerance &&
		rect.top <= selection.top + tolerance &&
		rect.right >= selection.right - tolerance &&
		rect.bottom >= selection.bottom - tolerance
	);
};

const getDepth = (element: Element) => {
	let depth = 0;
	let current: Element | null = element;
	while (current) {
		depth++;
		current = current.parentElement;
	}

	return depth;
};

export const findLowestElementContainingRectangle = ({
	selection,
	excludedElement,
}: {
	readonly selection: SelectionRectangle;
	readonly excludedElement: Element;
}) => {
	const inset = Math.min(1, selection.width / 4, selection.height / 4);
	const points = [
		[selection.left + inset, selection.top + inset],
		[selection.right - inset, selection.top + inset],
		[selection.left + inset, selection.bottom - inset],
		[selection.right - inset, selection.bottom - inset],
		[
			selection.left + selection.width / 2,
			selection.top + selection.height / 2,
		],
	] as const;
	const candidates = new Set<Element>();

	for (const [x, y] of points) {
		for (const hit of document.elementsFromPoint(x, y)) {
			let current: Element | null = hit;
			while (current) {
				if (current !== excludedElement && !excludedElement.contains(current)) {
					candidates.add(current);
				}

				current = current.parentElement;
			}
		}
	}

	return (
		[...candidates]
			.filter((element) => containsRectangle(element, selection))
			.sort((a, b) => {
				const depthDifference = getDepth(b) - getDepth(a);
				if (depthDifference !== 0) {
					return depthDifference;
				}

				const aRect = a.getBoundingClientRect();
				const bRect = b.getBoundingClientRect();
				return aRect.width * aRect.height - bRect.width * bRect.height;
			})[0] ?? null
	);
};

export const makeSelectionRectangle = (
	startX: number,
	startY: number,
	endX: number,
	endY: number,
): SelectionRectangle => {
	const left = Math.min(startX, endX);
	const top = Math.min(startY, endY);
	const right = Math.max(startX, endX);
	const bottom = Math.max(startY, endY);
	return {
		left,
		top,
		right,
		bottom,
		width: right - left,
		height: bottom - top,
	};
};
