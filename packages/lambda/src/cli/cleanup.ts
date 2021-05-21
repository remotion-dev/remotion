import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {CliInternals} from '@remotion/cli';
import {lambdaClient, s3Client} from '../aws-clients';
import {BINARY_NAME} from '../bundle-remotion';
import {chunk} from '../chunk';
import {cleanupLambdas, getRemotionLambdas} from '../cleanup/cleanup-lambdas';
import {cleanUpBuckets, getRemotionS3Buckets} from '../cleanup/s3-buckets';
import {REGION} from '../constants';
import {Log} from './log';

export const CLEANUP_COMMAND = 'cleanup';
const LAMBDA_SUBCOMMAND = 'lambdas';
const S3_BUCKETS_SUBCOMMAND = 'buckets';

const cleanupLambdaCommand = async (client: LambdaClient) => {
	await cleanupLambdas({
		lambdaClient: client,
		onAfterDelete: (lambdaName: string) =>
			Log.info(CliInternals.chalk.blue(`Deleted ${lambdaName}`)),
	});
	Log.info('All Remotion-related lambdas deleted.');
};

const cleanupBucketsCommand = async (client: S3Client) => {
	await cleanUpBuckets({
		s3client: client,
		onBeforeBucketDeleted: (bucketName) => {
			Log.info(`Deleting items of ${bucketName}`);
		},
		onAfterItemDeleted: ({itemName}) => {
			Log.info(CliInternals.chalk.gray(`  Deleting item ${itemName}`));
		},
		onAfterBucketDeleted: (bucketName: string) =>
			Log.info(CliInternals.chalk.blue(`Deleted bucket ${bucketName}.`)),
	});
	Log.info('All Remotion-related buckets deleted.');
};

export const cleanupCommand = async (args: string[]) => {
	if (args[0] === LAMBDA_SUBCOMMAND) {
		await cleanupLambdaCommand(lambdaClient);
		return;
	}

	if (args[0] === S3_BUCKETS_SUBCOMMAND) {
		await cleanupBucketsCommand(s3Client);
		return;
	}

	const fetching = CliInternals.createOverwriteableCliOutput();
	fetching.update('Fetching AWS account...');

	const [{remotionBuckets}, lambdas] = await Promise.all([
		getRemotionS3Buckets(s3Client),
		getRemotionLambdas(lambdaClient),
	]);
	if (remotionBuckets.length === 0 && lambdas.length === 0) {
		fetching.update(
			`Your AWS account in ${REGION} contains no following Remotion-related resources.\n`
		);
		return;
	}

	fetching.update(
		`Your AWS account in ${REGION} contains the following Remotion-related resources:\n\n`
	);
	if (remotionBuckets.length !== 0) {
		Log.info(
			`${remotionBuckets.length} ${
				remotionBuckets.length === 1 ? 'bucket' : 'buckets'
			}:`
		);
		Log.info(
			`${chunk(remotionBuckets, 2)
				.map((b) =>
					CliInternals.chalk.blue(
						b.map((a) => (a.Name as string).padEnd(40, ' ')).join(' ')
					)
				)
				.join('\n')}`
		);

		Log.info(
			CliInternals.chalk.gray(
				`Run \`${BINARY_NAME} ${CLEANUP_COMMAND} ${S3_BUCKETS_SUBCOMMAND}\` to permanently delete S3 buckets`
			)
		);
		Log.info();
	}

	if (lambdas.length > 0) {
		Log.info(
			`${lambdas.length} ${lambdas.length === 1 ? 'lambda' : 'lambdas'}:`
		);
		Log.info(
			`${chunk(lambdas, 2)
				.map((b) =>
					CliInternals.chalk.blue(
						b.map((a) => (a.FunctionName ?? '').padEnd(40, ' ')).join(' ')
					)
				)
				.join('\n')}`
		);
		Log.info(
			CliInternals.chalk.gray(
				`Run \`${BINARY_NAME} ${CLEANUP_COMMAND} ${LAMBDA_SUBCOMMAND}\` to permanently delete lambdas`
			)
		);
		Log.info();
	}
};
