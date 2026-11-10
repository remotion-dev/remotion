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

export const preserves3DChildren = (computedStyle: CSSStyleDeclaration) =>
	computedStyle.transformStyle === 'preserve-3d' &&
	computedStyle.opacity === '1' &&
	(computedStyle.overflowX === 'visible' ||
		computedStyle.overflowX === 'clip') &&
	(computedStyle.overflowY === 'visible' ||
		computedStyle.overflowY === 'clip') &&
	computedStyle.filter === 'none' &&
	!getMaskImageValue(computedStyle) &&
	computedStyle.clip === 'auto' &&
	computedStyle.clipPath === 'none' &&
	computedStyle.isolation !== 'isolate' &&
	computedStyle.mixBlendMode === 'normal' &&
	(!computedStyle.getPropertyValue('mask-border-source') ||
		computedStyle.getPropertyValue('mask-border-source') === 'none') &&
	!/(?:paint|strict|content)/.test(computedStyle.contain) &&
	computedStyle.contentVisibility === 'visible';
type Transform = {
	matrices: DOMMatrix[];
	element: Element;
	transformOrigin: string;
	perspective: string | null;
	perspectiveOrigin: string;
	boundingClientRect: DOMRect | null;
};

type TransformStyle = Pick<
	CSSStyleDeclaration,
	| 'display'
	| 'rotate'
	| 'scale'
	| 'transform'
	| 'transformOrigin'
	| 'perspective'
	| 'perspectiveOrigin'
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
		perspective: computedStyle.perspective,
		perspectiveOrigin: computedStyle.perspectiveOrigin,
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

export const canApplyCssTransforms = ({
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

const makeTransformResetter = (
	element: HTMLElement | SVGElement,
	experimental3DRendering: boolean,
) => {
	const originals = ['transform', 'scale', 'rotate'].map((property) => ({
		property,
		value: element.style.getPropertyValue(property),
		priority: element.style.getPropertyPriority(property),
	}));

	return (hasApplicableTransformCssValue: boolean) => {
		if (hasApplicableTransformCssValue) {
			element.style.transform = experimental3DRendering
				? 'matrix(1, 0, 0, 1, 0, 0)'
				: 'none';
			element.style.scale = 'none';
			element.style.rotate = 'none';
		}

		return () => {
			if (hasApplicableTransformCssValue) {
				for (const {property, value, priority} of originals) {
					element.style.setProperty(property, value, priority);
				}
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
	experimental3DRendering = false,
}: {
	element: HTMLElement | SVGElement;
	rootElement: HTMLElement | SVGElement;
	transformStyleCache: TransformStyleCache;
	isolated: boolean;
	experimental3DRendering?: boolean;
}) => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGElement | null = element;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];

	let opacity = 1;
	let elementPreserves3D = false;
	let elementHadGroupedPreserve3D = false;
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
		const originallyAbsentStyle = !parent.hasAttribute('style');
		const parentStyle = parent.style;
		const originalTransition = parentStyle.getPropertyValue('transition');
		const originalTransitionPriority =
			parentStyle.getPropertyPriority('transition');
		// The shorthand can be empty for authored mixed-priority longhands.
		const originalTransitions = [
			'transition-property',
			'transition-duration',
			'transition-timing-function',
			'transition-delay',
			'transition-behavior',
		].map((property) => ({
			property,
			value: parentStyle.getPropertyValue(property),
			priority: parentStyle.getPropertyPriority(property),
		}));
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
			elementPreserves3D =
				experimental3DRendering && preserves3DChildren(computedStyle);
			elementHadGroupedPreserve3D =
				experimental3DRendering &&
				!elementPreserves3D &&
				computedStyle.transformStyle === 'preserve-3d';
			if (elementHadGroupedPreserve3D) {
				const originalTransformStyle = parent.style.transformStyle;
				const groupParent = parent;
				// Removing a grouping effect for its temporary layer must not change
				// the element's used transform-style from flat back to preserve-3d.
				parent.style.transformStyle = 'flat';
				toReset.push(() => {
					groupParent.style.transformStyle = originalTransformStyle;
				});
			}

			opacity = parseFloat(computedStyle.opacity);

			const maskImageValue = getMaskImageValue(computedStyle);
			maskImageInfo = maskImageValue
				? parseMaskImage(maskImageValue, computedStyle, experimental3DRendering)
				: null;

			svgClip = getSvgClipForPrecompositing(computedStyle.clipPath, parent);
			blendMode = getBlendMode(computedStyle.mixBlendMode);
			// In CSS, an element blends together with its descendants as one group,
			// and its filter and opacity apply to that group as a whole.
			const needsGroup =
				blendMode !== null ||
				isolated ||
				svgClip !== null ||
				computedStyle.filter.includes('url(') ||
				(experimental3DRendering && opacity > 0 && opacity < 1);

			filterForPrecompositing =
				needsGroup && computedStyle.filter !== 'none'
					? computedStyle.filter
					: filterRequiresPrecompositing(computedStyle.filter);

			const childPaintStyles =
				experimental3DRendering &&
				needsGroup &&
				(opacity !== 1 || filterForPrecompositing !== null)
					? Array.from(parent.children, (child) => {
							const childStyle = getComputedStyle(child);
							return {
								child: child as HTMLElement | SVGElement,
								opacity: childStyle.opacity,
								filter: filterForPrecompositing ? childStyle.filter : 'none',
								style: child.getAttribute('style'),
							};
						}).filter(
							(child) => child.opacity !== '1' || child.filter !== 'none',
						)
					: [];

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

			// Keep the filter's containing block while removing its visual effect.
			if (filterForPrecompositing) overrides.push(['filter', 'opacity(1)']);
			const {style} = parent;
			const originals = overrides.map(([property]) => ({
				property,
				value: style.getPropertyValue(property),
				priority: style.getPropertyPriority(property),
			}));
			for (const [property, value] of overrides) {
				style.setProperty(property, value, 'important');
			}

			for (const child of childPaintStyles) {
				if (child.opacity !== '1')
					child.child.style.setProperty('opacity', child.opacity, 'important');
				if (child.filter !== 'none')
					child.child.style.setProperty('filter', child.filter, 'important');
			}

			toReset.push(() => {
				for (const {property, value, priority} of originals) {
					style.setProperty(property, value, priority);
				}

				for (const child of childPaintStyles) {
					if (child.style === null) child.child.removeAttribute('style');
					else child.child.setAttribute('style', child.style);
				}
			});
		}

		// The perspective property projects children, not the element's own plane.
		const hasPerspective =
			experimental3DRendering &&
			parent !== element &&
			canApplyCssTransforms({computedStyle: transformStyle, element: parent}) &&
			transformStyle.perspective &&
			transformStyle.perspective !== 'none';
		const originalPerspective = parent.style.perspective;
		if (hasPerspective) {
			parent.style.perspective = 'none';
			const perspectiveParent = parent;
			toReset.push(() => {
				perspectiveParent.style.perspective = originalPerspective;
			});
		}

		const hasApplicableTransformCssValue =
			canApplyCssTransforms({computedStyle: transformStyle, element: parent}) &&
			hasAnyTransformCssValue(transformStyle);

		hasCssTransform ||= hasApplicableTransformCssValue;
		if (
			hasApplicableTransformCssValue ||
			hasPerspective ||
			parent === element
		) {
			const toParse =
				hasApplicableTransformCssValue && hasTransformCssValue(transformStyle)
					? transformStyle.transform
					: undefined;
			const matrix =
				toParse && transformStyle.matrix
					? DOMMatrix.fromMatrix(transformStyle.matrix)
					: makeDOMMatrix(toParse);

			const resetTransforms = makeTransformResetter(
				parent,
				experimental3DRendering,
			);
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
			const cleanup = resetTransforms(
				hasApplicableTransformCssValue ||
					hasPerspective ||
					(parent === element && elementHadGroupedPreserve3D),
			);
			transforms.push({
				element: parent,
				transformOrigin: transformStyle.transformOrigin,
				perspective: hasPerspective ? transformStyle.perspective : null,
				perspectiveOrigin: transformStyle.perspectiveOrigin,
				boundingClientRect: null,
				matrices: additionalMatrices,
			});
			toReset.push(cleanup);
		}

		const parentRef = parent;
		toReset.push(() => {
			// Pending-substitution shorthands have empty CSSOM longhand values.
			if (originalTransition) {
				parentRef.style.setProperty(
					'transition',
					originalTransition,
					originalTransitionPriority,
				);
			} else {
				for (const {property, value, priority} of originalTransitions) {
					parentRef.style.setProperty(property, value, priority);
				}
			}

			// Leave unrelated authored updates intact and preserve explicit style="".
			if (originallyAbsentStyle && parentRef.getAttribute('style') === '') {
				parentRef.removeAttribute('style');
			}
		});

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

		if (transform.perspective) {
			const origin = parseTransformOrigin(transform.perspectiveOrigin) ?? {
				x: transform.boundingClientRect!.width / 2,
				y: transform.boundingClientRect!.height / 2,
			};
			const x = transform.boundingClientRect!.left + origin.x;
			const y = transform.boundingClientRect!.top + origin.y;
			// CSS clamps perspective distances below 1px to 1px for rendering.
			const projection = new DOMMatrix();
			projection.m34 = -1 / Math.max(1, parseFloat(transform.perspective));
			totalMatrix.multiplySelf(
				new DOMMatrix().translate(x, y).multiply(projection).translate(-x, -y),
			);
		}
	}

	if (!elementComputedStyle) {
		throw new Error('Element computed style not found');
	}

	const needsOpacityPrecompositing =
		experimental3DRendering && opacity > 0 && opacity < 1;
	const needs3DTransformViaWebGL = !totalMatrix.is2D;
	const needsMaskImage = maskImageInfo !== null;
	const needsFilterPrecompositing = filterForPrecompositing !== null;

	return {
		dimensions,
		preserves3DChildren: elementPreserves3D,
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
			needsOpacityPrecompositing,
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
				needsOpacityPrecompositing ||
				blendMode !== null ||
				isolated,
			),
		},
	};
};
