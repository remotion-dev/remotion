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
				Log.info(logPermissionOutput(res));
			},
		});
	} catch (err) {
		Log.errorAdvanced(
			{indent: false, logLevel},
			'Did not have the required permissions on AWS:',
		);
		Log.errorAdvanced({indent: false, logLevel}, err);
	}
};
