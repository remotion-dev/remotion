import {CliInternals} from '@remotion/cli';
import {
	logPermissionOutput,
	simulatePermissions,
} from '../../api/iam-validation/simulate';
import {Log} from '../log';

export const PERMISSIONS_COMMAND = 'permissions';

export const permissionsCommand = async () => {
	try {
		Log.info(
			CliInternals.chalk.blueBright(
				`Checking permissions for ${process.env.REMOTION_GCP_CLIENT_EMAIL}`
			)
		);
		Log.info();
		await simulatePermissions({
			onSimulation: (res) => {
				Log.info(logPermissionOutput(res));
			},
		});
	} catch (err) {
		Log.error('Did not have the required permissions on GCP:');
		Log.error(err);
	}
};
