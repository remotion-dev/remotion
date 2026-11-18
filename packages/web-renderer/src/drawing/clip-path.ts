type ClipPathNone = {type: 'none'};
type ClipPathReference = {type: 'url'; source: string};
type ClipPathPolygon = {
	type: 'polygon';
	fillRule: CanvasFillRule;
	points: {x: number; y: number}[];
};
type ClipPathPath = {type: 'path'; d: string; fillRule: CanvasFillRule};
type ClipPathCircle = {
	type: 'circle';
	radius: number;
	cx: number;
	cy: number;
};
type ClipPathEllipse = {
	type: 'ellipse';
	rx: number;
	ry: number;
	cx: number;
	cy: number;
};
type ClipPathInset = {
	type: 'inset';
	top: number;
	right: number;
	bottom: number;
	left: number;
};

type ParsedClipPath =
	| ClipPathNone
	| ClipPathReference
	| ClipPathPolygon
	| ClipPathPath
	| ClipPathCircle
	| ClipPathEllipse
	| ClipPathInset;

function resolveLength(value: string, reference: number): number {
	value = value.trim();
	if (value.endsWith('%')) {
		return (parseFloat(value) / 100) * reference;
	}

	if (value.endsWith('px')) {
		return parseFloat(value);
	}

	return parseFloat(value);
}

function parsePosition(
	parts: string[],
	width: number,
	height: number,
): {x: number; y: number} {
	if (parts.length === 0) {
		return {x: width / 2, y: height / 2};
	}

	if (parts.length === 1) {
		return {x: resolveLength(parts[0], width), y: height / 2};
	}

	return {
		x: resolveLength(parts[0], width),
		y: resolveLength(parts[1], height),
	};
}

function parsePolygon(args: string, rect: DOMRect): ClipPathPolygon {
	const pointStrings = args.split(',');
	const rule = pointStrings[0].trim();
	const fillRule: CanvasFillRule = rule === 'evenodd' ? 'evenodd' : 'nonzero';
	if (rule === 'evenodd' || rule === 'nonzero') {
		pointStrings.shift();
	}

	const points = pointStrings.map((pointStr) => {
		const coords = pointStr.trim().split(/\s+/);
		return {
			x: resolveLength(coords[0], rect.width) + rect.left,
			y: resolveLength(coords[1], rect.height) + rect.top,
		};
	});

	return {type: 'polygon', points, fillRule};
}

function parsePath(args: string): ClipPathPath {
	const match = args.match(/^(?:(nonzero|evenodd)\s*,\s*)?["'](.+)["']$/);
	if (!match) {
		return {
			type: 'path',
			d: args.replace(/["']/g, ''),
			fillRule: 'nonzero',
		};
	}

	const fillRule: CanvasFillRule =
		match[1] === 'evenodd' ? 'evenodd' : 'nonzero';
	return {type: 'path', d: match[2], fillRule};
}

function parseCircle(args: string, rect: DOMRect): ClipPathCircle {
	const atIndex = args.indexOf(' at ');
	let radiusStr: string;
	let positionParts: string[];

	if (atIndex !== -1) {
		radiusStr = args.slice(0, atIndex).trim();
		positionParts = args
			.slice(atIndex + 4)
			.trim()
			.split(/\s+/);
	} else {
		radiusStr = args.trim();
		positionParts = [];
	}

	const closestSide = Math.min(rect.width, rect.height) / 2;
	const farthestSide = Math.max(rect.width, rect.height) / 2;
	let radius: number;
	if (radiusStr === 'closest-side' || radiusStr === '') {
		radius = closestSide;
	} else if (radiusStr === 'farthest-side') {
		radius = farthestSide;
	} else {
		const refSize =
			Math.sqrt(rect.width * rect.width + rect.height * rect.height) /
			Math.SQRT2;
		radius = resolveLength(radiusStr, refSize);
	}

	const position = parsePosition(positionParts, rect.width, rect.height);

	return {
		type: 'circle',
		radius,
		cx: position.x + rect.left,
		cy: position.y + rect.top,
	};
}

function parseEllipse(args: string, rect: DOMRect): ClipPathEllipse {
	const atIndex = args.indexOf(' at ');
	let radiiStr: string;
	let positionParts: string[];

	if (atIndex !== -1) {
		radiiStr = args.slice(0, atIndex).trim();
		positionParts = args
			.slice(atIndex + 4)
			.trim()
			.split(/\s+/);
	} else {
		radiiStr = args.trim();
		positionParts = [];
	}

	const radiiParts = radiiStr.split(/\s+/);
	let rx: number;
	let ry: number;

	if (radiiParts.length >= 2) {
		rx = resolveLength(radiiParts[0], rect.width);
		ry = resolveLength(radiiParts[1], rect.height);
	} else {
		rx = rect.width / 2;
		ry = rect.height / 2;
	}

	const position = parsePosition(positionParts, rect.width, rect.height);

	return {
		type: 'ellipse',
		rx,
		ry,
		cx: position.x + rect.left,
		cy: position.y + rect.top,
	};
}

function parseInset(args: string, rect: DOMRect): ClipPathInset {
	const [insetPart] = args.split(/\s+round\s+/);
	const parts = insetPart.split(/\s+/);
	let top: number;
	let right: number;
	let bottom: number;
	let left: number;

	if (parts.length === 1) {
		const val = resolveLength(parts[0], rect.height);
		top = val;
		right = val;
		bottom = val;
		left = val;
	} else if (parts.length === 2) {
		top = resolveLength(parts[0], rect.height);
		bottom = resolveLength(parts[0], rect.height);
		right = resolveLength(parts[1], rect.width);
		left = resolveLength(parts[1], rect.width);
	} else if (parts.length === 3) {
		top = resolveLength(parts[0], rect.height);
		right = resolveLength(parts[1], rect.width);
		left = resolveLength(parts[1], rect.width);
		bottom = resolveLength(parts[2], rect.height);
	} else {
		top = resolveLength(parts[0], rect.height);
		right = resolveLength(parts[1], rect.width);
		bottom = resolveLength(parts[2], rect.height);
		left = resolveLength(parts[3], rect.width);
	}

	return {type: 'inset', top, right, bottom, left};
}

export function parseClipPath(clipPath: string, rect: DOMRect): ParsedClipPath {
	if (clipPath === 'none' || clipPath === '') {
		return {type: 'none'};
	}

	if (clipPath.startsWith('url(') && clipPath.endsWith(')')) {
		return {
			type: 'url',
			source: clipPath
				.slice(4, -1)
				.trim()
				.replace(/^(["'])(.*)\1$/, '$2'),
		};
	}

	const polygonMatch = clipPath.match(/^polygon\((.+)\)$/);
	if (polygonMatch) {
		return parsePolygon(polygonMatch[1], rect);
	}

	const pathMatch = clipPath.match(/^path\((.+)\)$/);
	if (pathMatch) {
		return parsePath(pathMatch[1]);
	}

	const circleMatch = clipPath.match(/^circle\((.+)\)$/);
	if (circleMatch) {
		return parseCircle(circleMatch[1], rect);
	}

	const ellipseMatch = clipPath.match(/^ellipse\((.+)\)$/);
	if (ellipseMatch) {
		return parseEllipse(ellipseMatch[1], rect);
	}

	const insetMatch = clipPath.match(/^inset\((.+)\)$/);
	if (insetMatch) {
		return parseInset(insetMatch[1], rect);
	}

	return {type: 'none'};
}

// Resolve local resources once for the native HTML mask and SVG vector paths.
const getReferencedClipPath = (
	source: string,
	element: Element,
): SVGClipPathElement | null => {
	let url: URL;
	let id: string;
	try {
		url = new URL(source, element.ownerDocument.baseURI);
		id = decodeURIComponent(url.hash.slice(1));
	} catch {
		// Malformed resource URLs do not resolve a clip in the browser.
		return null;
	}

	const documentUrl = new URL(element.ownerDocument.URL);
	if (
		url.origin !== documentUrl.origin ||
		url.pathname !== documentUrl.pathname ||
		url.search !== documentUrl.search ||
		!url.hash
	)
		return null;
	const resource = element.ownerDocument.getElementById(id);
	if (!(resource instanceof SVGClipPathElement)) return null;
	return resource;
};

const getReferencedShape = (
	source: string,
	element: Element,
	rect: DOMRect,
): {path: Path2D; fillRule: CanvasFillRule} | null => {
	const resource = getReferencedClipPath(source, element);
	if (!resource) return null;
	const children = Array.from(resource.children).filter(
		(node) => getComputedStyle(node).display !== 'none',
	);
	const path = new Path2D();
	if (children.length === 0) return {path, fillRule: 'nonzero'};
	// Multiple shapes need union coverage rather than a combined winding rule.
	if (children.length !== 1) return null;
	const child = children[0];
	if (
		!(
			child instanceof SVGRectElement ||
			child instanceof SVGPolygonElement ||
			child instanceof SVGPathElement
		)
	)
		return null;
	if (
		child instanceof SVGRectElement &&
		(child.rx.baseVal.valueInSpecifiedUnits > 0 ||
			child.ry.baseVal.valueInSpecifiedUnits > 0)
	)
		return null;
	const objectBoundingBox =
		resource.clipPathUnits.baseVal ===
		SVGUnitTypes.SVG_UNIT_TYPE_OBJECTBOUNDINGBOX;
	const length = (value: SVGLength) =>
		objectBoundingBox && value.unitType === SVGLength.SVG_LENGTHTYPE_PERCENTAGE
			? value.valueInSpecifiedUnits / 100
			: value.value;
	const matrix = new DOMMatrix().translate(rect.left, rect.top);
	if (objectBoundingBox) matrix.scaleSelf(rect.width, rect.height);
	for (let i = 0; i < resource.transform.baseVal.numberOfItems; i++)
		matrix.multiplySelf(resource.transform.baseVal.getItem(i).matrix);
	for (let i = 0; i < child.transform.baseVal.numberOfItems; i++)
		matrix.multiplySelf(child.transform.baseVal.getItem(i).matrix);
	let shape: Path2D;
	if (child instanceof SVGRectElement) {
		shape = new Path2D();
		const width = length(child.width.baseVal);
		const height = length(child.height.baseVal);
		if (width > 0 && height > 0)
			shape.rect(
				length(child.x.baseVal),
				length(child.y.baseVal),
				width,
				height,
			);
	} else if (child instanceof SVGPolygonElement) {
		shape = new Path2D();
		for (let i = 0; i < child.points.numberOfItems; i++) {
			const point = child.points.getItem(i);
			if (i === 0) shape.moveTo(point.x, point.y);
			else shape.lineTo(point.x, point.y);
		}

		shape.closePath();
	} else {
		shape = new Path2D(child.getAttribute('d') ?? '');
	}

	path.addPath(shape, matrix);
	return {
		path,
		fillRule:
			getComputedStyle(child).clipRule === 'evenodd' ? 'evenodd' : 'nonzero',
	};
};

export const getSvgClipForPrecompositing = (
	clipPath: string,
	element: Element,
): SVGClipPathElement | null => {
	if (!clipPath.startsWith('url(')) return null;
	const parsed = parseClipPath(clipPath, new DOMRect());
	if (parsed.type !== 'url') return null;
	const resource = getReferencedClipPath(parsed.source, element);
	if (!resource) return null;
	const children = Array.from(resource.children).filter(
		(node) =>
			node instanceof SVGGraphicsElement &&
			getComputedStyle(node).display !== 'none',
	);
	if (children.length > 1) {
		return children.every(
			(node) =>
				node instanceof SVGRectElement &&
				node.rx.baseVal.valueInSpecifiedUnits === 0 &&
				node.ry.baseVal.valueInSpecifiedUnits === 0,
		)
			? resource
			: null;
	}

	if (!(element instanceof HTMLElement)) return null;
	if (
		children.some((node) => {
			if (node instanceof SVGRectElement) {
				return (
					node.rx.baseVal.valueInSpecifiedUnits > 0 ||
					node.ry.baseVal.valueInSpecifiedUnits > 0
				);
			}

			return !(
				node instanceof SVGPolygonElement || node instanceof SVGPathElement
			);
		})
	)
		return null;
	return resource;
};

export function setClipPath({
	ctx,
	clipPath,
	rect,
	element,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	clipPath: string;
	rect: DOMRect;
	element: Element;
}): () => void {
	const parsed = parseClipPath(clipPath, rect);

	if (parsed.type === 'none') {
		return () => {};
	}

	ctx.save();

	switch (parsed.type) {
		case 'url': {
			const shape = getReferencedShape(parsed.source, element, rect);
			if (shape) ctx.clip(shape.path, shape.fillRule);
			break;
		}

		case 'polygon': {
			ctx.beginPath();
			for (let i = 0; i < parsed.points.length; i++) {
				const point = parsed.points[i];
				if (i === 0) {
					ctx.moveTo(point.x, point.y);
				} else {
					ctx.lineTo(point.x, point.y);
				}
			}

			ctx.closePath();
			ctx.clip(parsed.fillRule);
			break;
		}

		case 'path': {
			const path2d = new Path2D();
			const offsetMatrix = new DOMMatrix().translate(rect.left, rect.top);
			path2d.addPath(new Path2D(parsed.d), offsetMatrix);
			ctx.clip(path2d, parsed.fillRule);
			break;
		}

		case 'circle': {
			ctx.beginPath();
			ctx.arc(parsed.cx, parsed.cy, parsed.radius, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			break;
		}

		case 'ellipse': {
			ctx.beginPath();
			ctx.ellipse(
				parsed.cx,
				parsed.cy,
				parsed.rx,
				parsed.ry,
				0,
				0,
				Math.PI * 2,
			);
			ctx.closePath();
			ctx.clip();
			break;
		}

		case 'inset': {
			const x = rect.left + parsed.left;
			const y = rect.top + parsed.top;
			const w = rect.width - parsed.left - parsed.right;
			const h = rect.height - parsed.top - parsed.bottom;
			ctx.beginPath();
			ctx.rect(x, y, w, h);
			ctx.clip();
			break;
		}

		default:
			break;
	}

	return () => {
		ctx.restore();
	};
}
