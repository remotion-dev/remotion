import type {LogLevel} from '@remotion/renderer';
import {
	logPermissionOutput,
	simulatePermissions,
} from '../../../api/iam-validation/simulate';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';

export const VALIDATE_SUBCOMMAND = 'validate';

export const validateSubcommand = async (logLevel: LogLevel) => {
	try {
		await simulatePermissions({
			region: getAwsRegion(),
			onSimulation: (res) => {
				Log.info({indent: false, logLevel}, logPermissionOutput(res));
			},
		});
	} catch (err) {
		Log.error(
			{indent: false, logLevel},
			'Did not have the required permissions on AWS:',
		);
		Log.error({indent: false, logLevel}, err);
	}
};
