import type {ParserState} from '../state/parser-state';
import {needsToIterateOverSamples} from './need-samples-for-fields';

export const maySkipVideoData = ({state}: {state: ParserState}) => {
	return (
		state.callbacks.tracks.hasAllTracks() &&
		Object.values(state.callbacks.videoSampleCallbacks).length === 0 &&
		Object.values(state.callbacks.audioSampleCallbacks).length === 0 &&
		!needsToIterateOverSamples({
			emittedFields: state.emittedFields,
			fields: state.fields,
		})
	);
};
