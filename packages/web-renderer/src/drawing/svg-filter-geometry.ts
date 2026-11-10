// Geometry for local matrix/blur/offset graphs. Other SVG primitives need their own
// coordinate mapping before they can use an expanded or scaled Canvas surface.
export const getSvgFilterGeometry = ({
	filter,
	ownerDocument,
	width,
	height,
}: {
	filter: string;
	ownerDocument: Document;
	width: number;
	height: number;
}) => {
	const match =
		/^url\(["']?([^"')]+)["']?\)((?:\s+(?:brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)\([^()]*\))*)$/.exec(
			filter,
		);
	if (!match) return null;
	let url: URL;
	try {
		url = new URL(match[1], ownerDocument.baseURI);
	} catch {
		return null;
	}

	const documentUrl = new URL(ownerDocument.URL);
	if (
		url.origin !== documentUrl.origin ||
		url.pathname !== documentUrl.pathname ||
		url.search !== documentUrl.search
	)
		return null;
	let id: string;
	try {
		id = decodeURIComponent(url.hash.slice(1));
	} catch {
		return null;
	}

	const element = ownerDocument.getElementById(id);
	if (
		!(element instanceof SVGFilterElement) ||
		element.hasAttribute('href') ||
		element.hasAttribute('xlink:href') ||
		element.primitiveUnits.baseVal !== SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE
	)
		return null;
	const primitives = Array.from(element.children);
	if (
		primitives.length === 0 ||
		primitives.some((p) => {
			if (
				!(
					p instanceof SVGFEColorMatrixElement ||
					p instanceof SVGFEGaussianBlurElement ||
					p instanceof SVGFEOffsetElement
				) ||
				p.children.length > 0
			)
				return true;
			return (['x', 'y', 'width', 'height'] as const).some(
				(key) =>
					p.hasAttribute(key) &&
					p[key].baseVal.unitType === SVGLength.SVG_LENGTHTYPE_PERCENTAGE,
			);
		})
	)
		return null;
	const objectBoundingBox =
		element.filterUnits.baseVal ===
		SVGUnitTypes.SVG_UNIT_TYPE_OBJECTBOUNDINGBOX;
	const length = (value: SVGAnimatedLength, axis: number) =>
		value.baseVal.unitType === SVGLength.SVG_LENGTHTYPE_PERCENTAGE
			? (value.baseVal.valueInSpecifiedUnits / 100) * axis
			: objectBoundingBox
				? value.baseVal.value * axis
				: value.baseVal.value;
	const rect = new DOMRect(
		length(element.x, width),
		length(element.y, height),
		length(element.width, width),
		length(element.height, height),
	);
	if (rect.width <= 0 || rect.height <= 0) return null;
	return {element, primitives, rect, colorFilters: match[2]};
};

export const rebaseSvgFilter = ({
	geometry,
	scale,
	ownerDocument,
}: {
	geometry: NonNullable<ReturnType<typeof getSvgFilterGeometry>>;
	scale: number;
	ownerDocument: Document;
}) => {
	const {element, primitives, rect} = geometry;
	const left = Math.floor(rect.left * scale);
	const top = Math.floor(rect.top * scale);
	const width = Math.ceil(rect.right * scale) - left;
	const height = Math.ceil(rect.bottom * scale) - top;
	const clone = element.cloneNode(true) as SVGFilterElement;
	const id = `remotion-filter-${crypto.randomUUID()}`;
	clone.id = id;
	clone.setAttribute('filterUnits', 'userSpaceOnUse');
	clone.setAttribute('x', String(rect.left * scale - left));
	clone.setAttribute('y', String(rect.top * scale - top));
	clone.setAttribute('width', String(rect.width * scale));
	clone.setAttribute('height', String(rect.height * scale));
	clone.setAttribute(
		'color-interpolation-filters',
		getComputedStyle(element).colorInterpolationFilters,
	);
	for (let i = 0; i < primitives.length; i++) {
		const primitive = primitives[i] as
			| SVGFEColorMatrixElement
			| SVGFEGaussianBlurElement
			| SVGFEOffsetElement;
		const target = clone.children[i];
		target.setAttribute(
			'color-interpolation-filters',
			getComputedStyle(primitive).colorInterpolationFilters,
		);
		for (const key of ['x', 'y', 'width', 'height'] as const) {
			if (primitive.hasAttribute(key)) {
				const value = primitive[key].baseVal;
				target.setAttribute(
					key,
					String(
						value.value * scale - (key === 'x' ? left : key === 'y' ? top : 0),
					),
				);
			}
		}

		if (primitive instanceof SVGFEGaussianBlurElement)
			target.setAttribute(
				'stdDeviation',
				`${primitive.stdDeviationX.baseVal * scale} ${primitive.stdDeviationY.baseVal * scale}`,
			);
		if (primitive instanceof SVGFEOffsetElement) {
			target.setAttribute('dx', String(primitive.dx.baseVal * scale));
			target.setAttribute('dy', String(primitive.dy.baseVal * scale));
		}
	}

	const svg = ownerDocument.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	svg.setAttribute('width', '0');
	svg.setAttribute('height', '0');
	svg.style.position = 'absolute';
	svg.append(clone);
	ownerDocument.body.append(svg);
	return {
		filter: `url(#${id})${geometry.colorFilters}`,
		left,
		top,
		width,
		height,
		[Symbol.dispose]: () => svg.remove(),
	};
};
