import type {WebmSeekingInfo} from '../../../seeking-info';
import type {TracksState} from '../../../state/has-tracks-section';
import type {KeyframesState} from '../../../state/keyframes';
import type {WebmState} from '../../../state/matroska/webm';

export const getSeekingInfoFromMatroska = (
	tracksState: TracksState,
	keyframesState: KeyframesState,
	webmState: WebmState,
): WebmSeekingInfo => {
	const tracks = tracksState.getTracks();
	const firstVideoTrack = tracks.find((track) => track.type === 'video');
	return {
		type: 'webm-seeking-info',
		track: firstVideoTrack
			? {
					timescale: firstVideoTrack.timescale,
					trackId: firstVideoTrack.trackId,
				}
			: null,
		keyframes: keyframesState.getKeyframes(),
		loadedCues: webmState.cues.getIfAlreadyLoaded(),
	};
};
