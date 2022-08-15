import type {BundleState} from 'remotion';

let bundleMode: BundleState = {
	type: 'index',
};

export const setBundleMode = (state: BundleState) => {
	bundleMode = state;
};

export const getBundleMode = () => {
	return bundleMode;
};
