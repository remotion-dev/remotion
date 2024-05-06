type AnimationNode = {
	lastTimestamp: number;
	toValue: number;
	current: number;
	velocity: number;
	prevPosition?: number;
};

export type SpringConfig = {
	damping: number;
	mass: number;
	stiffness: number;
	overshootClamping: boolean;
};

const defaultSpringConfig: SpringConfig = {
	damping: 10,
	mass: 1,
	stiffness: 100,
	overshootClamping: false,
};

const advanceCache: {[key: string]: AnimationNode} = {};

function advance({
	animation,
	now,
	config,
}: {
	animation: AnimationNode;
	now: number;
	config: SpringConfig;
}): AnimationNode {
	const {toValue, lastTimestamp, current, velocity} = animation;

	const deltaTime = Math.min(now - lastTimestamp, 64);

	if (config.damping <= 0) {
		throw new Error(
			'Spring damping must be greater than 0, otherwise the spring() animation will never end, causing an infinite loop.',
		);
	}

	const c = config.damping;
	const m = config.mass;
	const k = config.stiffness;

	const cacheKey = [
		toValue,
		lastTimestamp,
		current,
		velocity,
		c,
		m,
		k,
		now,
	].join('-');
	if (advanceCache[cacheKey]) {
		return advanceCache[cacheKey];
	}

	const v0 = -velocity;
	const x0 = toValue - current;

	const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
	const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
	const omega1 = omega0 * Math.sqrt(1 - zeta ** 2); // exponential decay

	const t = deltaTime / 1000;

	const sin1 = Math.sin(omega1 * t);
	const cos1 = Math.cos(omega1 * t);

	// under damped
	const underDampedEnvelope = Math.exp(-zeta * omega0 * t);
	const underDampedFrag1 =
		underDampedEnvelope *
		(sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);

	const underDampedPosition = toValue - underDampedFrag1;
	// This looks crazy -- it's actually just the derivative of the oscillation function
	const underDampedVelocity =
		zeta * omega0 * underDampedFrag1 -
		underDampedEnvelope *
			(cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);

	// critically damped
	const criticallyDampedEnvelope = Math.exp(-omega0 * t);
	const criticallyDampedPosition =
		toValue - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);

	const criticallyDampedVelocity =
		criticallyDampedEnvelope *
		(v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);

	const animationNode: AnimationNode = {
		toValue,
		prevPosition: current,
		lastTimestamp: now,
		current: zeta < 1 ? underDampedPosition : criticallyDampedPosition,
		velocity: zeta < 1 ? underDampedVelocity : criticallyDampedVelocity,
	};
	advanceCache[cacheKey] = animationNode;
	return animationNode;
}

const calculationCache: {[key: string]: AnimationNode} = {};

export function springCalculation({
	frame,
	fps,
	config = {},
}: {
	frame: number;
	fps: number;
	config?: Partial<SpringConfig>;
}): AnimationNode {
	const from = 0;
	const to = 1;
	const cacheKey = [
		frame,
		fps,
		config.damping,
		config.mass,
		config.overshootClamping,
		config.stiffness,
	].join('-');
	if (calculationCache[cacheKey]) {
		return calculationCache[cacheKey];
	}

	let animation: AnimationNode = {
		lastTimestamp: 0,
		current: from,
		toValue: to,
		velocity: 0,
		prevPosition: 0,
	};
	const frameClamped = Math.max(0, frame);
	const unevenRest = frameClamped % 1;
	for (let f = 0; f <= Math.floor(frameClamped); f++) {
		if (f === Math.floor(frameClamped)) {
			f += unevenRest;
		}

		const time = (f / fps) * 1000;
		animation = advance({
			animation,
			now: time,
			config: {
				...defaultSpringConfig,
				...config,
			},
		});
	}

	calculationCache[cacheKey] = animation;
	return animation;
}
