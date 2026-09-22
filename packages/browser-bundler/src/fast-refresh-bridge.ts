export const browserBundleHmrBridgeName = 'remotion_browserBundlerHmr';
export const browserBundleHotUpdateName = 'remotion_browserBundlerHotUpdate';

export type BrowserBundleHotRuntime = {
	check: () => Promise<(string | number)[] | null>;
	apply: () => Promise<(string | number)[]>;
	getHash: () => string;
	status: () => string;
};
