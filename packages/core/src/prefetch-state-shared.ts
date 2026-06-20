export type PrefetchState = Record<string, string>;

let preloads: PrefetchState = {};
let updaters: ((state: PrefetchState) => void)[] = [];

export const getPreloads = () => preloads;

export const setPreloads = (
	updater: (state: PrefetchState) => PrefetchState,
) => {
	preloads = updater(preloads);
	updaters.forEach((update) => update(preloads));
};

export const subscribeToPreloads = (
	updater: (state: PrefetchState) => void,
) => {
	updaters.push(updater);

	return () => {
		updaters = updaters.filter((candidate) => candidate !== updater);
	};
};
