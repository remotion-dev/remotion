import {Log} from './log';
import {getPackageManager} from './preview-server/get-package-manager';
import {getRemotionVersion} from './preview-server/update-available';

export const lambdaCommand = async (remotionRoot: string, args: string[]) => {
	try {
		const path = require.resolve('@remotion/lambda', {
			paths: [remotionRoot],
		});
		const {LambdaInternals} = require(path);

		await LambdaInternals.executeCommand(args);
		process.exit(0);
	} catch (err) {
		const manager = getPackageManager(remotionRoot, undefined);
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error(err);
		Log.error('Remotion Lambda is not installed.');
		Log.info('');
		Log.info('You can install it using:');
		Log.info(`${installCommand} i @remotion/lambda@${getRemotionVersion()}`);
		process.exit(1);
	}
};
