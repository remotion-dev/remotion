export type WaveformMaxima = readonly Float32Array[];

const maximaCache = new WeakMap<
	Float32Array,
	{maxima: WaveformMaxima; completedPeaks: number}
>();

export const registerWaveformMaxima = (
	peaks: Float32Array,
	maxima: WaveformMaxima,
) => {
	maximaCache.set(peaks, {maxima, completedPeaks: peaks.length});
};

export const getWaveformMaxima = (
	peaks: Float32Array,
	completedPeaks: number | null,
): WaveformMaxima => {
	let cached = maximaCache.get(peaks);
	if (!cached) {
		const maxima: Float32Array[] = [];
		let {length} = peaks;
		while (length > 1) {
			length = Math.ceil(length / 2);
			maxima.push(new Float32Array(length));
		}

		cached = {maxima, completedPeaks: 0};
		maximaCache.set(peaks, cached);
	}

	const completed = Math.min(
		peaks.length,
		Math.max(0, completedPeaks ?? peaks.length),
	);
	if (completed <= cached.completedPeaks) {
		return cached.maxima;
	}

	// Only update parents of newly decoded peaks. Include the last partial pair
	// so progress snapshots can query the same tree as the completed waveform.
	let start = cached.completedPeaks;
	let end = completed;
	let previous = peaks;
	for (const level of cached.maxima) {
		start = Math.floor(start / 2);
		end = Math.ceil(end / 2);
		for (let i = start; i < end; i++) {
			level[i] = Math.max(previous[i * 2] ?? 0, previous[i * 2 + 1] ?? 0);
		}

		previous = level;
	}

	cached.completedPeaks = completed;
	return cached.maxima;
};

export const getWaveformMaximum = ({
	peaks,
	maxima,
	from,
	to,
}: {
	readonly peaks: Float32Array;
	readonly maxima: WaveformMaxima;
	readonly from: number;
	readonly to: number;
}) => {
	if (to <= from) {
		return 0;
	}

	// Ignore floating-point noise at exact source-peak boundaries, including
	// fractional loop periods, so a column never picks up the neighboring peak.
	let start = Math.max(
		0,
		Math.min(
			peaks.length,
			Math.floor(
				from +
					(Number.isFinite(from)
						? Number.EPSILON * Math.max(1, Math.abs(from)) * 4
						: 0),
			),
		),
	);
	let end = Math.max(
		0,
		Math.min(
			peaks.length,
			Math.ceil(
				to -
					(Number.isFinite(to)
						? Number.EPSILON * Math.max(1, Math.abs(to)) * 4
						: 0),
			),
		),
	);
	let maximum = 0;
	let data = peaks;
	let level = 0;
	while (start < end) {
		if (start % 2 === 1) {
			maximum = Math.max(maximum, data[start]);
			start++;
		}

		if (end % 2 === 1) {
			end--;
			maximum = Math.max(maximum, data[end]);
		}

		start = Math.floor(start / 2);
		end = Math.floor(end / 2);
		data = maxima[level++];
	}

	return maximum;
};
