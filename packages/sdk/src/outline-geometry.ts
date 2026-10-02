export type CanvasOutlinePoint = {
	readonly x: number;
	readonly y: number;
};

/** Geometry in CSS pixels relative to the unscaled outline container. */
export type CanvasOutline = {
	readonly key: string;
	readonly dimensions: {
		readonly width: number;
		readonly height: number;
	} | null;
	readonly uncroppedPoints:
		| readonly [
				CanvasOutlinePoint,
				CanvasOutlinePoint,
				CanvasOutlinePoint,
				CanvasOutlinePoint,
		  ]
		| null;
	readonly points: readonly [
		CanvasOutlinePoint,
		CanvasOutlinePoint,
		CanvasOutlinePoint,
		CanvasOutlinePoint,
	];
	/**
	 * The SVG geometry of a path element, in the same space as
	 * `uncroppedPoints`. Crop is not baked in — the outline always shows the
	 * full geometry. Null for non-path elements, or when the geometry cannot
	 * be read.
	 */
	readonly path: CanvasOutlinePath | null;
};

/** Affine transform mapping SVG user units to overlay container pixels. */
export type CanvasOutlineMatrix = {
	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
};

/** The exact geometry of an SVG path element, without sampling. */
export type CanvasOutlinePath = {
	readonly d: string;
	readonly matrix: CanvasOutlineMatrix;
};

const mix = (from: number, to: number, progress: number): number => {
	return from + (to - from) * progress;
};

const mixPoint = (
	from: CanvasOutlinePoint,
	to: CanvasOutlinePoint,
	progress: number,
): CanvasOutlinePoint => {
	return {
		x: mix(from.x, to.x, progress),
		y: mix(from.y, to.y, progress),
	};
};

export type CanvasOutlineUv = readonly [number, number];

const getBilinearUvHandlePosition = (
	points: CanvasOutline['points'],
	uv: CanvasOutlineUv,
): CanvasOutlinePoint => {
	const [tl, tr, br, bl] = points;
	const top = mixPoint(tl, tr, uv[0]);
	const bottom = mixPoint(bl, br, uv[0]);
	return mixPoint(top, bottom, uv[1]);
};

type ProjectiveTransform = {
	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
	readonly g: number;
	readonly h: number;
};

const projectiveEpsilon = 0.000001;

const getProjectiveTransform = (
	points: CanvasOutline['points'],
): ProjectiveTransform | null => {
	const [tl, tr, br, bl] = points;
	const dx1 = tr.x - br.x;
	const dx2 = bl.x - br.x;
	const dx3 = tl.x - tr.x + br.x - bl.x;
	const dy1 = tr.y - br.y;
	const dy2 = bl.y - br.y;
	const dy3 = tl.y - tr.y + br.y - bl.y;

	let g = 0;
	let h = 0;
	if (Math.abs(dx3) > projectiveEpsilon || Math.abs(dy3) > projectiveEpsilon) {
		const determinant = dx1 * dy2 - dx2 * dy1;
		if (Math.abs(determinant) < projectiveEpsilon) {
			return null;
		}

		g = (dx3 * dy2 - dx2 * dy3) / determinant;
		h = (dx1 * dy3 - dx3 * dy1) / determinant;
	}

	return {
		a: tr.x - tl.x + g * tr.x,
		b: bl.x - tl.x + h * bl.x,
		c: tl.x,
		d: tr.y - tl.y + g * tr.y,
		e: bl.y - tl.y + h * bl.y,
		f: tl.y,
		g,
		h,
	};
};

const applyProjectiveTransform = (
	transform: ProjectiveTransform,
	uv: CanvasOutlineUv,
): CanvasOutlinePoint => {
	const denominator = transform.g * uv[0] + transform.h * uv[1] + 1;
	return {
		x: (transform.a * uv[0] + transform.b * uv[1] + transform.c) / denominator,
		y: (transform.d * uv[0] + transform.e * uv[1] + transform.f) / denominator,
	};
};

/** Maps normalized coordinates onto a quad, including perspective transforms. */
export const getCanvasOutlinePoint = (
	points: CanvasOutline['points'],
	uv: CanvasOutlineUv,
): CanvasOutlinePoint => {
	const transform = getProjectiveTransform(points);
	return transform === null
		? getBilinearUvHandlePosition(points, uv)
		: applyProjectiveTransform(transform, uv);
};

const vectorBetween = (
	from: CanvasOutlinePoint,
	to: CanvasOutlinePoint,
): CanvasOutlinePoint => {
	return {x: to.x - from.x, y: to.y - from.y};
};

const getBilinearUvCoordinateForPoint = (
	points: CanvasOutline['points'],
	point: CanvasOutlinePoint,
): CanvasOutlineUv => {
	const [tl, tr, br, bl] = points;
	let u = 0.5;
	let v = 0.5;

	for (let i = 0; i < 8; i++) {
		const current = getBilinearUvHandlePosition(points, [u, v]);
		const errorX = current.x - point.x;
		const errorY = current.y - point.y;
		if (Math.abs(errorX) + Math.abs(errorY) < 0.001) {
			break;
		}

		const du = {
			x: mix(tr.x - tl.x, br.x - bl.x, v),
			y: mix(tr.y - tl.y, br.y - bl.y, v),
		};
		const dv = vectorBetween(mixPoint(tl, tr, u), mixPoint(bl, br, u));
		const determinant = du.x * dv.y - du.y * dv.x;
		if (Math.abs(determinant) < 0.000001) {
			break;
		}

		u -= (errorX * dv.y - errorY * dv.x) / determinant;
		v -= (du.x * errorY - du.y * errorX) / determinant;
	}

	return [u, v];
};

/** Maps a point back to normalized coordinates within an outline quad. */
export const getCanvasOutlineUv = (
	points: CanvasOutline['points'],
	point: CanvasOutlinePoint,
): CanvasOutlineUv => {
	const transform = getProjectiveTransform(points);
	if (transform === null) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	const determinant =
		transform.a * (transform.e - transform.f * transform.h) -
		transform.b * (transform.d - transform.f * transform.g) +
		transform.c * (transform.d * transform.h - transform.e * transform.g);
	if (Math.abs(determinant) < projectiveEpsilon) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	const inverseA = transform.e - transform.f * transform.h;
	const inverseB = transform.c * transform.h - transform.b;
	const inverseC = transform.b * transform.f - transform.c * transform.e;
	const inverseD = transform.f * transform.g - transform.d;
	const inverseE = transform.a - transform.c * transform.g;
	const inverseF = transform.c * transform.d - transform.a * transform.f;
	const inverseG = transform.d * transform.h - transform.e * transform.g;
	const inverseH = transform.b * transform.g - transform.a * transform.h;
	const inverseI = transform.a * transform.e - transform.b * transform.d;

	const denominator = inverseG * point.x + inverseH * point.y + inverseI;
	if (Math.abs(denominator) < projectiveEpsilon) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	return [
		(inverseA * point.x + inverseB * point.y + inverseC) / denominator,
		(inverseD * point.x + inverseE * point.y + inverseF) / denominator,
	];
};

/** The fraction cropped from each edge of the original element. */
export type CanvasOutlineCrop = {
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly bottom: number;
};

export type CanvasOutlineTarget = {
	readonly key: string;
	readonly ref: React.RefObject<Element | null>;
	readonly crop: CanvasOutlineCrop;
	readonly includeOutsideContainer: boolean;
};
