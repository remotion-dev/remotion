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
	trimBefore: number | undefined,
	trimAfter: number | undefined,
) => {
	if (typeof trimBefore !== 'undefined') {
		if (typeof trimBefore !== 'number') {
			throw new TypeError(
				`type of trimBefore prop must be a number, instead got type ${typeof trimBefore}.`,
			);
		}

		if (isNaN(trimBefore) || trimBefore === Infinity) {
			throw new TypeError('trimBefore prop can not be NaN or Infinity.');
		}

		if (trimBefore < 0) {
			throw new TypeError(
				`trimBefore must be greater than equal to 0 instead got ${trimBefore}.`,
			);
		}
	}

	if (typeof trimAfter !== 'undefined') {
		if (typeof trimAfter !== 'number') {
			throw new TypeError(
				`type of trimAfter prop must be a number, instead got type ${typeof trimAfter}.`,
			);
		}

		if (isNaN(trimAfter)) {
			throw new TypeError('trimAfter prop can not be NaN.');
		}

		if (trimAfter <= 0) {
			throw new TypeError(
				`trimAfter must be a positive number, instead got ${trimAfter}.`,
			);
		}
	}

	if ((trimAfter as number) < (trimBefore as number)) {
		throw new TypeError('trimAfter prop must be greater than trimBefore prop.');
	}
};

export const validateMediaTrimProps = ({
	startFrom,
	endAt,
	trimBefore,
	trimAfter,
}: {
	startFrom: number | undefined;
	endAt: number | undefined;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
}) => {
	// Check for conflicting props
	if (typeof startFrom !== 'undefined' && typeof trimBefore !== 'undefined') {
		throw new TypeError(
			'Cannot use both startFrom and trimBefore props. Use trimBefore instead as startFrom is deprecated.',
		);
	}

	if (typeof endAt !== 'undefined' && typeof trimAfter !== 'undefined') {
		throw new TypeError(
			'Cannot use both endAt and trimAfter props. Use trimAfter instead as endAt is deprecated.',
		);
	}

	// Validate using the appropriate validation function
	const hasNewProps =
		typeof trimBefore !== 'undefined' || typeof trimAfter !== 'undefined';
	const hasOldProps =
		typeof startFrom !== 'undefined' || typeof endAt !== 'undefined';

	if (hasNewProps) {
		validateTrimProps(trimBefore, trimAfter);
	} else if (hasOldProps) {
		validateStartFromProps(startFrom, endAt);
	}
};

export const resolveTrimProps = ({
	startFrom,
	endAt,
	trimBefore,
	trimAfter,
}: {
	startFrom: number | undefined;
	endAt: number | undefined;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
}): {
	trimBeforeValue: number | undefined;
	trimAfterValue: number | undefined;
} => {
	// Use new props if available, otherwise fall back to old props
	const trimBeforeValue = trimBefore ?? startFrom ?? undefined;
	const trimAfterValue = trimAfter ?? endAt ?? undefined;

	return {trimBeforeValue, trimAfterValue};
};
