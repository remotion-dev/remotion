import {
	BoxGeometry,
	CatmullRomCurve3,
	CylinderGeometry,
	ExtrudeGeometry,
	Group,
	LatheGeometry,
	Object3D,
	Path,
	Shape,
	Vector2,
	Vector3,
} from 'three';
import type {LineArt} from './line-art';
import {PAWL_ANGLES, TOOTH_PITCH, RATCHET_TEETH} from './timeline';

// Swix Roadline Classic (RSRC10), in millimetres. Ski length runs along +x
// (front), +y is up from the ground and +z is the outer side of the ski.
// Published figures: 790 mm long, 725 mm wheelbase, 45 mm shaft, 67 x 50 mm
// wheels with a 43 mm rolling surface, 3.5 mm RCT spacers (51.6 mm over the
// spacers). Everything else is proportioned from product photos.
export const SPEC = {
	axleX: 362.5,
	axleY: 33.5,
	wheelRadius: 33.5,
	frameHalfLength: 300,
	frameHalfWidth: 22.5,
	frameBottom: 33,
	frameTop: 55,
	spacerOuter: 25.8,
	cheekThickness: 6,
};

const RING_TIP = 8.4;
const RING_ROOT = 9.6;
const PAWL_PIVOT_RADIUS = 6.4;
const PAWL_LENGTH = 4;

type Kit = LineArt;

// Revolves a closed (r, z) outline around the z axis.
const lathe = (profile: [number, number][], segments: number) => {
	const points = profile.map(([r, z]) => new Vector2(r, z));
	points.push(points[0].clone());
	const geometry = new LatheGeometry(points, segments);
	geometry.rotateX(Math.PI / 2);
	return geometry;
};

const disk = (radius: number, height: number, segments = 48) => {
	const geometry = new CylinderGeometry(radius, radius, height, segments);
	geometry.rotateX(Math.PI / 2);
	return geometry;
};

const extrude = (
	shape: Shape,
	depth: number,
	curveSegments = 24,
	bevel = 0,
) => {
	const geometry = new ExtrudeGeometry(shape, {
		depth,
		curveSegments,
		bevelEnabled: bevel > 0,
		bevelSize: bevel,
		bevelThickness: bevel,
		bevelSegments: 2,
	});
	geometry.translate(0, 0, -depth / 2);
	return geometry;
};

const roundedRect = (
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	r: number,
) => {
	const s = new Shape();
	s.moveTo(x0 + r, y0);
	s.lineTo(x1 - r, y0);
	s.quadraticCurveTo(x1, y0, x1, y0 + r);
	s.lineTo(x1, y1 - r);
	s.quadraticCurveTo(x1, y1, x1 - r, y1);
	s.lineTo(x0 + r, y1);
	s.quadraticCurveTo(x0, y1, x0, y1 - r);
	s.lineTo(x0, y0 + r);
	s.quadraticCurveTo(x0, y0, x0 + r, y0);
	return s;
};

// A plan-view outline (x along the ski, z across) extruded upwards.
const plate = (
	x0: number,
	x1: number,
	halfWidth: number,
	r: number,
	height: number,
) => {
	const geometry = extrude(
		roundedRect(x0, -halfWidth, x1, halfWidth, r),
		height,
		8,
	);
	geometry.rotateX(-Math.PI / 2);
	geometry.translate(0, height / 2, 0);
	return geometry;
};

const group = (parent: Object3D, name: string, x = 0, y = 0, z = 0) => {
	const g = new Group();
	g.name = name;
	g.position.set(x, y, z);
	parent.add(g);
	return g;
};

// ---------------------------------------------------------------------------
// Shaft

const buildFrame = (kit: Kit, parent: Object3D) => {
	const frame = group(parent, 'Hollow aluminium U-profile shaft');
	const W = SPEC.frameHalfWidth;
	const B = SPEC.frameBottom;
	const top = SPEC.frameTop;
	const wall = 2.4;
	const deck = 2.6;
	const lip = 2.2;
	const lipIn = 2.1;
	const r = 3;
	const s = new Shape();
	s.moveTo(-W, B);
	s.lineTo(-W + wall + lipIn, B);
	s.lineTo(-W + wall + lipIn, B + lip);
	s.lineTo(-W + wall, B + lip);
	s.lineTo(-W + wall, top - deck);
	s.lineTo(W - wall, top - deck);
	s.lineTo(W - wall, B + lip);
	s.lineTo(W - wall - lipIn, B + lip);
	s.lineTo(W - wall - lipIn, B);
	s.lineTo(W, B);
	s.lineTo(W, top - r);
	s.quadraticCurveTo(W, top, W - r, top);
	s.lineTo(-W + r, top);
	s.quadraticCurveTo(-W, top, -W, top - r);
	s.closePath();
	const length = SPEC.frameHalfLength * 2;
	const geometry = new ExtrudeGeometry(s, {
		depth: length,
		bevelEnabled: false,
		curveSegments: 6,
	});
	geometry.rotateY(Math.PI / 2);
	geometry.translate(-SPEC.frameHalfLength, 0, 0);
	kit.add(frame, geometry, 'Shaft extrusion');

	// The reflective side stripe, as a barely raised band on both faces.
	const stripe = new BoxGeometry(392, 6, 0.24);
	kit.add(frame, stripe, 'Side stripe (outer)', -46, 42.5, W + 0.12);
	kit.add(frame, stripe, 'Side stripe (inner)', -46, 42.5, -W - 0.12);

	// A few of the pre-drilled binding holes outside the binding footprint.
	const hole = new CylinderGeometry(1.7, 1.7, 0.3, 24);
	for (const x of [148, 166, 184, -226, -244, -262]) {
		kit.add(frame, hole, 'Pre-drilled binding hole', x, top + 0.15, 0);
	}
	return frame;
};

// ---------------------------------------------------------------------------
// Fork (built for the rear end: axle at the origin, shaft towards +x)

const cheekShape = () => {
	const boss = 12;
	const slot = 3.2;
	const slotAngle = Math.acos(slot / boss);
	const s = new Shape();
	s.moveTo(72, 23.5);
	s.bezierCurveTo(48, 23.5, 30, boss + 0.6, 0, boss);
	s.absarc(0, 0, boss, Math.PI / 2, Math.PI + slotAngle, false);
	s.lineTo(-slot, 0);
	s.absarc(0, 0, slot, Math.PI, 0, true);
	s.lineTo(slot, -Math.sqrt(boss * boss - slot * slot));
	s.absarc(0, 0, boss, Math.PI * 2 - slotAngle, Math.PI * 2 - 0.36, false);
	s.bezierCurveTo(28, -6, 46, -2.5, 72, -2.5);
	s.closePath();
	return s;
};

const buildBolt = (
	kit: Kit,
	parent: Object3D,
	name: string,
	z: number,
	outward: 1 | -1,
) => {
	const bolt = group(parent, name, 0, 0, z);
	bolt.scale.z = outward;
	kit.add(
		bolt,
		lathe(
			[
				[0.01, 0],
				[5, 0],
				[5, 1.8],
				[4.3, 2.5],
				[0.01, 2.5],
			],
			48,
		),
		'Axle screw head',
	);
	const hex = new CylinderGeometry(2.3, 2.3, 0.1, 6);
	hex.rotateX(Math.PI / 2);
	kit.add(bolt, hex, 'Hex socket', 0, 0, 2.55);
	return bolt;
};

const buildFender = (kit: Kit, parent: Object3D) => {
	const fender = group(parent, 'Fender with vibration damping');
	const R = 39;
	const join = (50 * Math.PI) / 180;
	const joinX = Math.cos(join) * R;
	const joinY = Math.sin(join) * R;
	const path = new Path();
	path.moveTo(58, 26);
	path.lineTo(41, 26);
	path.bezierCurveTo(
		35,
		26,
		joinX + Math.sin(join) * 5,
		joinY - Math.cos(join) * 5,
		joinX,
		joinY,
	);
	path.absarc(0, 0, R, join, Math.PI * 1.075, false);
	const end = new Vector2(
		Math.cos(Math.PI * 1.075) * R,
		Math.sin(Math.PI * 1.075) * R,
	);
	path.bezierCurveTo(
		end.x + 1.2,
		end.y - 4,
		end.x - 2.5,
		end.y - 7.5,
		end.x - 5.5,
		end.y - 9,
	);
	const points = path.getSpacedPoints(140).map((p) => new Vector3(p.x, p.y, 0));
	const curve = new CatmullRomCurve3(points, false, 'centripetal');

	const half = 29;
	const skirt = 6;
	const shell = 2.4;
	const section = new Shape();
	section.moveTo(-half + 1.5, 0);
	section.lineTo(half - 1.5, 0);
	section.quadraticCurveTo(half, 0, half, 1.5);
	section.lineTo(half, skirt);
	section.lineTo(half - shell, skirt);
	section.lineTo(half - shell, shell);
	section.lineTo(-half + shell, shell);
	section.lineTo(-half + shell, skirt);
	section.lineTo(-half, skirt);
	section.lineTo(-half, 1.5);
	section.quadraticCurveTo(-half, 0, -half + 1.5, 0);
	const geometry = new ExtrudeGeometry(section, {
		steps: 150,
		bevelEnabled: false,
		extrudePath: curve,
		curveSegments: 4,
	});
	kit.add(fender, geometry, 'Fender shell');
	const screw = disk(2.6, 1, 32);
	screw.rotateX(Math.PI / 2);
	kit.add(fender, screw, 'Fender screw', 47, 26.5, 13);
	kit.add(fender, screw, 'Fender screw', 47, 26.5, -13);
	return fender;
};

const buildFork = (kit: Kit, parent: Object3D, name: string) => {
	const fork = group(parent, name);
	const bridge = plate(38, 74, SPEC.spacerOuter + SPEC.cheekThickness, 4, 26);
	bridge.translate(0, -2.5, 0);
	kit.add(fork, bridge, 'Fork crown');
	const cheek = extrude(cheekShape(), SPEC.cheekThickness, 48);
	const cheekZ = SPEC.spacerOuter + SPEC.cheekThickness / 2;
	kit.add(fork, cheek, 'CNC-machined RCT fork cheek (outer)', 0, 0, cheekZ);
	kit.add(fork, cheek, 'CNC-machined RCT fork cheek (inner)', 0, 0, -cheekZ);
	const crownBolt = disk(3.2, 1.2, 32);
	const outerFace = SPEC.spacerOuter + SPEC.cheekThickness;
	kit.add(fork, crownBolt, 'Crown bolt', 57, 10.5, outerFace + 0.6);
	kit.add(fork, crownBolt, 'Crown bolt', 57, 10.5, -outerFace - 0.6);
	const outerBolt = buildBolt(kit, fork, 'Axle screw (outer)', outerFace, 1);
	const innerBolt = buildBolt(kit, fork, 'Axle screw (inner)', -outerFace, -1);
	buildFender(kit, fork);
	return {fork, bolts: [outerBolt, innerBolt]};
};

// ---------------------------------------------------------------------------
// Wheel

export type WheelPart = {
	readonly group: Group;
	readonly base: number;
	spread: number;
};

const tyreProfile = (section: boolean): [number, number][] => {
	const shoulder: [number, number][] = [];
	for (let i = 0; i <= 6; i++) {
		const a = (i / 6) * (Math.PI / 2);
		shoulder.push([28.5 + 5 * Math.sin(a), 21.5 + 3.5 * Math.cos(a)]);
	}
	const far = shoulder.map(([r, z]) => [r, -z] as [number, number]);
	const near = [...shoulder].reverse();
	if (section) {
		return [[16, -25], ...far, [33.5, -0.6], [32.9, 0], [16, 0]];
	}
	return [
		[16, -25],
		...far,
		[33.5, -0.6],
		[32.9, 0],
		[33.5, 0.6],
		...near,
		[16, 25],
	];
};

const toothRing = (depth: number) => {
	const s = new Shape();
	s.absarc(0, 0, 11, 0, Math.PI * 2, false);
	const hole = new Path();
	const steps = 4;
	for (let k = 0; k < RATCHET_TEETH; k++) {
		const a0 = k * TOOTH_PITCH;
		const root = new Vector2(
			Math.cos(a0) * RING_ROOT,
			Math.sin(a0) * RING_ROOT,
		);
		if (k === 0) hole.moveTo(root.x, root.y);
		else hole.lineTo(root.x, root.y);
		for (let j = 1; j <= steps; j++) {
			const a = a0 + (TOOTH_PITCH * j) / steps;
			const r = RING_ROOT - ((RING_ROOT - RING_TIP) * j) / steps;
			hole.lineTo(Math.cos(a) * r, Math.sin(a) * r);
		}
	}
	hole.closePath();
	s.holes.push(hole);
	return extrude(s, depth, 96);
};

const pawlShape = () => {
	const L = PAWL_LENGTH;
	const s = new Shape();
	s.moveTo(0, -1);
	s.lineTo(L - 0.45, -0.55);
	s.lineTo(L, 0.05);
	s.lineTo(L - 0.3, 0.62);
	s.lineTo(0.21, 0.98);
	s.absarc(0, 0, 1, Math.acos(0.21), Math.PI * 1.5, false);
	return s;
};

// Pivot angle that puts the pawl tip exactly on `tipAngle` when it is fully
// extended into a tooth root, i.e. in the locked position.
const pivotAngleFor = (tipAngle: number) => {
	const rv = PAWL_PIVOT_RADIUS;
	const L = PAWL_LENGTH;
	const gamma = -Math.acos(
		(RING_ROOT * RING_ROOT - rv * rv - L * L) / (2 * rv * L),
	);
	return tipAngle - Math.atan2(L * Math.sin(gamma), rv + L * Math.cos(gamma));
};

export type Pawl = {
	readonly group: Group;
	readonly pivot: number;
	readonly tip: number;
};

const buildPawls = (kit: Kit, parent: Object3D, depth: number, z: number) => {
	const geometry = extrude(pawlShape(), depth, 16);
	const pin = disk(0.45, 0.2, 16);
	return PAWL_ANGLES.map((tip, i) => {
		const pivot = pivotAngleFor(tip);
		const g = group(
			parent,
			`Pawl ${i + 1}`,
			Math.cos(pivot) * PAWL_PIVOT_RADIUS,
			Math.sin(pivot) * PAWL_PIVOT_RADIUS,
			z,
		);
		kit.add(g, geometry, `Pawl ${i + 1} leaf`);
		kit.add(g, pin, `Pawl ${i + 1} pin`, 0, 0, depth / 2 + 0.1);
		return {group: g, pivot, tip};
	});
};

/** Pose a pawl so its tip rides the saw-tooth contour of a ring at `alpha`. */
export const posePawl = (pawl: Pawl, alpha: number) => {
	const rv = PAWL_PIVOT_RADIUS;
	const L = PAWL_LENGTH;
	let tipAngle = pawl.tip;
	let gamma = 0;
	for (let i = 0; i < 4; i++) {
		const m = (tipAngle - alpha) / TOOTH_PITCH;
		const phase = m - Math.floor(m);
		const r = RING_ROOT - (RING_ROOT - RING_TIP) * phase;
		const c = (r * r - rv * rv - L * L) / (2 * rv * L);
		gamma = pawl.pivot - Math.acos(Math.max(-1, Math.min(1, c)));
		tipAngle = Math.atan2(
			rv * Math.sin(pawl.pivot) + L * Math.sin(gamma),
			rv * Math.cos(pawl.pivot) + L * Math.cos(gamma),
		);
	}
	pawl.group.rotation.z = gamma;
};

export type Wheel = {
	readonly root: Group;
	readonly parts: WheelPart[];
	readonly spinning: Group[];
	readonly pawls: Pawl[];
};

const buildWheel = (
	kit: Kit,
	parent: Object3D,
	name: string,
	ratchet: boolean,
): Wheel => {
	const root = group(parent, name);
	const parts: WheelPart[] = [];
	const spinning: Group[] = [];
	const part = (label: string, base: number) => {
		const g = group(root, label, 0, 0, base);
		parts.push({group: g, base, spread: 0});
		return g;
	};

	// No axle sleeve here: the cold open threads the camera along the axle, and
	// a long narrow tube would hide everything else while the camera is in it.
	const spacer = (label: string, base: number, sign: 1 | -1) => {
		const g = part(label, base);
		kit.add(
			g,
			lathe(
				[
					[4, -1.75 * sign],
					[13, -1.75 * sign],
					[13, 1.25 * sign],
					[12.5, 1.75 * sign],
					[4, 1.75 * sign],
				],
				96,
			),
			label,
		);
	};
	const bearingProfile: [number, number][] = [
		[4, -3.5],
		[5.6, -3.5],
		[5.6, -3.2],
		[9.4, -3.2],
		[9.4, -3.5],
		[11, -3.5],
		[11, 3.5],
		[9.4, 3.5],
		[9.4, 3.2],
		[5.6, 3.2],
		[5.6, 3.5],
		[4, 3.5],
	];
	const bearing = (label: string, base: number) => {
		const g = part(label, base);
		kit.add(g, lathe(bearingProfile, 72), label);
	};

	spacer('Outer RCT spacer (brass)', 24.05, 1);
	bearing('Outer 608 bearing', 18.8);

	const tyre = part('Rubber tyre 67 x 50 mm', 0);
	spinning.push(tyre);
	kit.add(tyre, lathe(tyreProfile(false), 160), 'Rubber tyre');

	const hub = part('Hub shell', 0);
	spinning.push(hub);
	kit.add(
		hub,
		lathe(
			[
				[11, -22.3],
				[16, -22.3],
				[16, 22.3],
				[11, 22.3],
			],
			96,
		),
		'Hub shell',
	);
	const pocket = disk(1.35, 0.2, 24);
	for (let i = 0; i < 6; i++) {
		const a = (i / 6) * Math.PI * 2 + 0.3;
		kit.add(
			hub,
			pocket,
			'Hub pocket',
			Math.cos(a) * 13.6,
			Math.sin(a) * 13.6,
			22.4,
		);
		kit.add(
			hub,
			pocket,
			'Hub pocket',
			Math.cos(a) * 13.6,
			Math.sin(a) * 13.6,
			-22.4,
		);
	}

	let pawls: Pawl[] = [];
	if (ratchet) {
		const ring = part('Ratchet ring, 18 teeth', 0);
		spinning.push(ring);
		kit.add(ring, toothRing(8), 'Saw-tooth ratchet ring');
		const carrier = part('Pawl carrier', 0);
		const body = new Shape();
		body.absarc(0, 0, 5.4, 0, Math.PI * 2, false);
		const bore = new Path();
		bore.absarc(0, 0, 4, 0, Math.PI * 2, true);
		body.holes.push(bore);
		kit.add(carrier, extrude(body, 8, 48), 'Pawl carrier');
		pawls = buildPawls(kit, carrier, 7.2, 0);
		for (const pawl of pawls) posePawl(pawl, 0);
	}

	bearing('Inner 608 bearing', -18.8);
	spacer('Inner RCT spacer (brass)', -24.05, -1);
	return {root, parts, spinning, pawls};
};

// ---------------------------------------------------------------------------
// Binding (NNN-style classic binding)

const buildBinding = (kit: Kit, parent: Object3D) => {
	const binding = group(parent, 'Classic binding');
	const deck = SPEC.frameTop;
	kit.add(binding, plate(-205, 85, 17, 6, 3.5), 'Base plate', 0, deck, 0);
	const ridge = new BoxGeometry(220, 3.5, 3.2);
	kit.add(binding, ridge, 'Guide ridge', -80, deck + 5.25, 5.5);
	kit.add(binding, ridge, 'Guide ridge', -80, deck + 5.25, -5.5);
	kit.add(binding, new BoxGeometry(20, 11, 22), 'Flexor', 42, deck + 9, 0);
	const toeBar = disk(2.2, 30, 24);
	kit.add(binding, toeBar, 'Toe bar seat', 55.5, deck + 6, 0);

	const housing = new Shape();
	housing.moveTo(56, deck + 3.5);
	housing.lineTo(56, deck + 17);
	housing.quadraticCurveTo(56, deck + 20.5, 60, deck + 20.5);
	housing.lineTo(90, deck + 20.5);
	housing.bezierCurveTo(100, deck + 20.5, 108, deck + 15, 112, deck + 6);
	housing.lineTo(112, deck + 3.5);
	housing.closePath();
	kit.add(binding, extrude(housing, 35.6, 16, 1.2), 'Front housing');

	const lever = new Shape();
	lever.moveTo(62, deck + 21.7);
	lever.lineTo(62, deck + 23.6);
	lever.quadraticCurveTo(62, deck + 24.6, 63.2, deck + 24.6);
	lever.lineTo(95, deck + 24.6);
	lever.quadraticCurveTo(101, deck + 24.6, 103.5, deck + 21.2);
	lever.closePath();
	kit.add(binding, extrude(lever, 24, 12), 'Latch lever');

	kit.add(
		binding,
		new BoxGeometry(45, 2, 32),
		'Heel plate',
		-182.5,
		deck + 4.5,
		0,
	);
	const rib = new BoxGeometry(1.6, 1, 28);
	for (let i = 0; i < 5; i++) {
		kit.add(binding, rib, 'Heel plate rib', -199 + i * 8, deck + 6, 0);
	}
	return binding;
};

// ---------------------------------------------------------------------------

export type Ski = {
	readonly root: Group;
	readonly rearWheel: Wheel;
	readonly rearDrop: Group;
	readonly rearBolts: Group[];
};

export const buildSki = (kit: Kit, name: string): Ski => {
	const root = new Group();
	root.name = name;
	buildFrame(kit, root);
	buildBinding(kit, root);

	const rear = buildFork(kit, root, 'Rear fork');
	rear.fork.position.set(-SPEC.axleX, SPEC.axleY, 0);
	const front = buildFork(kit, root, 'Front fork');
	front.fork.position.set(SPEC.axleX, SPEC.axleY, 0);
	front.fork.scale.x = -1;

	const rearDrop = group(
		root,
		'Rear wheel slot travel',
		-SPEC.axleX,
		SPEC.axleY,
		0,
	);
	const rearWheel = buildWheel(kit, rearDrop, 'Rear wheel with ratchet', true);
	const frontMount = group(
		root,
		'Front wheel mount',
		SPEC.axleX,
		SPEC.axleY,
		0,
	);
	buildWheel(kit, frontMount, 'Front wheel', false);
	return {root, rearWheel, rearDrop, rearBolts: rear.bolts};
};

/** Spread the wheel parts along the axle by `e` and roll the tyre by `spin`. */
export const explodeWheel = (wheel: Wheel, e: number, spin: number) => {
	for (const p of wheel.parts) {
		p.group.position.z = p.base + p.spread * e;
	}
	for (const g of wheel.spinning) {
		g.rotation.z = spin;
	}
};

// ---------------------------------------------------------------------------
// Half-section of the rear wheel through its mid-plane, for the ratchet demo.

export type WheelSection = {
	readonly root: Group;
	readonly spinning: Group[];
	readonly pawls: Pawl[];
};

export const buildWheelSection = (kit: Kit): WheelSection => {
	const root = new Group();
	root.name = 'Rear wheel, half section';
	const spinning: Group[] = [];

	const tyre = group(root, 'Tyre section');
	kit.add(tyre, lathe(tyreProfile(true), 160), 'Tyre section');
	const hub = group(root, 'Hub section');
	kit.add(
		hub,
		lathe(
			[
				[11, -22.3],
				[16, -22.3],
				[16, 0],
				[11, 0],
			],
			96,
		),
		'Hub section',
	);
	const bore = disk(1.35, 0.2, 24);
	for (let i = 0; i < 6; i++) {
		const a = (i / 6) * Math.PI * 2 + 0.3;
		kit.add(hub, bore, 'Hub bore', Math.cos(a) * 13.6, Math.sin(a) * 13.6, 0.1);
	}
	const ring = group(root, 'Ratchet ring section');
	const ringGeometry = toothRing(4);
	ringGeometry.translate(0, 0, -2);
	kit.add(ring, ringGeometry, 'Saw-tooth ratchet ring');
	spinning.push(tyre, hub, ring);

	const carrier = group(root, 'Pawl carrier section');
	const body = new Shape();
	body.absarc(0, 0, 5.4, 0, Math.PI * 2, false);
	const hole = new Path();
	hole.absarc(0, 0, 4, 0, Math.PI * 2, true);
	body.holes.push(hole);
	const carrierGeometry = extrude(body, 4, 48);
	carrierGeometry.translate(0, 0, -2);
	kit.add(carrier, carrierGeometry, 'Pawl carrier');
	const pawls = buildPawls(kit, carrier, 3.6, -1.5);
	kit.add(
		carrier,
		lathe(
			[
				[2.6, -25.8],
				[4, -25.8],
				[4, 0],
				[2.6, 0],
			],
			48,
		),
		'Axle sleeve section',
	);
	return {root, spinning, pawls};
};

export const setRatchet = (section: WheelSection, alpha: number) => {
	for (const g of section.spinning) g.rotation.z = alpha;
	for (const pawl of section.pawls) posePawl(pawl, alpha);
};
