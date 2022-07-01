export type VolumeProp = number | ((frame: number) => number);

export const evaluateVolume = ({
	frame,
	volume,
	mediaVolume = 1,
}: {
	frame: number;
	volume: VolumeProp | undefined;
	mediaVolume: number;
}): number => {
	if (typeof volume === 'number') {
		return Math.min(1, volume * mediaVolume);
	}

	if (typeof volume === 'undefined') {
		return Number(mediaVolume);
	}

	const evaluated = volume(frame) * mediaVolume;
	if (typeof evaluated !== 'number') {
		throw new TypeError(
			`You passed in a a function to the volume prop but it did not return a number but a value of type ${typeof evaluated} for frame ${frame}`
		);
	}

	if (Number.isNaN(evaluated)) {
		throw new TypeError(
			`You passed in a function to the volume prop but it returned NaN for frame ${frame}.`
		);
	}

	if (!Number.isFinite(evaluated)) {
		throw new TypeError(
			`You passed in a function to the volume prop but it returned a non-finite number for frame ${frame}.`
		);
	}

	return Math.max(0, Math.min(1, evaluated));
};
