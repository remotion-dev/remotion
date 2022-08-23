import {Internals} from 'remotion';
import type {getFunctions as original} from '../get-functions';
import {getAllMockFunctions} from '../mock-functions';

export const getFunctions: typeof original = async ({
	region,
	compatibleOnly,
}) => {
	return getAllMockFunctions(region, compatibleOnly ? Internals.VERSION : null);
};
