import {hasAnyTransformCssValue, hasTransformCssValue} from './has-transform';
import {parseTransformOrigin} from './parse-transform-origin';

type Transform = {
	matrices: DOMMatrix[];
	element: Element;
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

const getGlobalTransformOrigin = ({
	transform,
	offsetLeft,
	offsetTop,
}: {
	transform: Transform;
	offsetLeft: number;
	offsetTop: number;
}) => {
	const {x: originX, y: originY} = getInternalTransformOrigin(transform);

	return {
		x: originX + transform.boundingClientRect!.left - offsetLeft,
		y: originY + transform.boundingClientRect!.top - offsetTop,
	};
};

export const calculateTransforms = ({
	element,
	offsetLeft,
	offsetTop,
}: {
	element: HTMLElement | SVGElement;
	offsetLeft: number;
	offsetTop: number;
}) => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGElement | null = element;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];

	let elementComputedStyle: CSSStyleDeclaration | null = null;
	while (parent) {
		const computedStyle = getComputedStyle(parent);

		if (parent === element) {
			elementComputedStyle = computedStyle;
		}

		if (hasAnyTransformCssValue(computedStyle) || parent === element) {
			const toParse = hasTransformCssValue(computedStyle)
				? computedStyle.transform
				: undefined;
			const matrix = new DOMMatrix(toParse);

			const {transform, scale, rotate} = parent.style;
			const additionalMatrices: DOMMatrix[] = [];

			// The order of transformations is:
			// 1. Translate --> We do not have to consider it since it changes getClientBoundingRect()
			// 2. Rotate
			// 3. Scale
			// 4. CSS "transform"
			if (rotate !== '' && rotate !== 'none') {
				additionalMatrices.push(new DOMMatrix(`rotate(${rotate})`));
			}

			if (scale !== '' && scale !== 'none') {
				additionalMatrices.push(new DOMMatrix(`scale(${scale})`));
			}

			additionalMatrices.push(matrix);

			parent.style.transform = 'none';
			parent.style.scale = 'none';
			parent.style.rotate = 'none';

			transforms.push({
				element: parent,
				transformOrigin: computedStyle.transformOrigin,
				boundingClientRect: null,
				matrices: additionalMatrices,
			});
			const parentRef = parent;
			toReset.push(() => {
				parentRef!.style.transform = transform;
				parentRef!.style.scale = scale;
				parentRef!.style.rotate = rotate;
			});
		}

		parent = parent.parentElement;
	}

	for (const transform of transforms) {
		transform.boundingClientRect = transform.element.getBoundingClientRect();
	}

	const dimensions = transforms[0].boundingClientRect!;
	const nativeTransformOrigin = getInternalTransformOrigin(transforms[0]);

	const totalMatrix = new DOMMatrix();
	for (const transform of transforms.slice().reverse()) {
		for (const matrix of transform.matrices) {
			const globalTransformOrigin = getGlobalTransformOrigin({
				transform,
				offsetLeft,
				offsetTop,
			});

			const transformMatrix = new DOMMatrix()
				.translate(globalTransformOrigin.x, globalTransformOrigin.y)
				.multiply(matrix)
				.translate(-globalTransformOrigin.x, -globalTransformOrigin.y);

			totalMatrix.multiplySelf(transformMatrix);
		}
	}

	if (!elementComputedStyle) {
		throw new Error('Element computed style not found');
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
		computedStyle: elementComputedStyle,
		opacity:
			elementComputedStyle.opacity && elementComputedStyle.opacity !== ''
				? parseFloat(elementComputedStyle.opacity)
				: 1,
	};
};
