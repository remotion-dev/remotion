import {hasAnyTransformCssValue, hasTransformCssValue} from './has-transform';
import {getMaskImageValue, parseMaskImage} from './mask-image';
import type {LinearGradientInfo} from './parse-linear-gradient';
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

const getGlobalTransformOrigin = ({transform}: {transform: Transform}) => {
	const {x: originX, y: originY} = getInternalTransformOrigin(transform);

	return {
		x: originX + transform.boundingClientRect!.left,
		y: originY + transform.boundingClientRect!.top,
	};
};

export const calculateTransforms = ({
	element,
	rootElement,
}: {
	element: HTMLElement | SVGElement;
	rootElement: HTMLElement | SVGElement;
}) => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGElement | null = element;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];

	let opacity = 1;
	let elementComputedStyle: CSSStyleDeclaration | null = null;
	let maskImageInfo: LinearGradientInfo | null = null;
	while (parent) {
		const computedStyle = getComputedStyle(parent);

		if (parent === element) {
			elementComputedStyle = computedStyle;
			opacity = parseFloat(computedStyle.opacity);
			const maskImageValue = getMaskImageValue(computedStyle);
			maskImageInfo = maskImageValue ? parseMaskImage(maskImageValue) : null;

			const originalMaskImage = parent.style.maskImage;
			const originalWebkitMaskImage = parent.style.webkitMaskImage;
			parent.style.maskImage = 'none';
			parent.style.webkitMaskImage = 'none';

			const parentRef = parent;

			toReset.push(() => {
				parentRef!.style.maskImage = originalMaskImage;
				parentRef!.style.webkitMaskImage = originalWebkitMaskImage;
			});
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

		if (parent === rootElement) {
			break;
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

	const needs3DTransformViaWebGL = !totalMatrix.is2D;
	const needsMaskImage = maskImageInfo !== null;

	return {
		dimensions,
		totalMatrix,
		[Symbol.dispose]: () => {
			for (const reset of toReset) {
				reset();
			}
		},
		nativeTransformOrigin,
		computedStyle: elementComputedStyle,
		opacity,
		maskImageInfo,
		precompositing: {
			needs3DTransformViaWebGL,
			needsMaskImage: maskImageInfo,
			needsPrecompositing: Boolean(needs3DTransformViaWebGL || needsMaskImage),
		},
	};
};
