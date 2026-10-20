import type {LifecycleRule} from '@aws-sdk/client-s3';
import type {RandomHash} from './aws-operations';
import {expiryDays, type DeleteAfter} from './shared-constants';
import {truthy} from './truthy';

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

export const generateRandomHashWithLifeCycleRule = ({
	deleteAfter,
	randomHashFn,
}: {
	deleteAfter: DeleteAfter | null;
	randomHashFn: RandomHash;
}) => {
	return [deleteAfter, randomHashFn()].filter(truthy).join('-');
};
