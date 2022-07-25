import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';

export const initializeRenderCli = async (
	remotionRoot: string,
	type: 'still' | 'sequence' | 'lambda' | 'preview'
) => {
	const appliedName = await loadConfig(remotionRoot);

	parseCommandLine(type);

	// Only now Log.verbose is available
	Log.verbose('Remotion root directory:', remotionRoot);
	if (remotionRoot !== process.cwd()) {
		Log.warn(
			`Warning: The root directory of your project is ${remotionRoot}, but you are executing this command from ${process.cwd()}. The recommendation is to execute commands from the root directory.`
		);
	}

	if (appliedName) {
		Log.verbose(`Applied configuration from ${appliedName}.`);
	} else {
		Log.verbose('No config file loaded.');
	}
};
