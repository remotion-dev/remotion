import type {BufferIterator} from '../../buffer-iterator';
import {getTracks} from '../../get-tracks';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';
import {TO_BE_OVERRIDDEN_LATER} from './get-tracks-from-avi';

export const parseRiffBody = async ({
	iterator,
	structure,
	maxOffset,
	state,
	fields,
}: {
	iterator: BufferIterator;
	structure: RiffStructure;
	maxOffset: number;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const continueParsing = () => {
		return parseRiffBody({
			fields,
			iterator,
			maxOffset,
			state,
			structure,
		});
	};

	if (iterator.counter.getOffset() >= maxOffset) {
		return {
			status: 'incomplete',
			continueParsing,
			skipTo: null,
		};
	}

	const result = await expectRiffBox({
		iterator,
		state,
		fields,
	});
	if (result.type === 'complete' && result.box !== null) {
		structure.boxes.push(result.box);
	}

	if (result.type === 'complete' && result.skipTo !== null) {
		return {
			status: 'incomplete',
			skipTo: result.skipTo,
			continueParsing,
		};
	}

	if (result.type === 'incomplete' || result.box === null) {
		return {
			status: 'incomplete',
			continueParsing,
			skipTo: null,
		};
	}

	// When parsing an AVI
	if (result.box.type === 'list-box' && result.box.listType === 'hdrl') {
		const tracks = getTracks(structure, state);
		if (!tracks.videoTracks.some((t) => t.codec === TO_BE_OVERRIDDEN_LATER)) {
			state.callbacks.tracks.setIsDone();
		}
	}

	return {
		continueParsing,
		skipTo: null,
		status: 'incomplete',
	};
};
