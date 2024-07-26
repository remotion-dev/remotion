import type {LifecycleRule} from '@aws-sdk/client-s3';
import type {DeleteAfter} from '@remotion/serverless/client';
import {expiryDays} from '@remotion/serverless/client';
import {randomHash} from '../../shared/random-hash';
import {truthy} from '../../shared/truthy';

const getEnabledLifeCycleRule = ({
	key,
	value,
}: {
	key: string;
	value: number;
}): LifecycleRule => {
	return {
		Expiration: {
			Days: value,
		},
		Filter: {
			Prefix: `renders/${key}`,
		},
		ID: `delete-after-${key}`,
		Status: 'Enabled',
	};
};

export const getLifeCycleRules = (): LifecycleRule[] => {
	return Object.entries(expiryDays).map(([key, value]) =>
		getEnabledLifeCycleRule({key, value}),
	);
};

export const generateRandomHashWithLifeCycleRule = (
	deleteAfter: DeleteAfter | null,
) => {
	return [deleteAfter, randomHash({randomInTests: true})]
		.filter(truthy)
		.join('-');
};

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
