import {Log} from './log';
import {getPackageManager} from './preview-server/get-package-manager';
import {getRemotionVersion} from './preview-server/update-available';

export const cloudrunCommand = async (remotionRoot: string, args: string[]) => {
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
		Log.error('Remotion CloudRun is not installed.');
		Log.info('');
		Log.info('You can install it using:');
		Log.info(`${installCommand} @remotion/cloudrun@${getRemotionVersion()}`);
		process.exit(1);
	}
};
