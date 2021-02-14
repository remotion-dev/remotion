const defaultValue = 80;
let quality = defaultValue;

export const setQuality = (q: number | undefined) => {
	if (typeof q !== 'undefined' && typeof q !== 'number') {
		throw new Error(
			`Quality option must be a number or undefined. Got ${typeof q} (${JSON.stringify(
				q
			)})`
		);
	}
	if (q === 0 || q === undefined) {
		quality = defaultValue;
		return;
	}
	if (q > 100 || q < 0) {
		throw new Error('Quality option must be between 1 and 100.');
	}
	quality = q;
};

export const getQuality = () => quality;
