export type WebRendererPageResponsiveness =
	| 'disabled'
	| 'low'
	| 'medium'
	| 'high'
	| number;

const PRESET_INTERVALS = {
	low: 100,
	medium: 33,
	high: 16,
} satisfies Record<
	Exclude<WebRendererPageResponsiveness, 'disabled' | number>,
	number
>;

export const resolvePageResponsivenessInterval = (
	pageResponsiveness: unknown,
): number | null => {
	if (pageResponsiveness === 'disabled') {
		return null;
	}

	if (
		pageResponsiveness === 'low' ||
		pageResponsiveness === 'medium' ||
		pageResponsiveness === 'high'
	) {
		return PRESET_INTERVALS[pageResponsiveness];
	}

	if (typeof pageResponsiveness === 'number') {
		if (Number.isNaN(pageResponsiveness)) {
			throw new Error('`pageResponsiveness` should not be NaN, but is NaN');
		}

		if (!Number.isFinite(pageResponsiveness)) {
			throw new Error(
				`"pageResponsiveness" must be finite, but is ${pageResponsiveness}`,
			);
		}

		if (pageResponsiveness <= 0) {
			throw new Error(
				`"pageResponsiveness" must be greater than 0, but is ${pageResponsiveness}`,
			);
		}

		return pageResponsiveness;
	}

	throw new Error(
		`"pageResponsiveness" must be one of "disabled", "low", "medium", "high", or a number, but got ${JSON.stringify(
			pageResponsiveness,
		)}`,
	);
};

export const createPageResponsivenessController = ({
	intervalInMilliseconds,
	now,
	wait,
}: {
	intervalInMilliseconds: number | null;
	now: () => number;
	wait: () => Promise<void>;
}) => {
	let lastYieldAt = now();

	return {
		waitIfNeeded: async () => {
			if (intervalInMilliseconds === null) {
				return;
			}

			if (now() - lastYieldAt < intervalInMilliseconds) {
				return;
			}

			await wait();
			lastYieldAt = now();
		},
	};
};
