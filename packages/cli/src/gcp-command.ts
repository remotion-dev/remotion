import {Log} from './log';
import {getPackageManager} from './preview-server/get-package-manager';
import {getRemotionVersion} from './preview-server/update-available';

export const gcpCommand = async (remotionRoot: string, args: string[]) => {
	try {
		const path = require.resolve('@remotion/gcp', {
			paths: [remotionRoot],
		});
		const {GCPInternals} = require(path);

		await GCPInternals.executeCommand(args, remotionRoot);
		process.exit(0);
	} catch (err) {
		const manager = getPackageManager(remotionRoot, undefined);
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error(err);
		Log.error('Remotion GCP is not installed.');
		Log.info('');
		Log.info('You can install it using:');
		Log.info(`${installCommand} i @remotion/gcp@${getRemotionVersion()}`);
		process.exit(1);
	}
};
