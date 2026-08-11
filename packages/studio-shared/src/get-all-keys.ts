import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';

export const getAllSchemaKeys = (schema: InteractivitySchema): string[] => {
	return Object.keys(Internals.getFlatSchemaWithAllKeys(schema));
};

export const getAssetSchemaKeys = (schema: InteractivitySchema): string[] => {
	return Object.entries(Internals.getFlatSchemaWithAllKeys(schema))
		.filter(([, field]) => field?.type === 'asset')
		.map(([key]) => key);
};
