import {LambdaClientInternals} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import {getUserPolicy} from '../../../api/iam-validation/suggested-policy';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';

export const USER_SUBCOMMAND = 'user';

export const userSubcommand = (logLevel: LogLevel) => {
	const region = getAwsRegion();
	const {partition} = LambdaClientInternals.getAwsRegionMetadata(region);
	Log.info({indent: false, logLevel}, getUserPolicy({partition}));
};
