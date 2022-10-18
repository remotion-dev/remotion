import type {getCurrentRegionInFunction as original} from '../get-current-region';

export const getCurrentRegionInFunction: typeof original = () => {
	return 'eu-central-1';
};
