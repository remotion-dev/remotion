import {expiryDays} from './shared-constants';

export const validateDeleteAfter = (lifeCycleValue: unknown) => {
	if (lifeCycleValue === null) {
		return;
	}

	if (lifeCycleValue === undefined) {
		return;
	}

	if (typeof lifeCycleValue !== 'string') {
		throw new TypeError(
			`Expected life cycle value to be a string, got ${JSON.stringify(
				lifeCycleValue,
			)}`,
		);
	}

	if (!(lifeCycleValue in expiryDays)) {
		throw new TypeError(
			`Expected deleteAfter value to be one of ${Object.keys(expiryDays).join(
				', ',
			)}, got ${lifeCycleValue}`,
		);
	}
};
