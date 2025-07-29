import {Log} from './log';
import type {ParserState} from './state/parser-state';

export const printTimings = (state: ParserState) => {
	Log.verbose(
		state.logLevel,
		`Time iterating over file: ${state.timings.timeIterating}ms`,
	);
	Log.verbose(
		state.logLevel,
		`Time fetching data: ${state.timings.timeReadingData}ms`,
	);
	Log.verbose(state.logLevel, `Time seeking: ${state.timings.timeSeeking}ms`);
	Log.verbose(
		state.logLevel,
		`Time checking if done: ${state.timings.timeCheckingIfDone}ms`,
	);
	Log.verbose(
		state.logLevel,
		`Time freeing data: ${state.timings.timeFreeingData}ms`,
	);
	Log.verbose(
		state.logLevel,
		`Time in parse loop: ${state.timings.timeInParseLoop}ms`,
	);
};
