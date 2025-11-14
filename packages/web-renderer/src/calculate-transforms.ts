import {parseTransformOrigin} from './parse-transform-origin';

type Transform = {
	matrix: DOMMatrix;
	rect: HTMLElement | SVGSVGElement;
	transformOrigin: string;
	boundingClientRect: DOMRect | null;
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
			const matrix = new DOMMatrix(computedStyle.transform);
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

	const svgDimensions = transforms[0].boundingClientRect!;
	const nativeTransformOrigin = parseTransformOrigin(
		transforms[0].transformOrigin,
	);

	let totalMatrix = new DOMMatrix();
	for (const transform of transforms.slice().reverse()) {
		const {x: originX, y: originY} = parseTransformOrigin(
			transform.transformOrigin,
		);

		if (!transform.boundingClientRect) {
			throw new Error('Bounding client rect not found');
		}

		const centerX = transform.boundingClientRect.width / 2;
		const centerY = transform.boundingClientRect.height / 2;

		const deviationFromX = centerX - originX;
		const deviationFromY = centerY - originY;

		totalMatrix = totalMatrix
			.translate(-deviationFromX, -deviationFromY)
			.multiply(transform.matrix)
			.translate(deviationFromX, deviationFromY);
	}

	return {
		svgDimensions,
		totalMatrix,
		reset: () => {
			for (const reset of toReset) {
				reset();
			}
		},
		nativeTransformOrigin,
	};
};
