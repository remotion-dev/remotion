import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';

export const getAllSchemaKeys = (schema: SequenceSchema): string[] => {
	return Object.keys(Internals.getFlatSchemaWithAllKeys(schema));
};
