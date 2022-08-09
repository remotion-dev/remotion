const DEFAULT_DROP_AUDIO_IF_SILENT_STATE = true;

let mutedState = DEFAULT_DROP_AUDIO_IF_SILENT_STATE;

export const setDropAudioIfSilent = (muted: boolean) => {
	mutedState = muted;
};

export const getDropAudioIfSilent = () => {
	return mutedState;
};
