import {Internals} from 'remotion';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = () => {
	const filename = parsedCli._[3]
		? parsedCli._[3]
		: Internals.getOutputLocation();
	return filename;
};
