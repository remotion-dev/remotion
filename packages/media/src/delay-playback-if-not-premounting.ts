export type DelayPlaybackIfNotPremounting = {
	unblock: () => void;
	[Symbol.dispose]: () => void;
};
