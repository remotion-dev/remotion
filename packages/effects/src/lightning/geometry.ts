// Adapted from EffectCraft's lightning_segments() and Rng (MIT).
// See ../../THIRD_PARTY_LICENSES.md.
import type {LightningParams} from './params.js';

type Point = readonly [number, number];
type Segment = {start: Point; end: Point; intensity: number; main: boolean};

export const lightningSegments = (
	p: Required<LightningParams>,
	width: number,
	height: number,
	alpha: ImageData | null,
): Segment[] => {
	const seed =
		BigInt(Math.floor(p.conductivityState)) ^ (BigInt(p.seed) << 32n);
	let state =
		(BigInt.asUintN(64, seed * 0x9e3779b97f4a7c15n) ^ 0xd1b54a32d192ed03n) | 1n;
	const random = () => {
		state ^= state >> 12n;
		state ^= BigInt.asUintN(64, state << 25n);
		state ^= state >> 27n;
		return (
			Number(BigInt.asUintN(64, state * 0x2545f4914f6cdd1dn) >> 11n) / 2 ** 53
		);
	};

	const alphaAt = (x: number, y: number): number => {
		if (!alpha) return 0;
		const px = Math.max(0, Math.min(width - 1, x - 0.5));
		const py = Math.max(0, Math.min(height - 1, y - 0.5));
		const x0 = Math.floor(px);
		const y0 = Math.floor(py);
		const x1 = Math.min(width - 1, x0 + 1);
		const y1 = Math.min(height - 1, y0 + 1);
		const tx = px - x0;
		const ty = py - y0;
		const {data} = alpha;
		return (
			((data[(y0 * width + x0) * 4 + 3] * (1 - tx) +
				data[(y0 * width + x1) * 4 + 3] * tx) *
				(1 - ty) +
				(data[(y1 * width + x0) * 4 + 3] * (1 - tx) +
					data[(y1 * width + x1) * 4 + 3] * tx) *
					ty) /
			255
		);
	};

	const origin: Point = [p.origin[0] * width, p.origin[1] * height];
	const direction: Point = [p.direction[0] * width, p.direction[1] * height];
	const dx = direction[0] - origin[0];
	const dy = direction[1] - origin[1];
	const distance = Math.hypot(dx, dy);
	const depth = p.complexity + Number(p.fractalType === 'spline');
	const shape = {linear: 1, 'semi-linear': 0.7, spline: 0.45}[p.fractalType];
	const turbulence = p.turbulence * (p.lightningType === 'bouncy' ? 1.6 : 1);
	const forking =
		p.lightningType === 'breaking'
			? Math.min(1, p.forking * (0.5 + distance / Math.max(width, height, 1)))
			: p.forking;
	const segments: Segment[] = [];
	const grow = (segment: Segment, remaining: number): void => {
		const {start, end, intensity, main} = segment;
		if (segments.length > 20000) return;
		const vx = end[0] - start[0];
		const vy = end[1] - start[1];
		const length = Math.hypot(vx, vy);
		if (remaining === 0 || length < 1) {
			segments.push(segment);
			return;
		}

		const nx = -vy / length;
		const ny = vx / length;
		let offset = (random() * 2 - 1) * length * 0.22 * turbulence * shape;
		const mx = (start[0] + end[0]) / 2;
		const my = (start[1] + end[1]) / 2;
		if (alpha && (main || !p.mainCoreCollisionOnly)) {
			const delta =
				alphaAt(mx + nx * offset, my + ny * offset) -
				alphaAt(mx - nx * offset, my - ny * offset);
			if (
				delta * p.alphaObstacle > 0 &&
				random() < Math.abs(p.alphaObstacle) / 10
			)
				offset = -offset;
		}

		const mid: Point = [mx + nx * offset, my + ny * offset];
		if (
			!main &&
			p.alphaObstacle > 0 &&
			alphaAt(...mid) > 0.5 &&
			random() < p.alphaObstacle / 10
		)
			return;
		grow({start, end: mid, intensity, main}, remaining - 1);
		grow({start: mid, end, intensity, main}, remaining - 1);
		if (
			random() < forking &&
			intensity > p.terminationThreshold &&
			length >= p.minForkDistance
		) {
			const angle = (random() * 2 - 1) * 0.7;
			const fx = mid[0] - start[0];
			const fy = mid[1] - start[1];
			const forkEnd: Point = [
				mid[0] + 1.2 * (fx * Math.cos(angle) - fy * Math.sin(angle)),
				mid[1] + 1.2 * (fx * Math.sin(angle) + fy * Math.cos(angle)),
			];
			const variation =
				p.forkVariation > 0 ? 1 - p.forkVariation * random() : 1;
			grow(
				{
					start: mid,
					end: forkEnd,
					intensity: Math.min(
						1,
						intensity * (1 - p.decay) * p.forkStrength * 2 * variation,
					),
					main: false,
				},
				remaining - 1,
			);
		}
	};

	const growMain = (start: Point, end: Point, subdivisions: number) =>
		grow({start, end, intensity: 1, main: true}, subdivisions);

	switch (p.lightningType) {
		case 'direction':
			growMain(origin, [origin[0] + dx * 3, origin[1] + dy * 3], depth);
			break;
		case 'vertical':
			growMain(origin, [origin[0], height], depth);
			break;
		case 'two-way-strike': {
			const mid: Point = [origin[0] + dx / 2, origin[1] + dy / 2];
			const halfDepth = Math.max(1, depth - 1);
			growMain(origin, mid, halfDepth);
			growMain(direction, mid, halfDepth);
			break;
		}

		case 'omni':
		case 'anywhere': {
			const radius = Math.max(distance, Math.min(width, height) * 0.25);
			for (let i = 0; i < 4; i++) {
				const angle = random() * 2 * Math.PI;
				const length =
					p.lightningType === 'anywhere'
						? radius * (0.3 + 0.7 * random())
						: radius;
				growMain(
					origin,
					[
						origin[0] + Math.cos(angle) * length,
						origin[1] + Math.sin(angle) * length,
					],
					depth,
				);
			}

			break;
		}

		default:
			growMain(origin, direction, depth);
	}

	if (p.decayMainCore || p.coreDrain > 0) {
		const distanceFromOrigin = (point: Point) =>
			Math.hypot(point[0] - origin[0], point[1] - origin[1]);
		const farthest = segments.reduce(
			(max, segment) => Math.max(max, distanceFromOrigin(segment.end)),
			1e-9,
		);
		for (const segment of segments) {
			const fraction = distanceFromOrigin(segment.start) / farthest;
			if (p.decayMainCore)
				segment.intensity *= Math.max(0, 1 - p.decay * fraction);
			if (segment.main)
				segment.intensity *= Math.max(0, 1 - p.coreDrain * fraction);
		}
	}

	return segments;
};
