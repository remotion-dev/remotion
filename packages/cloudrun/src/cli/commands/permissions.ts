import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {
	logPermissionOutput,
	testPermissions,
} from '../../api/iam-validation/testPermissions';
import {getProjectId} from '../../functions/helpers/is-in-cloud-task';
import {Log} from '../log';

export const PERMISSIONS_COMMAND = 'permissions';

export const permissionsCommand = async (logLevel: LogLevel) => {
	try {
		Log.info(
			{indent: false, logLevel},
			CliInternals.chalk.blueBright(
				`Checking permissions for ${
					process.env.REMOTION_GCP_CLIENT_EMAIL
				} in project ${getProjectId()}.`,
			),
		);
		Log.info({indent: false, logLevel});
		await testPermissions({
			onTest: (res) => {
				Log.info({indent: false, logLevel}, logPermissionOutput(res));
			},
		});
	} catch (err) {
		Log.error(
			{indent: false, logLevel},
			'Did not have the required permissions on GCP:',
		);
		Log.error({indent: false, logLevel}, err);
	}
};
