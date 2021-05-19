import {CliInternals} from '@remotion/cli';
import {lambdaClient, s3Client} from '../aws-clients';
import {chunk} from '../chunk';
import {getRemotionLambdas} from '../cleanup/cleanup-lambdas';
import {getRemotionS3Buckets} from '../cleanup/s3-buckets';
import {REGION} from '../constants';
import {Log} from './log';

export const cleanupCommand = async () => {
	const fetching = CliInternals.createOverwriteableCliOutput();
	fetching.update('Fetching AWS account...');

	const [{remotionBuckets}, lambdas] = await Promise.all([
		getRemotionS3Buckets(s3Client),
		getRemotionLambdas(lambdaClient),
	]);

	fetching.update(
		`Your AWS account in ${REGION} contains the following Remotion-related resources:\n\n`
	);
	Log.info(
		`${remotionBuckets.length} ${
			remotionBuckets.length === 1 ? 'bucket' : 'buckets'
		}:`
	);
	if (remotionBuckets.length !== 0) {
		Log.info(
			`${chunk(remotionBuckets, 2)
				.map((b) =>
					CliInternals.chalk.blue(b.map((a) => a.padEnd(40, ' ')).join(' '))
				)
				.join('\n')}`
		);

		Log.info();
	}

	Log.info(`${lambdas.length} ${lambdas.length === 1 ? 'lambda' : 'lambdas'}:`);
	Log.info(
		`${chunk(lambdas, 2)
			.map((b) =>
				CliInternals.chalk.blue(
					b.map((a) => (a.FunctionName ?? '').padEnd(40, ' ')).join(' ')
				)
			)
			.join('\n')}`
	);
};
