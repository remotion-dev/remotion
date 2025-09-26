export const applyVolume = (array: Int16Array, volume: number) => {
	if (volume === 1) {
		return array;
	}

	for (let i = 0; i < array.length; i++) {
		const newValue = array[i] * volume;

		if (newValue < -32768) {
			array[i] = -32768;
		} else if (newValue > 32767) {
			array[i] = 32767;
		} else {
			array[i] = newValue;
		}
	}

	return array;
};
