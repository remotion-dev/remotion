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

export const validateTrimProps = (
	trimLeft: number | undefined,
	trimRight: number | undefined,
) => {
	if (typeof trimLeft !== 'undefined') {
		if (typeof trimLeft !== 'number') {
			throw new TypeError(
				`type of trimLeft prop must be a number, instead got type ${typeof trimLeft}.`,
			);
		}

		if (isNaN(trimLeft) || trimLeft === Infinity) {
			throw new TypeError('trimLeft prop can not be NaN or Infinity.');
		}

		if (trimLeft < 0) {
			throw new TypeError(
				`trimLeft must be greater than equal to 0 instead got ${trimLeft}.`,
			);
		}
	}

	if (typeof trimRight !== 'undefined') {
		if (typeof trimRight !== 'number') {
			throw new TypeError(
				`type of trimRight prop must be a number, instead got type ${typeof trimRight}.`,
			);
		}

		if (isNaN(trimRight)) {
			throw new TypeError('trimRight prop can not be NaN.');
		}

		if (trimRight <= 0) {
			throw new TypeError(
				`trimRight must be a positive number, instead got ${trimRight}.`,
			);
		}
	}

	if ((trimRight as number) < (trimLeft as number)) {
		throw new TypeError('trimRight prop must be greater than trimLeft prop.');
	}
};

export const validateMediaTrimProps = (
	startFrom: number | undefined,
	endAt: number | undefined,
	trimLeft: number | undefined,
	trimRight: number | undefined,
) => {
	// Check for conflicting props
	if (typeof startFrom !== 'undefined' && typeof trimLeft !== 'undefined') {
		throw new TypeError(
			'Cannot use both startFrom and trimLeft props. Use trimLeft instead as startFrom is deprecated.',
		);
	}

	if (typeof endAt !== 'undefined' && typeof trimRight !== 'undefined') {
		throw new TypeError(
			'Cannot use both endAt and trimRight props. Use trimRight instead as endAt is deprecated.',
		);
	}

	// Validate using the appropriate validation function
	const hasNewProps = typeof trimLeft !== 'undefined' || typeof trimRight !== 'undefined';
	const hasOldProps = typeof startFrom !== 'undefined' || typeof endAt !== 'undefined';

	if (hasNewProps) {
		validateTrimProps(trimLeft, trimRight);
	} else if (hasOldProps) {
		validateStartFromProps(startFrom, endAt);
	}
};

export const resolveTrimProps = (
	startFrom: number | undefined,
	endAt: number | undefined,
	trimLeft: number | undefined,
	trimRight: number | undefined,
): {trimLeftValue: number; trimRightValue: number} => {
	// Use new props if available, otherwise fall back to old props
	const trimLeftValue = trimLeft ?? startFrom ?? 0;
	const trimRightValue = trimRight ?? endAt ?? Infinity;
	
	return {trimLeftValue, trimRightValue};
};
