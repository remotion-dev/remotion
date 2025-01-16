import type {BufferIterator} from '../../buffer-iterator';
import {getTracks} from '../../get-tracks';
import type {ParserState} from '../../state/parser-state';
import {TO_BE_OVERRIDDEN_LATER} from './get-tracks-from-avi';
import {parseMovi} from './parse-movi';

export const parseVideoSection = ({
	state,
	iterator,
}: {
	state: ParserState;
	iterator: BufferIterator;
}) => {
	const videoSection = state.videoSection.getVideoSection();

	const movi = parseMovi({
		iterator,
		maxOffset: videoSection.start + videoSection.size,
		state,
	});
	const tracks = getTracks(state.structure.getStructure(), state);
	if (!tracks.videoTracks.some((t) => t.codec === TO_BE_OVERRIDDEN_LATER)) {
		state.callbacks.tracks.setIsDone();
	}

	return movi;
};
