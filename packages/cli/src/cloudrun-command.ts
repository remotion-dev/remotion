import type {LogLevel} from '@remotion/renderer';
import {getPackageManager, getRemotionVersion} from '@remotion/studio';
import {Log} from './log';

export const cloudrunCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	try {
		const path = require.resolve('@remotion/cloudrun', {
			paths: [remotionRoot],
		});
		const {CloudrunInternals} = require(path);

		await CloudrunInternals.executeCommand(args, remotionRoot);
		process.exit(0);
	} catch (err) {
		const manager = getPackageManager(remotionRoot, undefined);
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error(err);
		Log.error('Remotion Cloud Run is not installed.');
		Log.infoAdvanced({indent: false, logLevel}, '');
		Log.infoAdvanced({indent: false, logLevel}, 'You can install it using:');
		Log.infoAdvanced(
			{indent: false, logLevel},
			`${installCommand} @remotion/cloudrun@${getRemotionVersion()}`,
		);
		process.exit(1);
	}
};
