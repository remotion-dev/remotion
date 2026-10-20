import type {LifecycleRule} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from './provider-implementation';
import {expiryDays, type DeleteAfter} from './shared-constants';
import {truthy} from './truthy';
import type {CloudProvider} from './types';

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

export const generateRandomHashWithLifeCycleRule = <
	Provider extends CloudProvider,
>({
	deleteAfter,
	randomHashFn,
}: {
	deleteAfter: DeleteAfter | null;
	randomHashFn: ProviderSpecifics<Provider>['randomHash'];
}) => {
	return [deleteAfter, randomHashFn()].filter(truthy).join('-');
};
