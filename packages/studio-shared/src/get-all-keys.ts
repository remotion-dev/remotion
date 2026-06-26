import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';

export const getAllSchemaKeys = (schema: InteractivitySchema): string[] => {
	return Object.keys(Internals.getFlatSchemaWithAllKeys(schema));
};
