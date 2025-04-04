import type {WebmSeekingInfo} from '../../../seeking-info';
import type {TracksState} from '../../../state/has-tracks-section';

export const getSeekingInfoFromMatroska = (
	tracksState: TracksState,
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
	};
};
