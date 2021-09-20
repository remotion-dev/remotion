import {getFunctions as original} from '../get-functions';
import {getAllMockFunctions} from '../mock-functions';

export const getFunctions: typeof original = async () => {
	return getAllMockFunctions();
};
