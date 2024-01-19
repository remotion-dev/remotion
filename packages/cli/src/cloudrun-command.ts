import type {LogLevel} from '@remotion/renderer';
import {StudioInternals} from '@remotion/studio-server';
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
		const manager = StudioInternals.getPackageManager(remotionRoot, undefined);
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error(err);
		Log.error('Remotion Cloud Run is not installed.');
		Log.infoAdvanced({indent: false, logLevel}, '');
		Log.infoAdvanced({indent: false, logLevel}, 'You can install it using:');
		Log.infoAdvanced(
			{indent: false, logLevel},
			`${installCommand} @remotion/cloudrun@${StudioInternals.getRemotionVersion()}`,
		);
		process.exit(1);
	}
};
