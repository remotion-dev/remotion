import type {LifecycleRule} from '@aws-sdk/client-s3';

export enum RenderExpiryDays {
	AFTER_1_DAYS = '1',
	AFTER_3_DAYS = '3',
	AFTER_7_DAYS = '7',
	AFTER_30_DAYS = '30',
}

export const renderEnumToStr = (v: RenderExpiryDays): string => {
	return v;
};

export const strToRenderEnum = ({value}: {value?: string}) => {
	return value ? (value as RenderExpiryDays) : null;
};

export const getLifeCycleRule = ({
	key,
	value,
	isEnabled = false,
}: {
	key: string;
	value: string;
	isEnabled: Boolean;
}): LifecycleRule => {
	return {
		Expiration: {
			Days: parseInt(value, 10),
		},
		Filter: {
			Prefix: `renders/${value}days/`,
		},
		ID: `DELETE_${key}`,
		Status: isEnabled ? 'Enabled' : 'Disabled',
	} as LifecycleRule;
};

export const getLifeCycleRules = (): LifecycleRule[] => {
	return Object.entries(RenderExpiryDays).map(([key, value]) =>
		getLifeCycleRule({key, value, isEnabled: true}),
	);
};
