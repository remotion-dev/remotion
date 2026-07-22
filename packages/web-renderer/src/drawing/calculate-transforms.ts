import {hasAnyTransformCssValue, hasTransformCssValue} from './has-transform';
import {getMaskImageValue, parseMaskImage} from './mask-image';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {parseTransformOrigin} from './parse-transform-origin';

/**
 * CSS filters that affect children and require precompositing.
 * drop-shadow must be applied to the composite of parent + children,
 * not to individual draw operations.
 */
const filterRequiresPrecompositing = (filter: string): string | null => {
	if (!filter || filter === 'none') {
		return null;
	}

	// Check for drop-shadow filter - this requires precompositing
	// because the shadow should be based on the composite alpha of parent + children
	if (filter.includes('drop-shadow')) {
		return filter;
	}

	return null;
};

type Transform = {
	matrices: DOMMatrix[];
	element: Element;
	transformOrigin: string;
	boundingClientRect: DOMRect | null;
};

type TransformStyle = Pick<
	CSSStyleDeclaration,
	'display' | 'rotate' | 'scale' | 'transform' | 'transformOrigin'
>;

export type TransformStyleCache = WeakMap<Element, TransformStyle>;

const snapshotTransformStyle = (
	computedStyle: CSSStyleDeclaration,
): TransformStyle => {
	return {
		display: computedStyle.display,
		rotate: computedStyle.rotate,
		scale: computedStyle.scale,
		transform: computedStyle.transform,
		transformOrigin: computedStyle.transformOrigin,
	};
};

const makeScaleMatrix = (scale: string): DOMMatrix => {
	const values = scale.split(/\s+/).map(Number);

	if (values.some((value) => !Number.isFinite(value))) {
		throw new Error(`Could not parse CSS scale value: ${scale}`);
	}

	if (values.length === 1) {
		return new DOMMatrix().scaleSelf(values[0], values[0]);
	}

	if (values.length === 2) {
		return new DOMMatrix().scaleSelf(values[0], values[1]);
	}

	if (values.length === 3) {
		return new DOMMatrix().scaleSelf(values[0], values[1], values[2]);
	}

	throw new Error(`Could not parse CSS scale value: ${scale}`);
};

const isReplacedElement = (element: Element) => {
	return (
		element instanceof HTMLImageElement ||
		element instanceof HTMLVideoElement ||
		element instanceof HTMLCanvasElement ||
		element instanceof HTMLIFrameElement ||
		element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement ||
		element instanceof HTMLObjectElement ||
		element instanceof HTMLEmbedElement
	);
};

const canApplyCssTransforms = ({
	element,
	computedStyle,
}: {
	element: HTMLElement | SVGElement;
	computedStyle: Pick<CSSStyleDeclaration, 'display'>;
}) => {
	if (element instanceof SVGElement) {
		return true;
	}

	if (computedStyle.display !== 'inline') {
		return true;
	}

	return isReplacedElement(element);
};

const makeTransformResetter = (element: HTMLElement | SVGElement) => {
	const {transform, scale, rotate} = element.style;

	return (hasApplicableTransformCssValue: boolean) => {
		if (hasApplicableTransformCssValue) {
			element.style.transform = 'none';
			element.style.scale = 'none';
			element.style.rotate = 'none';
		}

		return () => {
			if (hasApplicableTransformCssValue) {
				element.style.transform = transform;
				element.style.scale = scale;
				element.style.rotate = rotate;
			}
		};
	};
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
	transformStyleCache,
}: {
	element: HTMLElement | SVGElement;
	rootElement: HTMLElement | SVGElement;
	transformStyleCache: TransformStyleCache;
}) => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGElement | null = element;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];

	let opacity = 1;
	let elementComputedStyle: CSSStyleDeclaration | null = null;
	let maskImageInfo: LinearGradientInfo | null = null;
	let filterForPrecompositing: string | null = null;
	while (parent) {
		// Each node walks its ancestors, so reuse their immutable transform fields
		// for the remainder of this composition.
		const cachedTransformStyle = transformStyleCache.get(parent);
		const shouldReadComputedStyle =
			parent === element || cachedTransformStyle === undefined;

		// Neutralize transition before reading computed style to prevent
		// CSS transitions from returning intermediate (t=0) transform values
		// when we set transform to 'none' for measurement
		const originalTransition = parent.style.transition;
		parent.style.transition = 'none';

		const computedStyle = shouldReadComputedStyle
			? getComputedStyle(parent)
			: null;
		const transformStyle =
			computedStyle === null
				? cachedTransformStyle!
				: snapshotTransformStyle(computedStyle);

		if (computedStyle !== null) {
			transformStyleCache.set(parent, transformStyle);
		}

		if (parent === element) {
			if (computedStyle === null) {
				throw new Error('Element computed style not found');
			}

			elementComputedStyle = computedStyle;
			opacity = parseFloat(computedStyle.opacity);
			const maskImageValue = getMaskImageValue(computedStyle);
			maskImageInfo = maskImageValue ? parseMaskImage(maskImageValue) : null;
			filterForPrecompositing = filterRequiresPrecompositing(
				computedStyle.filter,
			);

			const originalMaskImage = parent.style.maskImage;
			const originalWebkitMaskImage = parent.style.webkitMaskImage;
			parent.style.maskImage = 'none';
			parent.style.webkitMaskImage = 'none';

			// Neutralize filter if it requires precompositing to prevent double-application
			const originalFilter = parent.style.filter;
			if (filterForPrecompositing) {
				parent.style.filter = 'none';
			}

			const parentRef = parent;

			toReset.push(() => {
				parentRef!.style.maskImage = originalMaskImage;
				parentRef!.style.webkitMaskImage = originalWebkitMaskImage;
				if (filterForPrecompositing) {
					parentRef!.style.filter = originalFilter;
				}
			});
		}

		const hasApplicableTransformCssValue =
			canApplyCssTransforms({computedStyle: transformStyle, element: parent}) &&
			hasAnyTransformCssValue(transformStyle);

		if (hasApplicableTransformCssValue || parent === element) {
			const toParse =
				hasApplicableTransformCssValue && hasTransformCssValue(transformStyle)
					? transformStyle.transform
					: undefined;
			const matrix = new DOMMatrix(toParse);

			const resetTransforms = makeTransformResetter(parent);
			const {rotate} = parent.style;
			const additionalMatrices: DOMMatrix[] = [];

			// The order of transformations is:
			// 1. Translate --> We do not have to consider it since it changes getClientBoundingRect()
			// 2. Rotate
			// 3. Scale
			// 4. CSS "transform"
			if (
				hasApplicableTransformCssValue &&
				rotate !== '' &&
				rotate !== 'none'
			) {
				additionalMatrices.push(new DOMMatrix(`rotate(${rotate})`));
			}

			if (
				hasApplicableTransformCssValue &&
				transformStyle.scale !== '' &&
				transformStyle.scale !== 'none'
			) {
				additionalMatrices.push(makeScaleMatrix(transformStyle.scale));
			}

			additionalMatrices.push(matrix);

			const cleanup = resetTransforms(hasApplicableTransformCssValue);

			transforms.push({
				element: parent,
				transformOrigin: transformStyle.transformOrigin,
				boundingClientRect: null,
				matrices: additionalMatrices,
			});
			const parentRef = parent;
			toReset.push(() => {
				cleanup();
				parentRef!.style.transition = originalTransition;
			});
		} else {
			const parentRef = parent;
			toReset.push(() => {
				parentRef!.style.transition = originalTransition;
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
	const needsFilterPrecompositing = filterForPrecompositing !== null;

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
			needsFilterPrecompositing: filterForPrecompositing,
			needsPrecompositing: Boolean(
				needs3DTransformViaWebGL || needsMaskImage || needsFilterPrecompositing,
			),
		},
	};
};
