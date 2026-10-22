import {
	Camera,
	Group,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	Vector3,
} from 'three';
import type {LineArt} from './line-art';
import {
	buildSki,
	buildWheelSection,
	explodeWheel,
	setRatchet,
	SPEC,
	type Ski,
	type WheelSection,
} from './model';
import {
	clamp01,
	FPS,
	ratchetAngle,
	smooth,
	smoother,
	T,
	whipOut,
} from './timeline';

export type Rig = {
	readonly main: Ski;
	readonly plan: Ski;
	readonly section: WheelSection;
	readonly perspective: PerspectiveCamera;
	readonly ortho: OrthographicCamera;
	readonly width: number;
	readonly height: number;
};

// ---------------------------------------------------------------------------
// Cold open: one continuous push from a wide oblique view of the whole ski
// into the rear wheel. The approach is what takes the wheel apart: the axle
// screws back out, the wheel drops out of its RCT slots, then its parts slide
// apart along the axle towards the viewpoint, which threads through them and
// exits into white.

const START_RADIUS = 1550;
const END_RADIUS = -8;
const START_AZIMUTH = -0.98;
const START_ELEVATION = 0.36;
const ORBIT_END = 4.15;
const DROP = 52;
const LOOK_OFFSET = new Vector3(-200, 175, 0);

const coldOpen = (t: number) => {
	const p = smooth(t / T.coldOpenEnd);
	const q = Math.pow(p, 1.15);
	const orbit = 1 - smoother(t / ORBIT_END);
	return {
		p,
		q,
		orbit,
		azimuth: START_AZIMUTH * orbit,
		elevation: START_ELEVATION * orbit,
		radius: START_RADIUS - (START_RADIUS - END_RADIUS) * p,
		drop: smooth((q - 0.05) / 0.22),
		unscrew: smooth(q / 0.16),
		spread: clamp01((q - 0.2) / 0.8),
	};
};

// When each rear-wheel part should pass the lens, in seconds. Parts may only
// overtake parts whose bore they fit through, so this order matters.
const CROSSINGS: Record<string, number> = {
	'Outer RCT spacer (brass)': 5.5,
	'Outer 608 bearing': 5.95,
	'Rubber tyre 67 x 50 mm': 6.35,
	'Hub shell': 6.75,
	'Ratchet ring, 18 teeth': 7.12,
	'Pawl carrier': 7.45,
	'Inner 608 bearing': 7.8,
	'Inner RCT spacer (brass)': 8.12,
};

const assignSpreads = (ski: Ski) => {
	for (const part of ski.rearWheel.parts) {
		const at = CROSSINGS[part.group.name];
		const s = coldOpen(at);
		part.spread = (s.radius - part.base) / s.spread;
	}
};

export const createRig = (
	kit: LineArt,
	scene: Scene,
	width: number,
	height: number,
): Rig => {
	const main = buildSki(kit, 'Swix Roadline Classic');
	const plan = buildSki(kit, 'Swix Roadline Classic (plan)');
	const section = buildWheelSection(kit);
	assignSpreads(main);
	scene.add(main.root, plan.root, section.root);
	const perspective = new PerspectiveCamera(34, width / height, 0.2, 6000);
	const ortho = new OrthographicCamera(
		-width / 2,
		width / 2,
		height / 2,
		-height / 2,
		0.1,
		10000,
	);
	ortho.position.set(0, 0, 4000);
	ortho.lookAt(0, 0, 0);
	return {main, plan, section, perspective, ortho, width, height};
};

const resetSki = (ski: Ski) => {
	ski.root.visible = false;
	ski.root.position.set(0, 0, 0);
	ski.root.rotation.set(0, 0, 0, 'XYZ');
	ski.root.scale.setScalar(1);
	explodeWheel(ski.rearWheel, 0, 0);
	ski.rearDrop.position.y = SPEC.axleY;
	for (const [i, bolt] of ski.rearBolts.entries()) {
		bolt.position.z =
			(i === 0 ? 1 : -1) * (SPEC.spacerOuter + SPEC.cheekThickness);
		bolt.rotation.z = 0;
	}
};

// Places a model in pixel space for the orthographic camera: (x, y) is where
// the model origin lands on screen, `s` is pixels per millimetre.
const place = (
	rig: Rig,
	root: Group,
	x: number,
	y: number,
	s: number,
	rx = 0,
	ry = 0,
	rz = 0,
	order: 'XYZ' | 'ZXY' = 'XYZ',
) => {
	root.position.set(x - rig.width / 2, rig.height / 2 - y, 0);
	root.scale.setScalar(s);
	root.rotation.set(rx, ry, rz, order);
	root.visible = true;
};

const stageColdOpen = (rig: Rig, t: number): Camera => {
	const {main, perspective} = rig;
	const s = coldOpen(t);
	main.root.visible = true;

	const boltTravel = 4 * s.unscrew;
	const outer = SPEC.spacerOuter + SPEC.cheekThickness;
	main.rearBolts[0].position.z = outer + boltTravel;
	main.rearBolts[1].position.z = -outer - boltTravel;
	main.rearBolts[0].rotation.z = s.unscrew * Math.PI * 5;
	main.rearBolts[1].rotation.z = -s.unscrew * Math.PI * 5;
	main.rearDrop.position.y = SPEC.axleY - DROP * s.drop;
	explodeWheel(main.rearWheel, s.spread, -s.q * Math.PI * 2.5);

	const target = new Vector3(-SPEC.axleX, SPEC.axleY - DROP * s.drop, 0);
	const dir = new Vector3(
		Math.sin(s.azimuth) * Math.cos(s.elevation),
		Math.sin(s.elevation),
		Math.cos(s.azimuth) * Math.cos(s.elevation),
	);
	perspective.position.copy(target).addScaledVector(dir, s.radius);
	if (s.orbit > 1e-5) {
		perspective.lookAt(target.clone().addScaledVector(LOOK_OFFSET, s.orbit));
	} else {
		perspective.lookAt(perspective.position.clone().sub(dir));
	}
	return perspective;
};

// ---------------------------------------------------------------------------
// Shot B: side elevation and plan view whip in from opposite directions.

const stageElevations = (rig: Rig, t: number): Camera => {
	const entry = whipOut((t - T.shotB) / 0.8);
	const exit = Math.pow(clamp01((t - T.shotBOut) / 0.5), 3);
	const push = clamp01((t - T.shotBLanded) / (T.shotBOut - T.shotBLanded));
	place(
		rig,
		rig.main.root,
		948,
		690 - (1 - entry) * 900 - exit * 1100,
		2.12 * (1 + 0.06 * push),
	);
	place(
		rig,
		rig.plan.root,
		1330,
		929 + (1 - entry) * 1000 + exit * 1000,
		1.08 * (1 + 0.06 * push),
		Math.PI / 2,
	);
	return rig.ortho;
};

// ---------------------------------------------------------------------------
// Shot C: turning 3/4 view on top, the ratchet in half section below it.

const stageRatchet = (rig: Rig, t: number): Camera => {
	const u = t - T.shotC;
	const turn = smooth(u / (T.shotD - T.shotC));
	const push = clamp01(u / (T.shotD - T.shotC));
	place(
		rig,
		rig.main.root,
		1000,
		300 + 55 * push,
		1.66 * (1 + 0.1 * push),
		0.42,
		0.5 + 0.17 * turn,
		0,
		'XYZ',
	);
	place(rig, rig.section.root, 1556, 768, 6.6 * (1 + 0.1 * push));
	setRatchet(rig.section, ratchetAngle(u));
	return rig.ortho;
};

// ---------------------------------------------------------------------------
// Shot E: the ski sweeps in huge from the bottom-left and settles diagonally.

const stageHero = (rig: Rig, t: number): Camera => {
	const entry = whipOut((t - T.shotE) / 0.5);
	const push = clamp01((t - T.shotE - 0.45) / (T.end - T.shotE - 0.45));
	place(
		rig,
		rig.main.root,
		880 - (1 - entry) * 1750,
		600 + (1 - entry) * 1500,
		2.62 * (1 + 0.08 * push),
		0.34,
		-0.5 + 0.05 * push,
		0.4,
		'ZXY',
	);
	return rig.ortho;
};

export const stage = (rig: Rig, t: number): Camera | null => {
	resetSki(rig.main);
	resetSki(rig.plan);
	rig.section.root.visible = false;
	if (t < T.coldOpenEnd) return stageColdOpen(rig, t);
	if (t < T.shotC) return stageElevations(rig, t);
	if (t < T.shotD) return stageRatchet(rig, t);
	if (t < T.shotE) return null;
	return stageHero(rig, t);
};

export type Blur = {
	readonly samples: number;
	readonly shutter: number;
	readonly floor: number;
};

// Whips get a long, dense shutter; the fast end of the push-in and the
// spinning ratchet get a light 180-degree one. Samples never reach back past
// the start of the current move.
export const blurFor = (t: number): Blur => {
	const whip = 1.5 / FPS;
	if (t >= T.shotB && t < T.shotB + 0.62)
		return {samples: 24, shutter: whip, floor: T.shotB};
	if (t >= T.shotBOut && t < T.shotC)
		return {samples: 24, shutter: whip, floor: T.shotBOut};
	if (t >= T.shotE && t < T.shotE + 0.45)
		return {samples: 24, shutter: whip, floor: T.shotE};
	if (t >= 4.4 && t < T.coldOpenEnd)
		return {samples: 16, shutter: 0.5 / FPS, floor: 0};
	if (t >= T.shotC + 0.25 && t < T.ratchetLock + 0.05)
		return {samples: 8, shutter: 0.5 / FPS, floor: T.shotC};
	return {samples: 1, shutter: 0, floor: t};
};
