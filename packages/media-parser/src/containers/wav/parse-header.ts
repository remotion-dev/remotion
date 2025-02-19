import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavHeader} from './types';

export const parseHeader = ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const fileSize = state.iterator.getUint32Le();
	const fileType = state.iterator.getByteString(4, false);
	if (fileType !== 'WAVE') {
		throw new Error(`Expected WAVE, got ${fileType}`);
	}

	const header: WavHeader = {
		type: 'wav-header',
		fileSize,
	};

	state.getWavStructure().boxes.push(header);

	return Promise.resolve(null);
};
