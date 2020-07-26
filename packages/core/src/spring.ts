// Adapted from https://github.com/Popmotion/popmotion/blob/master/packages/popmotion/src/animations/spring/index.ts

export type SpringParams = {
	from: number;
	to: number;
	stiffness: number;
	damping: number;
	mass: number;
	restSpeedThreshold: number;
	restDisplacementThreshold: number;
	frame: number;
	fps: number;
	velocity?: number;
};

const speedPerSecond = (velocity: number, frameDuration: number): number =>
	frameDuration ? velocity * (1000 / frameDuration) : 0;

export const spring = (params: SpringParams): number => {
	let {velocity = 0.0} = params;
	const initialVelocity = velocity ? -(velocity / 1000) : 0.0;

	const {
		from,
		to,
		damping,
		stiffness,
		mass,
		frame,
		restSpeedThreshold,
		restDisplacementThreshold,
		fps,
	} = params;
	if (frame === 0) {
		return from;
	}
	let position = from;
	const timeDelta = 1000 / fps;
	const time = frame * timeDelta;

	const delta = to - from;
	const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
	const angularFreq = Math.sqrt(stiffness / mass) / 1000;

	const prevPosition = spring({...params, frame: frame - 1});

	// Underdamped
	if (dampingRatio < 1) {
		const envelope = Math.exp(-dampingRatio * angularFreq * time);
		const expoDecay = (angularFreq * Math.sqrt(stiffness / mass)) / 1000;

		position =
			to -
			envelope *
				(((initialVelocity + dampingRatio * angularFreq * delta) / expoDecay) *
					Math.sin(expoDecay * time) +
					delta * Math.cos(expoDecay * time));
	} else {
		const envelope = Math.exp(-angularFreq * time);
		position =
			to - envelope * (delta + (initialVelocity + angularFreq * delta) * time);
	}
	velocity = speedPerSecond(position - prevPosition, timeDelta);
	const isBelowVelocityThreshold = Math.abs(velocity) <= restSpeedThreshold;
	const isBelowDisplacementThreshold =
		Math.abs(to - position) <= restDisplacementThreshold;
	if (isBelowVelocityThreshold && isBelowDisplacementThreshold) {
		return to;
	}
	return position;
};
