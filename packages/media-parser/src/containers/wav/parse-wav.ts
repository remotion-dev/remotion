import {Log} from '../../log';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseData} from './parse-data';
import {parseFact} from './parse-fact';
import {parseFmt} from './parse-fmt';
import {parseHeader} from './parse-header';
import {parseId3} from './parse-id3';
import {parseJunk} from './parse-junk';
import {parseList} from './parse-list';
import {parseMediaSection} from './parse-media-section';

export const parseWav = (state: ParserState): Promise<ParseResult> => {
	const {iterator} = state;
	const insideMediaSection =
		state.mediaSection.isCurrentByteInMediaSection(iterator);
	if (insideMediaSection === 'in-section') {
		return parseMediaSection({state});
	}

	const type = iterator.getByteString(4, false).toLowerCase();
	Log.trace(state.logLevel, `Processing box type ${type}`);

	if (type === 'riff') {
		return parseHeader({state});
	}

	if (type === 'fmt') {
		return parseFmt({state});
	}

	if (type === 'data') {
		return parseData({state});
	}

	if (type === 'list') {
		return parseList({state});
	}

	if (type === 'id3') {
		return parseId3({state});
	}

	if (type === 'junk' || type === 'fllr' || type === 'bext' || type === 'cue') {
		return parseJunk({state});
	}

	if (type === 'fact') {
		return parseFact({state});
	}

	if (type === '\u0000') {
		return Promise.resolve(null);
	}

	throw new Error(`Unknown WAV box type ${type}`);
};
