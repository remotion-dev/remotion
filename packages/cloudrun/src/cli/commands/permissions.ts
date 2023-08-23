import {CliInternals} from '@remotion/cli';
import {
	logPermissionOutput,
	testPermissions,
} from '../../api/iam-validation/testPermissions';
import {Log} from '../log';

export const PERMISSIONS_COMMAND = 'permissions';

export const permissionsCommand = async () => {
	try {
		Log.info(
			CliInternals.chalk.blueBright(
				`Checking permissions for ${process.env.REMOTION_GCP_CLIENT_EMAIL} in project ${process.env.REMOTION_GCP_PROJECT_ID}.`,
			),
		);
		Log.info();
		await testPermissions({
			onTest: (res) => {
				Log.info(logPermissionOutput(res));
			},
		});
	} catch (err) {
		Log.error('Did not have the required permissions on GCP:');
		Log.error(err);
	}
};
