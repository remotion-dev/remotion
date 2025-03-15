import type {ParserState} from './state/parser-state';

export const makeProgressObject = (state: ParserState) => {
	return {
		bytes: state.iterator.counter.getOffset(),
		percentage: state.contentLength
			? state.iterator.counter.getOffset() / state.contentLength
			: null,
		totalBytes: state.contentLength,
	};
};
