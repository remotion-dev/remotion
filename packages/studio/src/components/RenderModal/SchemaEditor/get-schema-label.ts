import type {JSONPath} from './zod-types';

export const getSchemaLabel = (jsonPath: JSONPath): string => {
	const lastKey = jsonPath[jsonPath.length - 1];
	if (typeof lastKey === 'number') {
		const secondLastKey = jsonPath[jsonPath.length - 2];
		if (typeof secondLastKey === 'undefined') {
			return `[${lastKey}]:`;
		}

		return `${lastKey}:`;
	}

	return `${lastKey}:`;
};
