type AnimationNode = {
	lastTimestamp: number;
	toValue: number;
	current: number;
	velocity: number;
};

export type SpringConfig = {
	damping: number;
	mass: number;
	stiffness: number;
	overshootClamping: boolean;
	restDisplacementThreshold: number;
	restSpeedThreshold: number;
};

export function advance(
	animation: AnimationNode,
	now: number,
	config: SpringConfig
): AnimationNode {
	const copiedAnimated = {...animation};
	const {toValue, lastTimestamp, current, velocity} = copiedAnimated;

	const deltaTime = Math.min(now - lastTimestamp, 64);
	copiedAnimated.lastTimestamp = now;

	const c = config.damping;
	const m = config.mass;
	const k = config.stiffness;

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

	const isOvershooting = (): boolean => {
		if (config.overshootClamping && config.stiffness !== 0) {
			return current < toValue
				? copiedAnimated.current > toValue
				: copiedAnimated.current < toValue;
		} else {
			return false;
		}
	};

	const isVelocity = Math.abs(velocity) < config.restSpeedThreshold;
	const isDisplacement =
		config.stiffness === 0 ||
		Math.abs(toValue - current) < config.restDisplacementThreshold;

	if (zeta < 1) {
		copiedAnimated.current = underDampedPosition;
		copiedAnimated.velocity = underDampedVelocity;
	} else {
		copiedAnimated.current = criticallyDampedPosition;
		copiedAnimated.velocity = criticallyDampedVelocity;
	}

	if (isOvershooting() || (isVelocity && isDisplacement)) {
		if (config.stiffness !== 0) {
			copiedAnimated.velocity = 0;
			copiedAnimated.current = toValue;
		}
	}
	return copiedAnimated;
}

export function spring2({
	from,
	to,
	frame,
	fps,
	config = {
		damping: 10,
		mass: 1,
		stiffness: 100,
		overshootClamping: false,
		restDisplacementThreshold: 0.001,
		restSpeedThreshold: 0.001,
	},
}: {
	from: number;
	to: number;
	frame: number;
	fps: number;
	config: SpringConfig;
}): number {
	let animation: AnimationNode = {
		lastTimestamp: 0,
		current: from,
		toValue: to,
		velocity: 0,
	};
	const frameClamped = Math.max(0, frame);
	const unevenRest = frameClamped % 1;
	for (let f = 0; f <= Math.floor(frameClamped); f++) {
		if (f === Math.floor(frameClamped)) {
			f += unevenRest;
		}
		const time = (f / fps) * 1000;
		animation = advance(animation, time, config);
	}
	return animation.current;
}
