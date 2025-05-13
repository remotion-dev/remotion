const HERTZ_TO_MEL_MAPPING = {
	htk: (freq: number) => 2595.0 * Math.log10(1.0 + freq / 700.0),
	kaldi: (freq: number) => 1127.0 * Math.log(1.0 + freq / 700.0),
	slaney: (
		freq: number,
		min_log_hertz = 1000.0,
		min_log_mel = 15.0,
		logstep = 27.0 / Math.log(6.4),
	) =>
		freq >= min_log_hertz
			? min_log_mel + Math.log(freq / min_log_hertz) * logstep
			: (3.0 * freq) / 200.0,
} as const;

/**
 * Creates a triangular filter bank.
 *
 * Adapted from torchaudio and librosa.
 *
 * @param {Float64Array} fft_freqs Discrete frequencies of the FFT bins in Hz, of shape `(num_frequency_bins,)`.
 * @param {Float64Array} filter_freqs Center frequencies of the triangular filters to create, in Hz, of shape `(num_mel_filters,)`.
 * @returns {number[][]} of shape `(num_frequency_bins, num_mel_filters)`.
 */
function _create_triangular_filter_bank(
	fft_freqs: Float64Array,
	filter_freqs: Float64Array | number[],
) {
	const filter_diff = Float64Array.from(
		{length: filter_freqs.length - 1},
		(_, i) => filter_freqs[i + 1] - filter_freqs[i],
	);

	const slopes = Array.from(
		{
			length: fft_freqs.length,
		},
		() => new Array(filter_freqs.length),
	);

	for (let j = 0; j < fft_freqs.length; ++j) {
		const slope = slopes[j];
		for (let i = 0; i < filter_freqs.length; ++i) {
			slope[i] = filter_freqs[i] - fft_freqs[j];
		}
	}

	const numFreqs = filter_freqs.length - 2;
	const ret = Array.from({length: numFreqs}, () => new Array(fft_freqs.length));

	for (let j = 0; j < fft_freqs.length; ++j) {
		// 201
		const slope = slopes[j];
		for (let i = 0; i < numFreqs; ++i) {
			// 80
			const down = -slope[i] / filter_diff[i];
			const up = slope[i + 2] / filter_diff[i + 1];
			ret[i][j] = Math.max(0, Math.min(down, up));
		}
	}

	return ret;
}

const MEL_TO_HERTZ_MAPPING = {
	htk: (/** @type {number} */ mels: number) =>
		700.0 * (10.0 ** (mels / 2595.0) - 1.0),
	kaldi: (/** @type {number} */ mels: number) =>
		700.0 * (Math.exp(mels / 1127.0) - 1.0),
	slaney: (
		/** @type {number} */ mels: number,
		min_log_hertz = 1000.0,
		min_log_mel = 15.0,
		logstep = Math.log(6.4) / 27.0,
	) =>
		mels >= min_log_mel
			? min_log_hertz * Math.exp(logstep * (mels - min_log_mel))
			: (200.0 * mels) / 3.0,
};

function hertz_to_mel(
	freq: number | number[] | Float64Array,
	mel_scale: keyof typeof HERTZ_TO_MEL_MAPPING = 'htk',
) {
	const fn = HERTZ_TO_MEL_MAPPING[mel_scale];
	if (!fn) {
		throw new Error('mel_scale should be one of "htk", "slaney" or "kaldi".');
	}

	return typeof freq === 'number' ? fn(freq) : freq.map((x) => fn(x));
}

function linspace(start: number, end: number, num: number) {
	const step = (end - start) / (num - 1);
	return Float64Array.from({length: num}, (_, i) => start + step * i);
}

function mel_to_hertz(
	mels: number | number[] | Float64Array,
	mel_scale: keyof typeof MEL_TO_HERTZ_MAPPING = 'htk',
) {
	const fn = MEL_TO_HERTZ_MAPPING[mel_scale];
	if (!fn) {
		throw new Error('mel_scale should be one of "htk", "slaney" or "kaldi".');
	}

	return typeof mels === 'number' ? fn(mels) : mels.map((x) => fn(x));
}

export function mel_filter_bank(
	num_frequency_bins: number,
	num_mel_filters: number,
	min_frequency: number,
	max_frequency: number,
	sampling_rate: number,
	norm: 'slaney' | null = null,
	mel_scale: keyof typeof MEL_TO_HERTZ_MAPPING = 'htk',
	triangularize_in_mel_space = false,
) {
	if (norm !== null && norm !== 'slaney') {
		throw new Error('norm must be one of null or "slaney"');
	}

	if (num_frequency_bins < 2) {
		throw new Error(`Require num_frequency_bins: ${num_frequency_bins} >= 2`);
	}

	if (min_frequency > max_frequency) {
		throw new Error(
			`Require min_frequency: ${min_frequency} <= max_frequency: ${max_frequency}`,
		);
	}

	const mel_min = hertz_to_mel(min_frequency, mel_scale);
	const mel_max = hertz_to_mel(max_frequency, mel_scale);
	const mel_freqs = linspace(
		mel_min as number,
		mel_max as number,
		num_mel_filters + 2,
	);

	let filter_freqs = mel_to_hertz(mel_freqs, mel_scale);
	let fft_freqs; // frequencies of FFT bins in Hz

	if (triangularize_in_mel_space) {
		const fft_bin_width = sampling_rate / ((num_frequency_bins - 1) * 2);
		fft_freqs = hertz_to_mel(
			Float64Array.from(
				{length: num_frequency_bins},
				(_, i) => i * fft_bin_width,
			),
			mel_scale,
		);
		filter_freqs = mel_freqs;
	} else {
		fft_freqs = linspace(0, Math.floor(sampling_rate / 2), num_frequency_bins);
	}

	const mel_filters = _create_triangular_filter_bank(
		fft_freqs as Float64Array,
		filter_freqs as number[],
	);

	if (norm !== null && norm === 'slaney') {
		// Slaney-style mel is scaled to be approx constant energy per channel
		for (let i = 0; i < num_mel_filters; ++i) {
			const filter = mel_filters[i];
			const enorm =
				2.0 /
				((filter_freqs as number[])[i + 2] - (filter_freqs as number[])[i]);
			for (let j = 0; j < num_frequency_bins; ++j) {
				// Apply this enorm to all frequency bins
				filter[j] *= enorm;
			}
		}
	}

	// TODO warn if there is a zero row

	return mel_filters;
}
