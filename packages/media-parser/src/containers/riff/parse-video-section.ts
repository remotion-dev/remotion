import {getTracks} from '../../get-tracks';
import type {ParserState} from '../../state/parser-state';
import {TO_BE_OVERRIDDEN_LATER} from './get-tracks-from-avi';
import {parseMovi} from './parse-movi';

export const parseVideoSection = (state: ParserState) => {
	const videoSection = state.videoSection.getVideoSection();

	const movi = parseMovi({
		maxOffset: videoSection.start + videoSection.size,
		state,
	});
	const tracks = getTracks(state);
	if (!tracks.videoTracks.some((t) => t.codec === TO_BE_OVERRIDDEN_LATER)) {
		state.callbacks.tracks.setIsDone();
	}

	return movi;
};
