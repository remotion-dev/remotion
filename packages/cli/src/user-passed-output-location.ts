import {Internals} from 'remotion';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = (
	defaultExtension: string,
	compositionName: string
) => {
	const filename = parsedCli._[3]
		? parsedCli._[3]
		: Internals.getOutputLocation();

	const defaultName = `${compositionName}.${defaultExtension}`;

	return filename ?? defaultName;
};
