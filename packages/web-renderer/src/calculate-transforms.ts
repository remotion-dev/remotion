import {parseTransformOrigin} from './parse-transform-origin';

type Transform = {
	matrix: DOMMatrix;
	rect: HTMLElement | SVGSVGElement;
	transformOrigin: string;
	boundingClientRect: DOMRect | null;
};

const getInternalTransformOrigin = (transform: Transform) => {
	const centerX = transform.boundingClientRect!.width / 2;
	const centerY = transform.boundingClientRect!.height / 2;

	const origin = parseTransformOrigin(transform.transformOrigin) ?? {
		x: centerX,
		y: centerY,
	};

	return origin;
};

const getGlobalTransformOrigin = (transform: Transform) => {
	const {x: originX, y: originY} = getInternalTransformOrigin(transform);

	return {
		x: originX + transform.boundingClientRect!.left,
		y: originY + transform.boundingClientRect!.top,
	};
};

export const calculateTransforms = (element: HTMLElement | SVGSVGElement) => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGSVGElement | null = element;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];
	while (parent) {
		const computedStyle = getComputedStyle(parent);
		if (
			(computedStyle.transform && computedStyle.transform !== 'none') ||
			parent === element
		) {
			const toParse =
				computedStyle.transform === 'none' || computedStyle.transform === ''
					? undefined
					: computedStyle.transform;
			const matrix = new DOMMatrix(toParse);

			const {transform} = parent.style;
			parent.style.transform = 'none';

			transforms.push({
				matrix,
				rect: parent,
				transformOrigin: computedStyle.transformOrigin,
				boundingClientRect: null,
			});
			const parentRef = parent;
			toReset.push(() => {
				parentRef!.style.transform = transform;
			});
		}

		parent = parent.parentElement;
	}

	for (const transform of transforms) {
		transform.boundingClientRect = transform.rect.getBoundingClientRect();
	}

	const dimensions = transforms[0].boundingClientRect!;
	const nativeTransformOrigin = getInternalTransformOrigin(transforms[0]);

	let totalMatrix = new DOMMatrix();
	for (const transform of transforms.slice().reverse()) {
		if (!transform.boundingClientRect) {
			throw new Error('Bounding client rect not found');
		}

		const globalTransformOrigin = getGlobalTransformOrigin(transform);

		const transformedTransformOrigin = totalMatrix.transformPoint(
			new DOMPoint(globalTransformOrigin.x, globalTransformOrigin.y),
		);

		const transformMatrix = new DOMMatrix()
			.translate(transformedTransformOrigin.x, transformedTransformOrigin.y)
			.multiply(transform.matrix)
			.translate(-transformedTransformOrigin.x, -transformedTransformOrigin.y);

		totalMatrix = transformMatrix.multiply(totalMatrix);
	}

	return {
		dimensions,
		totalMatrix,
		reset: () => {
			for (const reset of toReset) {
				reset();
			}
		},
		nativeTransformOrigin,
	};
};
