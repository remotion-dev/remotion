import {getMaskImageValue, parseMaskImage} from './mask-image';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {getAbsoluteOrigin} from './transform-perspective-origin';

type Transform = {
	matrices: DOMMatrix[];
	element: Element;
	transformOrigin: string;
	boundingClientRect: DOMRect | null;
	perspectiveOrigin: string;
	perspective: DOMMatrix | null;
	perspectiveMatrix: DOMMatrix | null;
};

export const calculateTransforms = ({
	element: elToRender,
	rootElement,
	threeDRenderingContext,
}: {
	element: HTMLElement | SVGElement;
	rootElement: HTMLElement | SVGElement;
	threeDRenderingContext: DOMMatrix | null;
}) => {
	// Compute the cumulative transform by traversing parent nodes
	let currentEl: HTMLElement | SVGElement | null = elToRender;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];

	let opacity = 1;
	let elementComputedStyle: CSSStyleDeclaration | null = null;
	let maskImageInfo: LinearGradientInfo | null = null;
	let establishes3DRenderingContext = false;

	while (currentEl) {
		const computedStyle = getComputedStyle(currentEl);

		if (currentEl === elToRender) {
			elementComputedStyle = computedStyle;
			opacity = parseFloat(computedStyle.opacity);
			establishes3DRenderingContext =
				computedStyle.transformStyle === 'preserve-3d';
			const maskImageValue = getMaskImageValue(computedStyle);

			if (maskImageValue) {
				maskImageInfo = parseMaskImage(maskImageValue);

				const originalMaskImage = currentEl.style.maskImage;
				const originalWebkitMaskImage = currentEl.style.webkitMaskImage;
				currentEl.style.maskImage = 'none';
				currentEl.style.webkitMaskImage = 'none';

				const parentRef = currentEl;

				toReset.push(() => {
					parentRef!.style.maskImage = originalMaskImage;
					parentRef!.style.webkitMaskImage = originalWebkitMaskImage;
				});
			}
		}

		const transformToPush: Transform = {
			element: currentEl,
			transformOrigin: computedStyle.transformOrigin,
			boundingClientRect: null,
			matrices: [],
			perspectiveOrigin: computedStyle.perspectiveOrigin,
			perspective: null,
			perspectiveMatrix: null,
		};

		transforms.push(transformToPush);

		if (
			computedStyle.perspective !== '' &&
			computedStyle.perspective !== 'none'
		) {
			transformToPush.perspective = new DOMMatrix(
				`perspective(${computedStyle.perspective})`,
			);
			transformToPush.perspectiveOrigin = computedStyle.perspectiveOrigin;

			const originalPerspective = currentEl.style.perspective;
			const originalPerspectiveOrigin = currentEl.style.perspectiveOrigin;
			// Cannot remove perspective because that can influence the layout, see perspective.test.tsx
			currentEl.style.perspective = '1000000000000px';
			currentEl.style.perspectiveOrigin = '';

			const parentRef = currentEl;
			toReset.push(() => {
				parentRef!.style.perspective = originalPerspective;
				parentRef!.style.perspectiveOrigin = originalPerspectiveOrigin;
			});
		}

		// The order of transformations is:
		// 1. Translate --> We do not have to consider it since it changes getClientBoundingRect()
		// 2. Rotate
		// 3. Scale
		// 4. CSS "transform"
		if (computedStyle.rotate !== '' && computedStyle.rotate !== 'none') {
			transformToPush.matrices.push(
				new DOMMatrix(`rotate(${computedStyle.rotate})`),
			);
			const originalRotate = currentEl.style.rotate;
			currentEl.style.rotate = 'none';
			const parentRef = currentEl;
			toReset.push(() => {
				parentRef!.style.rotate = originalRotate;
			});
		}

		if (computedStyle.scale !== '' && computedStyle.scale !== 'none') {
			transformToPush.matrices.push(
				new DOMMatrix(`scale(${computedStyle.scale})`),
			);
			const originalScale = currentEl.style.scale;
			currentEl.style.scale = 'none';
			const parentRef = currentEl;
			toReset.push(() => {
				parentRef!.style.scale = originalScale;
			});
		}

		if (computedStyle.transform !== '' && computedStyle.transform !== 'none') {
			transformToPush.matrices.push(new DOMMatrix(computedStyle.transform));
			const originalTransform = currentEl.style.transform;
			currentEl.style.transform = 'none';
			const parentRef = currentEl;
			toReset.push(() => {
				parentRef!.style.transform = originalTransform;
			});
		}

		if (currentEl === rootElement) {
			break;
		}

		currentEl = currentEl.parentElement;
	}

	for (const transform of transforms) {
		transform.boundingClientRect = transform.element.getBoundingClientRect();

		if (transform.perspective) {
			const origin = getAbsoluteOrigin({
				origin: transform.perspectiveOrigin,
				boundingClientRect: transform.boundingClientRect!,
			});

			transform.perspectiveMatrix = new DOMMatrix()
				.translate(origin.x, origin.y)
				.multiply(transform.perspective)
				.translate(-origin.x, -origin.y);
		}
	}

	let totalMatrix = new DOMMatrix();
	const reversedMatrixes = transforms.slice().reverse();

	for (let i = 0; i < reversedMatrixes.length; i++) {
		const transform = reversedMatrixes[i];
		if (!transform) {
			continue;
		}

		const parentTransform = reversedMatrixes[i - 1];

		for (const matrix of transform.matrices) {
			const globalTransformOrigin = getAbsoluteOrigin({
				origin: transform.transformOrigin,
				boundingClientRect: transform.boundingClientRect!,
			});

			const transformMatrix = new DOMMatrix()
				.translate(globalTransformOrigin.x, globalTransformOrigin.y)
				.multiply(matrix)
				.translate(-globalTransformOrigin.x, -globalTransformOrigin.y);

			totalMatrix.multiplySelf(transformMatrix);
		}

		if (
			parentTransform &&
			parentTransform.perspective &&
			parentTransform.perspectiveMatrix
		) {
			totalMatrix = parentTransform.perspectiveMatrix?.multiply(totalMatrix);
		}
	}

	if (!elementComputedStyle) {
		throw new Error('Element computed style not found');
	}

	const needs3DTransformViaWebGL = !totalMatrix.is2D;
	const needsMaskImage = maskImageInfo !== null;

	return {
		dimensions: transforms[0]!.boundingClientRect!,
		totalMatrix,
		[Symbol.dispose]: () => {
			for (const reset of toReset) {
				reset();
			}
		},
		computedStyle: elementComputedStyle,
		opacity,
		maskImageInfo,
		establishes3DRenderingContext,
		precompositing: {
			needs3DTransformViaWebGL,
			needsMaskImage: maskImageInfo,
			needsPrecompositing: Boolean(needs3DTransformViaWebGL || needsMaskImage),
		},
	};
};

export type Precompositing = {
	needs3DTransformViaWebGL: boolean;
	needsMaskImage: LinearGradientInfo | null;
	needsPrecompositing: boolean;
};
