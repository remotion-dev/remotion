import {getTracksFromMatroska} from '../containers/webm/get-ready-tracks';
import {getMainSegment} from '../containers/webm/traversal';
import {
	needsToIterateOverEverySample,
	needsToIterateOverSamples,
} from './need-samples-for-fields';
import type {ParserState} from './parser-state';

const getHasCallbacks = (state: ParserState) => {
	const hasNoTrackHandlers =
		!state.callbacks.hasAudioTrackHandlers &&
		!state.callbacks.hasVideoTrackHandlers;

	if (hasNoTrackHandlers) {
		return false;
	}

	const hasAllTracksAndNoCallbacks =
		!state.callbacks.tracks.hasAllTracks() ||
		Object.values(state.callbacks.videoSampleCallbacks).length > 0 ||
		Object.values(state.callbacks.audioSampleCallbacks).length > 0;

	return hasAllTracksAndNoCallbacks;
};

export const missesMatroskaTracks = (state: ParserState) => {
	const struct = state.structure.getStructureOrNull();
	if (struct === null) {
		return false;
	}

	if (struct.type !== 'matroska') {
		return false;
	}

	const mainSegment = getMainSegment(struct.boxes);

	if (mainSegment === null) {
		return false;
	}

	return (
		getTracksFromMatroska({
			structureState: state.structure,
			webmState: state.webm,
		}).missingInfo.length > 0
	);
};

export const maySkipVideoData = ({state}: {state: ParserState}) => {
	const hasCallbacks = getHasCallbacks(state);

	return (
		!hasCallbacks &&
		!needsToIterateOverSamples({
			emittedFields: state.emittedFields,
			fields: state.fields,
		}) &&
		!missesMatroskaTracks(state)
	);
};

export const maySkipOverSamplesInTheMiddle = ({
	state,
}: {
	state: ParserState;
}) => {
	const hasCallbacks = getHasCallbacks(state);

	return (
		!hasCallbacks &&
		!needsToIterateOverEverySample({
			emittedFields: state.emittedFields,
			fields: state.fields,
		})
	);
};
