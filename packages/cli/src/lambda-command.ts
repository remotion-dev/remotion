import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {parseCommandLine, parsedCli} from './parse-command-line';

export const lambdaCommand = async () => {
	try {
		const path = require.resolve('@remotion/lambda', {
			paths: [process.cwd()],
		});
		const {LambdaInternals} = require(path);
		parseCommandLine();
		const appliedName = loadConfig();
		if (appliedName) {
			Log.verbose(`Applied configuration from ${appliedName}.`);
		} else {
			Log.verbose('No config file loaded.');
		}

		await LambdaInternals.executeCommand(parsedCli._.slice(1));
		process.exit(0);
	} catch (err) {
		Log.error(err);
		Log.error('Remotion Lambda is not installed.');
		Log.info('');
		Log.info('You can install it using:');
		Log.info('npm i @remotion/lambda');
		process.exit(1);
	}
};
