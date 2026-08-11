import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavFact} from './types';

export const parseFact = ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const size = iterator.getUint32Le();
	if (size !== 4) {
		throw new Error(`Expected size 4 for fact box, got ${size}`);
	}

	const numberOfSamplesPerChannel = iterator.getUint32Le();
	const factBox: WavFact = {
		type: 'wav-fact',
		numberOfSamplesPerChannel,
	};
	state.structure.getWavStructure().boxes.push(factBox);
	return Promise.resolve(null);
};
