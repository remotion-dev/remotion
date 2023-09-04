import type {LifecycleRule} from '@aws-sdk/client-s3';

const expiryDays = {
	'1-day': 1,
	'3-days': 3,
	'7-days': 7,
	'30-days': 30,
} as const;

export type RenderExpiryDays = keyof typeof expiryDays;

export const renderEnumToStr = (v: RenderExpiryDays): string => {
	return v;
};

export const strToRenderEnum = ({value}: {value?: string}) => {
	return value ? (value as RenderExpiryDays) : null;
};

export const getEnabledLifeCycleRule = ({
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
			Prefix: `renders/${value}days/`,
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
