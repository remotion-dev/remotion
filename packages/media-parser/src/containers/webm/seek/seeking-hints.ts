import type {WebmSeekingHints} from '../../../seeking-hints';
import type {TracksState} from '../../../state/has-tracks-section';
import type {KeyframesState} from '../../../state/keyframes';
import type {WebmState} from '../../../state/matroska/webm';
import type {ParserState} from '../../../state/parser-state';

export const getSeekingHintsFromMatroska = (
	tracksState: TracksState,
	keyframesState: KeyframesState,
	webmState: WebmState,
): WebmSeekingHints => {
	const tracks = tracksState.getTracks();
	const firstVideoTrack = tracks.find((track) => track.type === 'video');
	const keyframes = keyframesState.getKeyframes();
	const loadedCues = webmState.cues.getIfAlreadyLoaded();

	return {
		type: 'webm-seeking-hints',
		track: firstVideoTrack
			? {
					timescale: firstVideoTrack.originalTimescale,
					trackId: firstVideoTrack.trackId,
				}
			: null,
		keyframes,
		loadedCues,
		timestampMap: webmState.getTimeStampMapForSeekingHints(),
	};
};

export const setSeekingHintsForWebm = ({
	hints,
	state,
}: {
	hints: WebmSeekingHints;
	state: ParserState;
}) => {
	state.webm.cues.setFromSeekingHints(hints);
	state.keyframes.setFromSeekingHints(hints.keyframes);
	state.webm.setTimeStampMapForSeekingHints(hints.timestampMap);
};
