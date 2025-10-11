import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseId3} from './id3';
import {parseID3V1} from './id3-v1';
import {parseMpegHeader} from './parse-mpeg-header';
import {discardUntilSyncword} from './seek/wait-until-syncword';

export const parseMp3 = async (state: ParserState): Promise<ParseResult> => {
	const {iterator} = state;
	if (iterator.bytesRemaining() < 3) {
		return null;
	}

	// When coming from a seek, we need to discard until the syncword
	if (
		state.mediaSection.isCurrentByteInMediaSection(iterator) === 'in-section'
	) {
		discardUntilSyncword({iterator});
		await parseMpegHeader({
			state,
		});
		return null;
	}

	const {returnToCheckpoint} = iterator.startCheckpoint();
	const bytes = iterator.getSlice(3);
	returnToCheckpoint();

	// ID3 v1
	if (bytes[0] === 0x54 && bytes[1] === 0x41 && bytes[2] === 0x47) {
		parseID3V1(iterator);
		return null;
	}

	// ID3 v2 or v3
	if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
		parseId3({state});
		return null;
	}

	if (bytes[0] === 0xff) {
		await parseMpegHeader({
			state,
		});
		return null;
	}

	throw new Error('Unknown MP3 header ' + JSON.stringify(bytes));
};
