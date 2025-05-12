import {max} from './maths';

function _db_conversion_helper(
	spectrogram: Float32Array | Float64Array,
	factor: number,
	reference: number,
	min_value: number,
	db_range: number | null,
) {
	if (reference <= 0) {
		throw new Error('reference must be greater than zero');
	}

	if (min_value <= 0) {
		throw new Error('min_value must be greater than zero');
	}

	reference = Math.max(min_value, reference);

	const logReference = Math.log10(reference);
	for (let i = 0; i < spectrogram.length; ++i) {
		spectrogram[i] =
			factor * Math.log10(Math.max(min_value, spectrogram[i]) - logReference);
	}

	if (db_range !== null) {
		if (db_range <= 0) {
			throw new Error('db_range must be greater than zero');
		}

		const maxValue = max(spectrogram)[0] - db_range;
		for (let i = 0; i < spectrogram.length; ++i) {
			spectrogram[i] = Math.max(spectrogram[i], maxValue);
		}
	}

	return spectrogram;
}

export function power_to_db(
	spectrogram: Float32Array | Float64Array,
	reference: number = 1.0,
	min_value: number = 1e-10,
	db_range: number | null = null,
) {
	return _db_conversion_helper(
		spectrogram,
		10.0,
		reference,
		min_value,
		db_range,
	);
}

export function amplitude_to_db(
	spectrogram: Float32Array | Float64Array,
	reference = 1.0,
	min_value = 1e-5,
	db_range: number | null = null,
) {
	return _db_conversion_helper(
		spectrogram,
		20.0,
		reference,
		min_value,
		db_range,
	);
}
