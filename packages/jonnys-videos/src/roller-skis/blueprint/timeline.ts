// Shared by the composition and scripts/build-blueprint-audio.mjs, which
// imports this file directly with Node's type stripping: keep it free of
// imports and non-erasable TypeScript syntax.

export const FPS = 30;
export const DURATION = 17.5;

// The soundtrack is 113.2 BPM with its drop placed at 8.5 s.
export const DROP = 8.5;
export const BEAT = 0.5297;
export const beat = (n: number) => DROP + n * BEAT;

export const T = {
	coldOpenEnd: DROP,
	shotB: DROP,
	shotBLanded: DROP + 0.8,
	card1: DROP + 0.8,
	shotBOut: beat(6),
	shotC: beat(7),
	card2: beat(7) + 0.32,
	ratchetLock: beat(11),
	shotD: beat(12),
	shotE: beat(13),
	card3: beat(14),
	end: DURATION,
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
	const v = clamp01(x);
	return v * v * (3 - 2 * v);
};
export const smoother = (x: number) => {
	const v = clamp01(x);
	return v * v * v * (v * (v * 6 - 15) + 10);
};
// Snappy ease-out with a slight overshoot, used for every whip landing.
export const whipOut = (x: number) => {
	const v = clamp01(x);
	return 1 + 2.35 * Math.pow(v - 1, 3) + 1.35 * Math.pow(v - 1, 2);
};

// ---------------------------------------------------------------------------
// Ratchet kinematics. The hub ring has internal saw teeth; three pawls on the
// axle carrier ride the ramps when the wheel rolls forward and catch a steep
// face when it tries to roll back. Angles are counter-clockwise positive as
// seen from the outer side of the ski, where forward roll is clockwise.

export const RATCHET_TEETH = 18;
export const TOOTH_PITCH = (Math.PI * 2) / RATCHET_TEETH;
export const PAWL_ANGLES = [
	Math.PI * 0.5,
	Math.PI * (0.5 + 2 / 3),
	Math.PI * (0.5 + 4 / 3),
];

const SPIN_START = 0.22;
const SPIN_FULL = 0.55;
const SPIN_EASE_OUT = 1.42;
const SPIN_STOP = 1.78;
const FORWARD_SPEED = -Math.PI * 2 * 0.95;
const LOCK_LOCAL = T.ratchetLock - T.shotC;
const BACK_PHASE = 0.62;
const RECOIL = 0.022;
const RECOIL_TIME = 0.16;

// ∫ smooth((s - a) / (b - a)) ds over [a, x]
const rampIntegral = (a: number, b: number, x: number) => {
	const w = b - a;
	const v = clamp01((x - a) / w);
	return w * (v * v * v - (v * v * v * v) / 2);
};

// Closed-form integral of the forward speed profile: ease in, hold, ease out.
const integrateSpin = (u: number) => {
	let angle = 0;
	if (u > SPIN_START)
		angle += rampIntegral(SPIN_START, SPIN_FULL, Math.min(u, SPIN_FULL));
	if (u > SPIN_FULL) angle += Math.min(u, SPIN_EASE_OUT) - SPIN_FULL;
	if (u > SPIN_EASE_OUT) {
		const x = Math.min(u, SPIN_STOP);
		angle += x - SPIN_EASE_OUT - rampIntegral(SPIN_EASE_OUT, SPIN_STOP, x);
	}
	return angle * FORWARD_SPEED;
};

const FORWARD_TOTAL = integrateSpin(SPIN_STOP);
// Choose the resting orientation so the forward spin ends with the pawls
// BACK_PHASE of a tooth past a steep face: the roll-back then travels that far
// before it locks, landing exactly on the beat.
const ALPHA_0 = (() => {
	const pawlMaterial = PAWL_ANGLES[0] - FORWARD_TOTAL;
	const target = BACK_PHASE * TOOTH_PITCH;
	return (
		pawlMaterial -
		target -
		Math.floor((pawlMaterial - target) / TOOTH_PITCH) * TOOTH_PITCH
	);
})();
const ALPHA_STOP = ALPHA_0 + FORWARD_TOTAL;
const ALPHA_LOCK = ALPHA_STOP + BACK_PHASE * TOOTH_PITCH;

/** Ring angle (radians) at `u` seconds into shot C. */
export const ratchetAngle = (u: number) => {
	if (u <= SPIN_STOP) return ALPHA_0 + integrateSpin(u);
	if (u <= LOCK_LOCAL) {
		const s = (u - SPIN_STOP) / (LOCK_LOCAL - SPIN_STOP);
		return ALPHA_STOP + (ALPHA_LOCK - ALPHA_STOP) * s * s;
	}
	const r = clamp01((u - LOCK_LOCAL) / RECOIL_TIME);
	return ALPHA_LOCK - RECOIL * Math.sin(Math.PI * r) * (1 - r) * (1 - r);
};

/** Tooth phase under a pawl: 0 right after a steep face, rising along the ramp. */
export const toothPhase = (alpha: number, pawlAngle: number) => {
	const m = (pawlAngle - alpha) / TOOTH_PITCH;
	return m - Math.floor(m);
};

/** Seconds into shot C at which the pawls snap over a tooth, plus the lock. */
export const ratchetEvents = () => {
	const ticks: number[] = [];
	const dt = 0.0005;
	let prev = toothPhase(ratchetAngle(0), PAWL_ANGLES[0]);
	for (let u = dt; u <= SPIN_STOP + dt; u += dt) {
		const phase = toothPhase(ratchetAngle(u), PAWL_ANGLES[0]);
		if (phase < prev - 0.5) ticks.push(u);
		prev = phase;
	}
	return {ticks, lock: LOCK_LOCAL};
};
