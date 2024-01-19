import type {LogLevel} from '@remotion/renderer';
import {StudioInternals} from '@remotion/studio-server';
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
		const manager = StudioInternals.getPackageManager(remotionRoot, undefined);
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error(err);
		Log.error('Remotion Lambda is not installed.');
		Log.info('');
		Log.info('You can install it using:');
		Log.info(
			`${installCommand} @remotion/lambda@${StudioInternals.getRemotionVersion()}`,
		);
		process.exit(1);
	}
};
