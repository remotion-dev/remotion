const MIN_RETENTION_PERIOD = 1;
const MAX_RETENTION_PERIOD = 10 * 365;

export const validateCloudWatchRetentionPeriod = (period: unknown) => {
	if (period === null || period === undefined) {
		return;
	}

	if (typeof period !== 'number') {
		throw new TypeError(
			`CloudWatch retention period should be a number, got: ${JSON.stringify(
				period,
			)}`,
		);
	}

	if (Number.isNaN(period)) {
		throw new TypeError(
			`CloudWatch retention period must be an integer, but is NaN`,
		);
	}

	if (!Number.isFinite(period)) {
		throw new TypeError(
			`CloudWatch retention period must be finite, but is ${period}`,
		);
	}

	if (period % 1 !== 0) {
		throw new TypeError(
			`CloudWatch retention period must be an integer, but is ${period}`,
		);
	}

	if (period < MIN_RETENTION_PERIOD) {
		throw new Error(
			`CloudWatch retention period must be at least ${MIN_RETENTION_PERIOD}, but is ${period}`,
		);
	}

	if (period > MAX_RETENTION_PERIOD) {
		throw new Error(
			`CloudWatch retention period must be at most ${MAX_RETENTION_PERIOD}, but is ${period}`,
		);
	}
};
