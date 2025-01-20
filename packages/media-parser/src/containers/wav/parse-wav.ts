import {Log} from '../../log';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseData} from './parse-data';
import {parseFmt} from './parse-fmt';
import {parseHeader} from './parse-header';
import {parseId3} from './parse-id3';
import {parseList} from './parse-list';
import {parseVideoSection} from './parse-video-section';

export const parseWav = (state: ParserState): Promise<ParseResult> => {
	const {iterator} = state;
	const insideVideoSection = state.videoSection.isInVideoSectionState(iterator);
	if (insideVideoSection === 'in-section') {
		return parseVideoSection({state});
	}

	const type = iterator.getByteString(4, false);
	Log.trace(state.logLevel, `Processing box type ${type}`);

	if (type === 'RIFF') {
		return parseHeader({state});
	}

	if (type === 'fmt') {
		return parseFmt({state});
	}

	if (type === 'data') {
		return parseData({state});
	}

	if (type === 'LIST') {
		return parseList({state});
	}

	if (type === 'id3') {
		return parseId3({state});
	}

	throw new Error(`Unknown WAV box type ${type}`);
};
