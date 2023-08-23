export const validateStartFromProps = (
	startFrom: number | undefined,
	endAt: number | undefined,
) => {
	if (typeof startFrom !== 'undefined') {
		if (typeof startFrom !== 'number') {
			throw new TypeError(
				`type of startFrom prop must be a number, instead got type ${typeof startFrom}.`,
			);
		}

		if (isNaN(startFrom) || startFrom === Infinity) {
			throw new TypeError('startFrom prop can not be NaN or Infinity.');
		}

		if (startFrom < 0) {
			throw new TypeError(
				`startFrom must be greater than equal to 0 instead got ${startFrom}.`,
			);
		}
	}

	if (typeof endAt !== 'undefined') {
		if (typeof endAt !== 'number') {
			throw new TypeError(
				`type of endAt prop must be a number, instead got type ${typeof endAt}.`,
			);
		}

		if (isNaN(endAt)) {
			throw new TypeError('endAt prop can not be NaN.');
		}

		if (endAt <= 0) {
			throw new TypeError(
				`endAt must be a positive number, instead got ${endAt}.`,
			);
		}
	}

	if ((endAt as number) < (startFrom as number)) {
		throw new TypeError('endAt prop must be greater than startFrom prop.');
	}
};
