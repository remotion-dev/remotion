import type {getCurrentArchitecture as original} from '../get-current-architecture';

export const getCurrentArchitecture: typeof original = () => {
	return 'arm64';
};
