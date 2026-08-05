export const FAST_REFRESH_START_EVENT = 'remotion-fast-refresh-start';
export const FAST_REFRESH_COMPLETE_EVENT = 'remotion-fast-refresh-complete';

export const notifyFastRefreshStart = () => {
	window.dispatchEvent(new Event(FAST_REFRESH_START_EVENT));
};

export const notifyFastRefreshComplete = () => {
	window.dispatchEvent(new Event(FAST_REFRESH_COMPLETE_EVENT));
};
