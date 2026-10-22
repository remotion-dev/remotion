export const pad = (value: number, length = 2) => {
	let padded = String(value);
	while (padded.length < length) {
		padded = `0${padded}`;
	}
	return padded;
};
