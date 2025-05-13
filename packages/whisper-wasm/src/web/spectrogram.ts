import {matmul} from '@huggingface/transformers';
import {FFT} from './fft';
import {amplitude_to_db, power_to_db} from './power-to-db';
import {Tensor} from './tensor';

export function calculateReflectOffset(i: number, w: number) {
	return Math.abs(((i + w) % (2 * w)) - w);
}

function padReflect(
	array: Float32Array | Float64Array,
	left: number,
	right: number,
) {
	// @ts-expect-error
	const padded = new array.constructor(array.length + left + right);
	const w = array.length - 1;

	for (let i = 0; i < array.length; ++i) {
		padded[left + i] = array[i];
	}

	for (let i = 1; i <= left; ++i) {
		padded[left - i] = array[calculateReflectOffset(i, w)];
	}

	for (let i = 1; i <= right; ++i) {
		padded[w + left + i] = array[calculateReflectOffset(w - i, w)];
	}

	return padded;
}

export async function spectrogram(
	waveform: Float32Array | Float64Array,
	window: Float32Array | Float64Array,
	frame_length: number,
	hop_length: number,
	{
		fft_length = null,
		power = 1.0,
		center = true,
		pad_mode = 'reflect',
		onesided = true,
		preemphasis = null,
		mel_filters = null,
		mel_floor = 1e-10,
		log_mel = null,
		reference = 1.0,
		min_value = 1e-10,
		db_range = null,
		remove_dc_offset = null,

		// Custom parameters for efficiency reasons
		min_num_frames = null,
		max_num_frames = null,
		do_pad = true,
		transpose = false,
	}: {
		fft_length?: number | null;
		power?: number;
		center?: boolean;
		pad_mode?: string;
		onesided?: boolean;
		preemphasis?: number | null;
		mel_filters?: number[] | null;
		mel_floor?: number;
		log_mel?: string | null;
		reference?: number;
		min_value?: number;
		db_range?: number | null;
		remove_dc_offset?: boolean | null;
		min_num_frames?: number | null;
		max_num_frames?: number | null;
		do_pad?: boolean;
		transpose?: boolean;
	},
) {
	const window_length = window.length;
	if (fft_length === null) {
		fft_length = frame_length;
	}

	if (frame_length > fft_length) {
		throw Error(
			`frame_length (${frame_length}) may not be larger than fft_length (${fft_length})`,
		);
	}

	if (window_length !== frame_length) {
		throw new Error(
			`Length of the window (${window_length}) must equal frame_length (${frame_length})`,
		);
	}

	if (hop_length <= 0) {
		throw new Error('hop_length must be greater than zero');
	}

	if (power === null && mel_filters !== null) {
		throw new Error(
			'You have provided `mel_filters` but `power` is `None`. Mel spectrogram computation is not yet supported for complex-valued spectrogram. ' +
				'Specify `power` to fix this issue.',
		);
	}

	if (center) {
		if (pad_mode !== 'reflect') {
			throw new Error(`pad_mode="${pad_mode}" not implemented yet.`);
		}

		const half_window = Math.floor((fft_length - 1) / 2) + 1;
		waveform = padReflect(waveform, half_window, half_window);
	}

	// split waveform into frames of frame_length size
	let num_frames = Math.floor(
		1 + Math.floor((waveform.length - frame_length) / hop_length),
	);
	if (min_num_frames !== null && num_frames < min_num_frames) {
		num_frames = min_num_frames;
	}

	const num_frequency_bins = onesided
		? Math.floor(fft_length / 2) + 1
		: fft_length;

	let d1 = num_frames;
	let d1Max = num_frames;

	// If maximum number of frames is provided, we must either pad or truncate
	if (max_num_frames !== null) {
		if (max_num_frames > num_frames) {
			// input is too short, so we pad
			if (do_pad) {
				d1Max = max_num_frames;
			}
		} else {
			// input is too long, so we truncate
			d1Max = max_num_frames;
			d1 = max_num_frames;
		}
	}

	// Preallocate arrays to store output.
	const fft = new FFT(fft_length);
	const inputBuffer = new Float64Array(fft_length);
	const outputBuffer = new Float64Array(fft.outputBufferSize);
	const transposedMagnitudeData = new Float32Array(num_frequency_bins * d1Max);

	for (let i = 0; i < d1; ++i) {
		// Populate buffer with waveform data
		const offset = i * hop_length;
		const buffer_size = Math.min(waveform.length - offset, frame_length);
		if (buffer_size !== frame_length) {
			// The full buffer is not needed, so we need to reset it (avoid overflow from previous iterations)
			// NOTE: We don't need to reset the buffer if it's full since we overwrite the first
			// `frame_length` values and the rest (`fft_length - frame_length`) remains zero.
			inputBuffer.fill(0, 0, frame_length);
		}

		for (let j = 0; j < buffer_size; ++j) {
			inputBuffer[j] = waveform[offset + j];
		}

		if (remove_dc_offset) {
			let sum = 0;
			for (let j = 0; j < buffer_size; ++j) {
				sum += inputBuffer[j];
			}

			const mean = sum / buffer_size;
			for (let j = 0; j < buffer_size; ++j) {
				inputBuffer[j] -= mean;
			}
		}

		if (preemphasis !== null) {
			// Done in reverse to avoid copies and distructive modification
			for (let j = buffer_size - 1; j >= 1; --j) {
				inputBuffer[j] -= preemphasis * inputBuffer[j - 1];
			}

			inputBuffer[0] *= 1 - preemphasis;
		}

		// Apply window function
		for (let j = 0; j < window.length; ++j) {
			inputBuffer[j] *= window[j];
		}

		fft.realTransform(outputBuffer, inputBuffer);

		// compute magnitudes
		for (let j = 0; j < num_frequency_bins; ++j) {
			const j2 = j << 1;

			// NOTE: We transpose the data here to avoid doing it later
			transposedMagnitudeData[j * d1Max + i] =
				outputBuffer[j2] ** 2 + outputBuffer[j2 + 1] ** 2;
		}
	}

	if (power !== null && power !== 2) {
		// slight optimization to not sqrt
		const pow = 2 / power; // we use 2 since we already squared
		for (let i = 0; i < transposedMagnitudeData.length; ++i) {
			transposedMagnitudeData[i] **= pow;
		}
	}

	// TODO: What if `mel_filters` is null?
	const num_mel_filters = (mel_filters as number[]).length;

	// Perform matrix muliplication:
	// mel_spec = mel_filters @ magnitudes.T
	//  - mel_filters.shape=(80, 201)
	//  - magnitudes.shape=(3000, 201) => magnitudes.T.shape=(201, 3000)
	//  - mel_spec.shape=(80, 3000)
	let mel_spec = await matmul(
		// TODO: Make `mel_filters` a Tensor during initialization
		// @ts-expect-error
		new Tensor('float32', (mel_filters as number[]).flat(), [
			num_mel_filters,
			num_frequency_bins,
		]),
		new Tensor('float32', transposedMagnitudeData, [num_frequency_bins, d1Max]),
	);
	if (transpose) {
		mel_spec = mel_spec.transpose(1, 0);
	}

	const mel_spec_data = mel_spec.data as Float32Array;
	for (let i = 0; i < mel_spec_data.length; ++i) {
		mel_spec_data[i] = Math.max(mel_floor, mel_spec_data[i]);
	}

	if (power !== null && log_mel !== null) {
		const o = Math.min(mel_spec_data.length, d1 * num_mel_filters);
		// NOTE: operates in-place
		switch (log_mel) {
			case 'log':
				for (let i = 0; i < o; ++i) {
					mel_spec_data[i] = Math.log(mel_spec_data[i]);
				}

				break;
			case 'log10':
				for (let i = 0; i < o; ++i) {
					mel_spec_data[i] = Math.log10(mel_spec_data[i]);
				}

				break;
			case 'dB':
				if (power === 1.0) {
					amplitude_to_db(mel_spec_data, reference, min_value, db_range);
				} else if (power === 2.0) {
					power_to_db(mel_spec_data, reference, min_value, db_range);
				} else {
					throw new Error(
						`Cannot use log_mel option '${log_mel}' with power ${power}`,
					);
				}

				break;
			default:
				throw new Error(
					`log_mel must be one of null, 'log', 'log10' or 'dB'. Got '${log_mel}'`,
				);
		}
	}

	return mel_spec;
}
