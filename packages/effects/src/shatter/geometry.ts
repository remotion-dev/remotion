// Adapted from Effect Craft's Shatter pattern generation, force simulation, and
// Rodrigues rotation at revision 9581b53c3f8945683252af0eb5fac79e0e43aed4:
// https://github.com/storytold/effectcraft/blob/9581b53c3f8945683252af0eb5fac79e0e43aed4/crates/effects/src/sim2.rs
// The deterministic hash is from crates/raster/src/lib.rs at the same revision.
// Used under the MIT license; see ../../THIRD_PARTY_LICENSES.md.

export type ShatterGeometryParams = {
	time: number;
	pattern: 'bricks' | 'glass' | 'hexagons' | 'squares' | 'triangles';
	repetitions: number;
	direction: number;
	origin: readonly [number, number];
	center: readonly [number, number];
	radius: number;
	depth: number;
	strength: number;
	rotationSpeed: number;
	randomness: number;
	viscosity: number;
	massVariance: number;
	gravity: number;
	seed: number;
	extrusionDepth: number;
};

type Point = [number, number];
type Vertex = [number, number, number, number, number, number, number];

const signedTriangleArea = (a: Point, b: Point, c: Point): number =>
	(b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

const hash = (x: number, y: number, seed: number): number => {
	let h =
		Math.imul(x, 0x8da6b343) ^
		Math.imul(y, 0xd8163841) ^
		Math.imul(seed, 0xcb1ab31f);
	h ^= h >>> 13;
	h = Math.imul(h, 0x5bd1e995);
	h ^= h >>> 15;
	return (h & 0x00ffffff) / 16777216;
};

function* patternCells(
	pattern: ShatterGeometryParams['pattern'],
	cell: number,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	seed: number,
): Generator<Point[]> {
	const i0 = Math.floor(x0 / cell) - 1;
	const i1 = Math.ceil(x1 / cell) + 1;
	const j0 = Math.floor(y0 / cell) - 1;
	const j1 = Math.ceil(y1 / cell) + 1;
	if (pattern === 'bricks') {
		const brickHeight = cell / 2;
		const row0 = Math.floor(y0 / brickHeight) - 1;
		const row1 = Math.ceil(y1 / brickHeight) + 1;
		for (let row = row0; row <= row1; row++) {
			const shift = Math.abs(row % 2) * cell * 0.5;
			for (let i = i0; i <= i1; i++) {
				const x = i * cell + shift;
				const y = row * brickHeight;
				yield [
					[x, y],
					[x + cell * 0.5, y],
					[x + cell, y],
					[x + cell, y + brickHeight],
					[x + cell * 0.5, y + brickHeight],
					[x, y + brickHeight],
				];
			}
		}

		return;
	}

	if (pattern === 'hexagons') {
		const radius = cell / Math.sqrt(3);
		const dx = 1.5 * radius;
		const col0 = Math.floor(x0 / dx) - 1;
		const col1 = Math.ceil(x1 / dx) + 1;
		for (let col = col0; col <= col1; col++) {
			for (let row = j0; row <= j1; row++) {
				const cx = col * dx;
				const cy = (row + Math.abs(col % 2) * 0.5) * cell;
				yield Array.from({length: 6}, (_, k): Point => {
					const angle = (k * Math.PI) / 3;
					return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
				});
			}
		}

		return;
	}

	const jitter = (i: number, j: number): Point => [
		i * cell + (hash(i, j + 17, seed) * 2 - 1) * cell * 0.35,
		j * cell + (hash(i, j + 91, seed) * 2 - 1) * cell * 0.35,
	];
	for (let j = j0; j <= j1; j++) {
		for (let i = i0; i <= i1; i++) {
			const x = i * cell;
			const y = j * cell;
			const a: Point = pattern === 'glass' ? jitter(i, j) : [x, y];
			const b: Point = pattern === 'glass' ? jitter(i + 1, j) : [x + cell, y];
			const c: Point =
				pattern === 'glass' ? jitter(i + 1, j + 1) : [x + cell, y + cell];
			const d: Point = pattern === 'glass' ? jitter(i, j + 1) : [x, y + cell];
			// A jittered cell can be concave. Only choose a diagonal whose two
			// triangles retain the cell's winding, otherwise the pieces overlap.
			const acValid =
				signedTriangleArea(a, b, c) > 0 && signedTriangleArea(a, c, d) > 0;
			const bdValid =
				signedTriangleArea(a, b, d) > 0 && signedTriangleArea(b, c, d) > 0;
			if (pattern === 'squares') {
				yield [a, b, c, d];
			} else if (
				pattern === 'glass'
					? acValid && (!bdValid || hash(i, j, seed ^ 0x55) < 0.5)
					: Math.abs((i + j) % 2) === 1
			) {
				yield [a, b, c];
				yield [a, c, d];
			} else {
				yield [a, b, d];
				yield [b, c, d];
			}
		}
	}
}

// Clip before assigning UVs: clamping outside vertices would repeat edge pixels
// on the parts of a shard that never belonged to the source image.
const clipPolygon = (
	input: Point[],
	width: number,
	height: number,
): Point[] => {
	let polygon = input;
	for (let boundary = 0; boundary < 4; boundary++) {
		const axis = boundary < 2 ? 0 : 1;
		const limit = boundary % 2 === 0 ? 0 : axis === 0 ? width : height;
		const sign = boundary % 2 === 0 ? 1 : -1;
		const output: Point[] = [];
		for (let i = 0; i < polygon.length; i++) {
			const a = polygon[i];
			const b = polygon[(i + 1) % polygon.length];
			const aInside = (a[axis] - limit) * sign >= 0;
			const bInside = (b[axis] - limit) * sign >= 0;
			if (aInside) {
				output.push(a);
			}

			if (aInside !== bInside) {
				const fraction = (limit - a[axis]) / (b[axis] - a[axis]);
				const intersection: Point = [
					a[0] + (b[0] - a[0]) * fraction,
					a[1] + (b[1] - a[1]) * fraction,
				];
				intersection[axis] = limit;
				output.push(intersection);
			}
		}

		polygon = output;
	}

	return polygon;
};

export const createShatterGeometry = (
	width: number,
	height: number,
	params: ShatterGeometryParams,
): Float32Array => {
	const identity = new Float32Array([
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		width,
		0,
		0,
		1,
		0,
		1,
		0,
		width,
		height,
		0,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		width,
		height,
		0,
		1,
		1,
		1,
		0,
		0,
		height,
		0,
		0,
		1,
		1,
		0,
	]);
	if (
		params.time === 0 ||
		params.radius <= Math.abs(params.depth) ||
		(params.strength === 0 && params.randomness === 0 && params.gravity === 0)
	) {
		return identity;
	}

	const direction = ((params.direction % 360) * Math.PI) / 180;
	const sin = Math.sin(direction);
	const cos = Math.cos(direction);
	// Beyond this range lattice indices lose useful precision. Fold those remote
	// origins to keep a finite covering grid even for extreme user input.
	const originX =
		(Math.abs(params.origin[0]) > 1e6
			? params.origin[0] % 1
			: params.origin[0]) * width;
	const originY =
		(Math.abs(params.origin[1]) > 1e6
			? params.origin[1] % 1
			: params.origin[1]) * height;
	const corners = [
		[0, 0],
		[width, 0],
		[width, height],
		[0, height],
	].map(
		([x, y]): Point => [
			(x - originX) * cos + (y - originY) * sin,
			-(x - originX) * sin + (y - originY) * cos,
		],
	);
	const x0 = Math.min(...corners.map((point) => point[0]));
	const x1 = Math.max(...corners.map((point) => point[0]));
	const y0 = Math.min(...corners.map((point) => point[1]));
	const y1 = Math.max(...corners.map((point) => point[1]));
	// At most about 50,000 candidate polygons, including the covering border.
	// Grow cells on extreme aspect ratios instead of truncating image coverage.
	let cell = Math.max(
		width / params.repetitions,
		Math.sqrt(((x1 - x0) * (y1 - y0)) / 20000),
		Math.max(x1 - x0, y1 - y0) / 10000,
	);
	while (
		2 * (Math.ceil((x1 - x0) / cell) + 5) * (Math.ceil((y1 - y0) / cell) + 5) >
		50000
	) {
		cell *= 1.1;
	}

	const seed = Math.imul(params.seed, 0x9e3779b1);
	const unit = width * 0.1;
	const drag = params.viscosity * 5;
	const {time} = params;
	const velocityFactor = drag < 1e-6 ? time : -Math.expm1(-drag * time) / drag;
	const gravityFactor =
		drag < 1e-6
			? (time * time) / 2
			: drag * time < 1e-3
				? time * time * (0.5 - (drag * time) / 6 + (drag * time) ** 2 / 24)
				: (time - velocityFactor) / drag;
	const radius = params.radius * width;
	const depth = params.depth * width;
	const centerX = params.center[0] * width;
	const centerY = params.center[1] * height;
	const extrusion = params.extrusionDepth * cell;
	const cameraDistance = Math.max(width, height) * 2;
	const faces: {depth: number; vertices: Vertex[]}[] = [];
	let key = 0;
	let anyMoving = false;
	for (const patternPolygon of patternCells(
		params.pattern,
		cell,
		x0,
		y0,
		x1,
		y1,
		seed,
	)) {
		const index = key++;
		const sourcePolygon = patternPolygon.map(
			([x, y]): Point => [
				originX + x * cos - y * sin,
				originY + x * sin + y * cos,
			],
		);
		const polygon = clipPolygon(sourcePolygon, width, height);
		if (polygon.length < 3) {
			continue;
		}

		const cx =
			sourcePolygon.reduce((sum, point) => sum + point[0], 0) /
			sourcePolygon.length;
		const cy =
			sourcePolygon.reduce((sum, point) => sum + point[1], 0) /
			sourcePolygon.length;
		const dx = cx - centerX;
		const dy = cy - centerY;
		const distance = Math.hypot(dx, dy, depth);
		const broken = distance < radius;
		let px = cx;
		let py = cy;
		let pz = 0;
		let rotation = [1, 0, 0, 0, 1, 0, 0, 0, 1];
		if (broken) {
			const force =
				(params.strength * (1 - distance / radius) * unit) /
				Math.max(distance, 1e-6);
			const mass = Math.max(
				1e-3,
				1 + params.massVariance * (hash(index, 1, seed) * 2 - 1),
			);
			const vx =
				(dx * force) / mass +
				params.randomness * unit * (hash(index, 2, seed) * 2 - 1) * 2;
			const vy =
				(dy * force) / mass +
				params.randomness * unit * (hash(index, 3, seed) * 2 - 1) * 2;
			const vz =
				(depth * force) / mass +
				params.randomness * unit * (hash(index, 4, seed) * 2 - 1) * 2;
			px += vx * velocityFactor;
			py += vy * velocityFactor + params.gravity * unit * gravityFactor;
			pz += vz * velocityFactor;
			const axis = [
				hash(index, 6, seed) * 2 - 1,
				hash(index, 7, seed) * 2 - 1,
				hash(index, 8, seed) * 2 - 1,
			];
			const axisLength = Math.hypot(...axis);
			const speed = Math.min(10, Math.hypot(vx, vy, vz) / unit);
			const angle =
				params.rotationSpeed *
				Math.PI *
				2 *
				(0.5 + hash(index, 9, seed)) *
				speed *
				velocityFactor;
			if (axisLength > 1e-12 && angle !== 0) {
				const [x, y, z] = axis.map((value) => value / axisLength);
				const s = Math.sin(angle);
				const c = Math.cos(angle);
				const t = 1 - c;
				rotation = [
					t * x * x + c,
					t * x * y - s * z,
					t * x * z + s * y,
					t * x * y + s * z,
					t * y * y + c,
					t * y * z - s * x,
					t * x * z - s * y,
					t * y * z + s * x,
					t * z * z + c,
				];
			}
		}

		const moving =
			px !== cx ||
			py !== cy ||
			pz !== 0 ||
			rotation.some(
				(value, axisIndex) => value !== (axisIndex % 4 === 0 ? 1 : 0),
			);
		anyMoving ||= moving;
		const shade = moving ? 0.25 + 0.75 * Math.abs(rotation[8]) : 1;
		const vertices = polygon.map(
			([x, y]): Vertex => [
				px + rotation[0] * (x - cx) + rotation[1] * (y - cy),
				py + rotation[3] * (x - cx) + rotation[4] * (y - cy),
				pz + rotation[6] * (x - cx) + rotation[7] * (y - cy),
				x / width,
				y / height,
				shade,
				0,
			],
		);
		// Extremely large but finite public inputs can overflow physics arithmetic.
		// Such moving shards are outside the camera's useful range.
		if (
			vertices.some((vertex) =>
				vertex.some(
					(value) => !Number.isFinite(value) || Math.abs(value) > 1e30,
				),
			)
		) {
			continue;
		}

		faces.push({
			depth:
				vertices.reduce((sum, vertex) => sum + vertex[2], 0) / vertices.length,
			vertices,
		});
		if (!moving || extrusion === 0) {
			continue;
		}

		for (let edge = 0; edge < polygon.length; edge++) {
			const a = polygon[edge];
			const b = polygon[(edge + 1) % polygon.length];
			const edgeX = b[0] - a[0];
			const edgeY = b[1] - a[1];
			const length = Math.hypot(edgeX, edgeY);
			if (length < 1e-6) {
				continue;
			}

			const nx = (rotation[0] * edgeY - rotation[1] * edgeX) / length;
			const ny = (rotation[3] * edgeY - rotation[4] * edgeX) / length;
			const nz = (rotation[6] * edgeY - rotation[7] * edgeX) / length;
			const frontA = vertices[edge];
			const frontB = vertices[(edge + 1) % vertices.length];
			const mx = (frontA[0] + frontB[0] + rotation[2] * extrusion) / 2;
			const my = (frontA[1] + frontB[1] + rotation[5] * extrusion) / 2;
			const mz = (frontA[2] + frontB[2] + rotation[8] * extrusion) / 2;
			if (
				nx * (width / 2 - mx) +
					ny * (height / 2 - my) +
					nz * (-cameraDistance - mz) <=
				0
			) {
				continue;
			}

			const au = a[0] / width;
			const av = a[1] / height;
			const bu = b[0] / width;
			const bv = b[1] / height;
			const sideShade = 0.25 + 0.75 * Math.abs(nz);
			const sideVertices: Vertex[] = [
				[frontA[0], frontA[1], frontA[2], au, av, sideShade, 1],
				[frontB[0], frontB[1], frontB[2], bu, bv, sideShade, 1],
				[
					frontB[0] + rotation[2] * extrusion,
					frontB[1] + rotation[5] * extrusion,
					frontB[2] + rotation[8] * extrusion,
					bu,
					bv,
					sideShade,
					1,
				],
				[
					frontA[0] + rotation[2] * extrusion,
					frontA[1] + rotation[5] * extrusion,
					frontA[2] + rotation[8] * extrusion,
					au,
					av,
					sideShade,
					1,
				],
			];
			if (
				sideVertices.every((vertex) =>
					vertex.every(
						(value) => Number.isFinite(value) && Math.abs(value) < 1e30,
					),
				)
			) {
				faces.push({depth: mz, vertices: sideVertices});
			}
		}
	}

	if (!anyMoving) {
		return identity;
	}

	faces.sort((a, b) => b.depth - a.depth);
	const floatCount = faces.reduce((sum, face) => {
		const centered = params.pattern === 'bricks' && face.vertices[0][6] === 0;
		return sum + (face.vertices.length - (centered ? 0 : 2)) * 3 * 7;
	}, 0);
	const output = new Float32Array(floatCount);
	let offset = 0;
	for (const face of faces) {
		// Split brick edges where staggered neighbors meet. A fan from the center
		// keeps those collinear midpoints in the mesh and avoids raster T-junctions.
		const centered = params.pattern === 'bricks' && face.vertices[0][6] === 0;
		const center = centered
			? face.vertices[0].map(
					(_, component) =>
						face.vertices.reduce((sum, vertex) => sum + vertex[component], 0) /
						face.vertices.length,
				)
			: face.vertices[0];
		const triangleCount = face.vertices.length - (centered ? 0 : 2);
		for (let i = 0; i < triangleCount; i++) {
			const start = centered ? i : i + 1;
			for (const vertex of [
				center,
				face.vertices[start],
				face.vertices[(start + 1) % face.vertices.length],
			]) {
				output.set(vertex, offset);
				offset += 7;
			}
		}
	}

	return output;
};
