import type {LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {Log} from './log';

export const lambdaCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	try {
		const path = require.resolve('@remotion/lambda', {
			paths: [remotionRoot],
		});
		const {LambdaInternals} = require(path);

		await LambdaInternals.executeCommand(args, remotionRoot, logLevel);
		process.exit(0);
	} catch (err) {
		const manager = StudioServerInternals.getPackageManager(
			remotionRoot,
			undefined,
		);
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error({indent: false, logLevel}, err);
		Log.error({indent: false, logLevel}, 'Remotion Lambda is not installed.');
		Log.infoAdvanced({indent: false, logLevel}, '');
		Log.infoAdvanced({indent: false, logLevel}, 'You can install it using:');
		Log.infoAdvanced(
			{indent: false, logLevel},
			`${installCommand} @remotion/lambda@${StudioServerInternals.getRemotionVersion()}`,
		);
		process.exit(1);
	}
};
