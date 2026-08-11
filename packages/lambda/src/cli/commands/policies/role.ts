import {LambdaClientInternals} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import {getRolePolicy} from '../../../api/iam-validation/suggested-policy';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';
export const ROLE_SUBCOMMAND = 'role';

export const roleSubcommand = (logLevel: LogLevel) => {
	const region = getAwsRegion();
	const {partition} = LambdaClientInternals.getAwsRegionMetadata(region);
	Log.info({indent: false, logLevel}, getRolePolicy({partition}));
};
