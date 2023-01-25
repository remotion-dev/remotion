const DEFAULT_ENFORCE_AUDIO_TRACK = true;

let enforceAudioTrackState = DEFAULT_ENFORCE_AUDIO_TRACK;

export const setEnforceAudioTrack = (enforceAudioTrack: boolean) => {
	enforceAudioTrackState = enforceAudioTrack;
};

export const getEnforceAudioTrack = () => {
	return enforceAudioTrackState;
};
