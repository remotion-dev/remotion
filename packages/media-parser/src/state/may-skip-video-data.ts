import {needsToIterateOverSamples} from './need-samples-for-fields';
import type {ParserState} from './parser-state';

export const maySkipVideoData = ({state}: {state: ParserState}) => {
	const hasAllTracksAndNoCallbacks =
		state.callbacks.tracks.hasAllTracks() &&
		Object.values(state.callbacks.videoSampleCallbacks).length === 0 &&
		Object.values(state.callbacks.audioSampleCallbacks).length === 0;

	const hasNoTrackHandlers =
		!state.callbacks.hasAudioTrackHandlers &&
		!state.callbacks.hasVideoTrackHandlers;

	const noCallbacksNeeded = hasNoTrackHandlers || hasAllTracksAndNoCallbacks;

	return (
		noCallbacksNeeded &&
		!needsToIterateOverSamples({
			emittedFields: state.emittedFields,
			fields: state.fields,
		})
	);
};
