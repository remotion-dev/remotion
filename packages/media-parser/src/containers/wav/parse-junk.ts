import {Log} from '../../log';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';

export const parseJunk = ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const ckSize = iterator.getUint32Le(); // chunkSize

	Log.trace(state.logLevel, `Skipping JUNK chunk of size ${ckSize}`);

	iterator.discard(ckSize);

	return Promise.resolve(null);
};
