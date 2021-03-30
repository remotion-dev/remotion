export const validateStartFromProps = (
	startAt: number | undefined,
	endAt: number | undefined
) => {
	if (typeof startAt !== 'undefined') {
		if (typeof startAt !== 'number') {
			throw new TypeError(
				`type of startAt prop must be a number, instead got type ${typeof startAt}.`
			);
		}
		if (isNaN(startAt) || startAt === Infinity) {
			throw new TypeError('startAt prop can not be NaN or Infinity.');
		}
		if (startAt < 0) {
			throw new TypeError(
				`startAt must be greater than equal to 0 instead got ${startAt}.`
			);
		}
	}
	if (typeof endAt !== 'undefined') {
		if (typeof endAt !== 'number') {
			throw new TypeError(
				`type of endAt prop must be a number, instead got type ${typeof endAt}.`
			);
		}
		if (isNaN(endAt)) {
			throw new TypeError('endAt prop can not be NaN.');
		}
		if (endAt <= 0) {
			throw new TypeError(
				`endAt must be a positive number, instead got ${endAt}.`
			);
		}
	}
	if ((endAt as number) < (startAt as number)) {
		throw new TypeError('endAt prop must be greater than startAt prop');
	}
};
