import {VERSION} from 'remotion/version';
import type {getFunctions as original} from '../get-functions';
import {getAllMockFunctions} from '../mock-functions';

export const getFunctions: typeof original = ({region, compatibleOnly}) => {
	return Promise.resolve(
		getAllMockFunctions(region, compatibleOnly ? VERSION : null),
	);
};
