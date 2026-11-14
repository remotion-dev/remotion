import {splitAtTopLevel} from './background-image-rect';
import {isColorTransparent} from './get-background-fill';
import {getSvgFilterGeometry} from './svg-filter-geometry';

// Keep the viewport behavior for paint whose complete outsets are not captured.
export const getSvgPaintBounds = (svg: SVGSVGElement): DOMPoint[] | null => {
	const rootStyle = getComputedStyle(svg);
	if (
		rootStyle.mixBlendMode === 'normal' ||
		!isColorTransparent(rootStyle.backgroundColor) ||
		rootStyle.backgroundImage !== 'none' ||
		rootStyle.maskImage !== 'none' ||
		rootStyle.filter !== 'none' ||
		svg.querySelector('foreignObject, use')
	)
		return null;
	const points: DOMPoint[] = [];
	const filtered = new Set<Element>();
	let hasTextShadow = false;
	const addBounds = (element: SVGGraphicsElement, x: number, y: number) => {
		const screen = element.getScreenCTM();
		if (!screen) return false;
		// SVGMatrix exposes affine coefficients without DOMMatrix.is2D.
		const matrix = DOMMatrix.fromMatrix(screen);
		if (!matrix.is2D) return false;
		const box = element.getBBox();
		for (const point of [
			new DOMPoint(box.x + x, box.y + y),
			new DOMPoint(box.x + box.width + x, box.y + y),
			new DOMPoint(box.x + box.width + x, box.y + box.height + y),
			new DOMPoint(box.x + x, box.y + box.height + y),
		])
			points.push(point.matrixTransform(matrix));
		return true;
	};

	if (!addBounds(svg, 0, 0)) return null;
	for (const element of [svg, ...svg.querySelectorAll('*')]) {
		const style = getComputedStyle(element);
		if (
			(style.stroke !== 'none' &&
				parseFloat(style.strokeWidth) > 0 &&
				parseFloat(style.strokeOpacity) > 0) ||
			[style.markerStart, style.markerMid, style.markerEnd].some(
				(value) => value && value !== 'none',
			) ||
			style.boxShadow !== 'none' ||
			style.textDecorationLine !== 'none' ||
			style.clipPath !== 'none' ||
			(style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
			['top', 'right', 'bottom', 'left'].some(
				(side) =>
					parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0,
			)
		)
			return null;
		if (style.textShadow !== 'none' && element instanceof SVGAElement)
			return null;
		if (
			style.textShadow !== 'none' &&
			element instanceof SVGTextContentElement
		) {
			if (filtered.size) return null;
			hasTextShadow = true;
			for (const shadow of splitAtTopLevel(style.textShadow, ',')) {
				const lengths = splitAtTopLevel(shadow, ' ')
					.filter((part) => /^[+-]?(?:\d*\.)?\d+(?:px)?$/.test(part))
					.map((part) => parseFloat(part));
				if (
					lengths.length !== 3 ||
					lengths[2] !== 0 ||
					!lengths.every(Number.isFinite)
				)
					return null;
				if (!addBounds(element, lengths[0], lengths[1])) return null;
			}
		}

		if (style.filter !== 'none') {
			if (hasTextShadow) return null;
			for (
				let parent = element.parentElement;
				parent;
				parent = parent.parentElement
			) {
				if (filtered.has(parent)) return null;
			}

			filtered.add(element);
			if (!(element instanceof SVGGraphicsElement)) return null;
			const box = element.getBBox();
			const geometry = getSvgFilterGeometry({
				filter: style.filter,
				ownerDocument: svg.ownerDocument,
				width: box.width,
				height: box.height,
			});
			if (!geometry) return null;
			const original = {x: 0, y: 0};
			let previous = original;
			const results = new Map<string, {x: number; y: number}>();
			for (const primitive of geometry.primitives) {
				if (!(primitive instanceof SVGFEOffsetElement)) return null;
				const name = primitive.in1.baseVal;
				const input = !name
					? previous
					: name === 'SourceGraphic' || name === 'SourceAlpha'
						? original
						: results.get(name);
				if (!input) return null;
				previous = {
					x: input.x + primitive.dx.baseVal,
					y: input.y + primitive.dy.baseVal,
				};
				if (!Number.isFinite(previous.x) || !Number.isFinite(previous.y))
					return null;
				if (primitive.result.baseVal)
					results.set(primitive.result.baseVal, previous);
			}

			if (!addBounds(element, previous.x, previous.y)) return null;
		}
	}

	return points;
};
