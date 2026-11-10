import {getSvgClipForPrecompositing} from './clip-path';
import {hasAnyTransformCssValue, hasTransformCssValue} from './has-transform';
import {makeDOMMatrix} from './make-dom-matrix';
import {
	getMaskImageValue,
	type MaskImageInfo,
	parseMaskImage,
} from './mask-image';
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

// CSS mix-blend-mode keywords share their names with canvas composite
// operations, except plus-lighter which is called lighter on canvas.
export const getBlendMode = (
	mixBlendMode: string,
): GlobalCompositeOperation | null => {
	switch (mixBlendMode) {
		case 'multiply':
		case 'screen':
		case 'overlay':
		case 'darken':
		case 'lighten':
		case 'color-dodge':
		case 'color-burn':
		case 'hard-light':
		case 'soft-light':
		case 'difference':
		case 'exclusion':
		case 'hue':
		case 'saturation':
		case 'color':
		case 'luminosity':
			return mixBlendMode;
		case 'plus-lighter':
			return 'lighter';
		default:
			return null;
	}
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
> & {matrix: DOMMatrixReadOnly | null};

export type TransformStyleCache = WeakMap<Element, TransformStyle>;

const getTypedTransformMatrix = (
	element: Element,
): DOMMatrixReadOnly | null => {
	if (
		typeof CSSTransformValue === 'undefined' ||
		!('computedStyleMap' in element)
	)
		return null;
	const value = element.computedStyleMap().get('transform');
	if (!(value instanceof CSSTransformValue)) return null;
	try {
		const matrix = value.toMatrix();
		// Typed OM retains a 3D operation flag even when its coefficients are 2D.
		// Classify geometry without serializing away native coefficient precision.
		if (
			matrix.m13 === 0 &&
			matrix.m14 === 0 &&
			matrix.m23 === 0 &&
			matrix.m24 === 0 &&
			matrix.m31 === 0 &&
			matrix.m32 === 0 &&
			matrix.m33 === 1 &&
			matrix.m34 === 0 &&
			matrix.m43 === 0 &&
			matrix.m44 === 1
		) {
			return new DOMMatrixReadOnly([
				matrix.a,
				matrix.b,
				matrix.c,
				matrix.d,
				matrix.e,
				matrix.f,
			]);
		}

		return DOMMatrixReadOnly.fromMatrix(matrix);
	} catch (error) {
		// Typed OM cannot convert percentage translations to a pixel matrix.
		if (error instanceof TypeError) return null;
		throw error;
	}
};

const snapshotTransformStyle = (
	computedStyle: CSSStyleDeclaration,
	element: Element,
): TransformStyle => {
	return {
		display: computedStyle.display,
		rotate: computedStyle.rotate,
		scale: computedStyle.scale,
		transform: computedStyle.transform,
		matrix: hasTransformCssValue(computedStyle)
			? getTypedTransformMatrix(element)
			: null,
		transformOrigin: computedStyle.transformOrigin,
	};
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
	isolated,
}: {
	element: HTMLElement | SVGElement;
	rootElement: HTMLElement | SVGElement;
	transformStyleCache: TransformStyleCache;
	isolated: boolean;
}) => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGElement | null = element;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];

	let opacity = 1;
	let hasCssTransform = false;
	let elementComputedStyle: CSSStyleDeclaration | null = null;
	let maskImageInfo: MaskImageInfo | null = null;
	let svgClip: SVGClipPathElement | null = null;
	let filterForPrecompositing: string | null = null;
	let blendMode: GlobalCompositeOperation | null = null;
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
				: snapshotTransformStyle(computedStyle, parent);

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
			maskImageInfo = maskImageValue
				? parseMaskImage(maskImageValue, computedStyle)
				: null;

			svgClip = getSvgClipForPrecompositing(computedStyle.clipPath, parent);
			blendMode = getBlendMode(computedStyle.mixBlendMode);
			// In CSS, an element blends together with its descendants as one group,
			// and its filter and opacity apply to that group as a whole.
			const needsGroup = blendMode !== null || isolated || svgClip !== null;

			filterForPrecompositing =
				needsGroup && computedStyle.filter !== 'none'
					? computedStyle.filter
					: filterRequiresPrecompositing(computedStyle.filter);

			// An authored !important rule must also be neutralized while drawing the
			// group, then restored with its original inline priority.
			const overrides: [string, string][] = [
				['mask-image', 'none'],
				['-webkit-mask-image', 'none'],
			];
			if (svgClip) overrides.push(['clip-path', 'none']);
			if (needsGroup) {
				overrides.push(['mix-blend-mode', 'normal'], ['opacity', '1']);
			}

			if (filterForPrecompositing) overrides.push(['filter', 'none']);
			const {style} = parent;
			const originals = overrides.map(([property]) => ({
				property,
				value: style.getPropertyValue(property),
				priority: style.getPropertyPriority(property),
			}));
			for (const [property, value] of overrides) {
				style.setProperty(property, value, 'important');
			}

			toReset.push(() => {
				for (const {property, value, priority} of originals) {
					style.setProperty(property, value, priority);
				}
			});
		}

		const hasApplicableTransformCssValue =
			canApplyCssTransforms({computedStyle: transformStyle, element: parent}) &&
			hasAnyTransformCssValue(transformStyle);

		hasCssTransform ||= hasApplicableTransformCssValue;
		if (hasApplicableTransformCssValue || parent === element) {
			const toParse =
				hasApplicableTransformCssValue && hasTransformCssValue(transformStyle)
					? transformStyle.transform
					: undefined;
			const matrix =
				toParse && transformStyle.matrix
					? DOMMatrix.fromMatrix(transformStyle.matrix)
					: makeDOMMatrix(toParse);

			const resetTransforms = makeTransformResetter(parent);
			const {scale, rotate} = parent.style;
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
				additionalMatrices.push(makeDOMMatrix(`rotate(${rotate})`));
			}

			if (hasApplicableTransformCssValue && scale !== '' && scale !== 'none') {
				additionalMatrices.push(makeDOMMatrix(`scale(${scale})`));
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
		hasCssTransform,
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
			needsSvgClip: svgClip,
			needsFilterPrecompositing: filterForPrecompositing,
			needsBlendMode: blendMode,
			needsIsolation: isolated,
			needsPrecompositing: Boolean(
				needs3DTransformViaWebGL ||
				needsMaskImage ||
				svgClip !== null ||
				needsFilterPrecompositing ||
				blendMode !== null ||
				isolated,
			),
		},
	};
};
