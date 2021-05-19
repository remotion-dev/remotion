import {CliInternals} from '@remotion/cli';
import {s3Client} from '../aws-clients';
import {chunk} from '../chunk';
import {getRemotionS3Buckets} from '../cleanup/s3-buckets';
import {REGION} from '../constants';
import {Log} from './log';

export const cleanupCommand = async () => {
	Log.info('Fetching AWS account...');
	const {remotionBuckets} = await getRemotionS3Buckets(s3Client);
	Log.info(
		`Your AWS account in ${REGION} contains the following Remotion-related resources:`
	);
	Log.info(
		`${remotionBuckets.length} ${
			remotionBuckets.length === 1 ? 'bucket' : 'buckets'
		}:`
	);
	Log.info(
		`${chunk(remotionBuckets, 2)
			.map((b) =>
				CliInternals.chalk.blue(b.map((a) => a.padEnd(40, ' ')).join(' '))
			)
			.join('\n')}`
	);
};
