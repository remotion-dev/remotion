export const STUDIO_HANDOFF_DURATION = 12;
export const studioHandoffModeTimes = {
	programmatically: 0,
	interactively: 4,
	agentically: 7.5,
} as const;
export type StudioHandoffMode = keyof typeof studioHandoffModeTimes;
export type StudioHandoffTitleState = {
	mode: StudioHandoffMode;
	opacity: number;
	offset: number;
};
export type StudioHandoffLayout = {
	responsivenessProgress: number;
	studioLeft: number;
	editorLeft: number;
	codexLeft: number;
};
export type StudioHandoffFrame = {
	layout: StudioHandoffLayout;
	title: StudioHandoffTitleState;
};

// The same cubic-bezier(0.42, 0, 0.58, 1) as the original window slides.
// Invert its x coordinate before evaluating y, without a Remotion dependency.
export const handoffEasing = (progress: number) => {
	if (progress <= 0) {
		return 0;
	}

	if (progress >= 1) {
		return 1;
	}

	let lower = 0;
	let upper = 1;
	let t = progress;
	for (let i = 0; i < 20; i++) {
		const x =
			3 * (1 - t) ** 2 * t * 0.42 + 3 * (1 - t) * t ** 2 * 0.58 + t ** 3;
		if (x < progress) {
			lower = t;
		} else {
			upper = t;
		}

		t = (lower + upper) / 2;
	}

	return 3 * (1 - t) * t ** 2 + t ** 3;
};

const transitions = [
	{midpoint: 3, from: 'programmatically', to: 'interactively', direction: 1},
	{midpoint: 6.5, from: 'interactively', to: 'agentically', direction: 1},
	{midpoint: 10, from: 'agentically', to: 'programmatically', direction: -1},
] as const;

export const getStudioHandoffFrame = (time: number): StudioHandoffFrame => {
	const seconds =
		((time % STUDIO_HANDOFF_DURATION) + STUDIO_HANDOFF_DURATION) %
		STUDIO_HANDOFF_DURATION;
	const expand = handoffEasing((seconds - 2) / 2);
	const agent = handoffEasing((seconds - 5.5) / 2);
	const reset = handoffEasing((seconds - 9) / 2);
	const title: StudioHandoffTitleState = {
		mode: 'programmatically',
		opacity: 1,
		offset: 0,
	};
	for (const transition of transitions) {
		const start = transition.midpoint - 0.2;
		const end = transition.midpoint + 0.2;
		if (seconds < start) break;
		if (seconds >= end) {
			title.mode = transition.to;
			continue;
		}

		const entering = seconds >= transition.midpoint;
		const progress = (seconds - start) / (end - start);
		const eased = handoffEasing(progress);
		title.mode = entering ? transition.to : transition.from;
		// Settle at zero opacity before swapping the word at the midpoint.
		title.opacity = entering
			? handoffEasing(progress * 2 - 1)
			: 1 - handoffEasing(progress * 2);
		title.offset = transition.direction * 60 * (eased - (entering ? 1 : 0));
		break;
	}

	return {
		layout: {
			responsivenessProgress: 1 - expand + agent,
			studioLeft: 6 + 673 * (agent - reset),
			editorLeft: 679 + 679 * (expand - reset),
			codexLeft: -667 + 673 * (agent - reset),
		},
		title,
	};
};

export const createStudioHandoffTransition = (
	from: StudioHandoffFrame,
	mode: StudioHandoffMode,
) => {
	const targetTime = studioHandoffModeTimes[mode];
	const to = getStudioHandoffFrame(targetTime);
	const distance = Math.max(
		Math.abs(
			from.layout.responsivenessProgress - to.layout.responsivenessProgress,
		),
		Math.abs(from.layout.studioLeft - to.layout.studioLeft) / 673,
		Math.abs(from.layout.editorLeft - to.layout.editorLeft) / 679,
		Math.abs(from.layout.codexLeft - to.layout.codexLeft) / 673,
	);
	return {from, to, targetTime, duration: Math.min(0.5, distance * 0.5)};
};

export const getStudioHandoffTransitionFrame = (
	transition: ReturnType<typeof createStudioHandoffTransition>,
	elapsed: number,
): StudioHandoffFrame => {
	const {from, to, duration} = transition;
	if (elapsed >= duration) return to;
	const progress = handoffEasing(elapsed / duration);
	const titleDuration = Math.min(0.4, duration);
	const titleTime = Math.max(
		0,
		Math.min(1, (elapsed - (duration - titleDuration) / 2) / titleDuration),
	);
	const titleProgress = handoffEasing(titleTime);
	const direction =
		studioHandoffModeTimes[to.title.mode] >=
		studioHandoffModeTimes[from.title.mode]
			? 1
			: -1;
	const entering = titleTime >= 0.5;
	const title =
		from.title.mode === to.title.mode
			? {
					mode: to.title.mode,
					opacity:
						from.title.opacity + (1 - from.title.opacity) * titleProgress,
					offset: from.title.offset * (1 - titleProgress),
				}
			: {
					mode: entering ? to.title.mode : from.title.mode,
					opacity: entering
						? handoffEasing(titleTime * 2 - 1)
						: from.title.opacity * (1 - handoffEasing(titleTime * 2)),
					offset: entering
						? direction * 60 * (titleProgress - 1)
						: from.title.offset + direction * 60 * titleProgress,
				};
	return {
		layout: {
			responsivenessProgress:
				from.layout.responsivenessProgress +
				(to.layout.responsivenessProgress -
					from.layout.responsivenessProgress) *
					progress,
			studioLeft:
				from.layout.studioLeft +
				(to.layout.studioLeft - from.layout.studioLeft) * progress,
			editorLeft:
				from.layout.editorLeft +
				(to.layout.editorLeft - from.layout.editorLeft) * progress,
			codexLeft:
				from.layout.codexLeft +
				(to.layout.codexLeft - from.layout.codexLeft) * progress,
		},
		title,
	};
};
