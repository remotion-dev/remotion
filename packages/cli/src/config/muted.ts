const DEFAULT_MUTED_STATE = false;

let mutedState = DEFAULT_MUTED_STATE;

export const setMuted = (muted: boolean) => {
	mutedState = muted;
};

export const getMuted = () => {
	return mutedState;
};
