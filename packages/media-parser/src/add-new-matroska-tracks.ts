import type {Track} from './get-tracks';
import type {ParserContext} from './parser-context';
import type {ParserState} from './parser-state';

export const addNewMatroskaTracks = async (
	potentialTracks: Track[],
	state: ParserState,
	options: ParserContext,
) => {
	for (const track of potentialTracks) {
		if (state.isEmitted(track.trackId)) {
			continue;
		}

		state.addEmittedCodecId(track.trackId);
		if (track.type === 'video' && options.onVideoTrack) {
			const callback = options.onVideoTrack(track);
			await state.registerVideoSampleCallback(track.trackId, callback ?? null);
		}

		if (track.type === 'audio' && options.onAudioTrack) {
			const callback = options.onAudioTrack(track);
			await state.registerAudioSampleCallback(track.trackId, callback ?? null);
		}
	}
};
