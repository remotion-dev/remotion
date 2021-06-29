import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {cleanItems} from '../../../api/clean-items';
import {getRemotionS3Buckets} from '../../../api/get-buckets';
import {lambdaLs} from '../../../functions/helpers/io';
import {getSitesKey} from '../../../shared/constants';
import {getAwsRegion} from '../../get-aws-region';
import {formatBytes} from '../../helpers/format-bytes';

export const SITES_RM_COMMAND = 'rm';

export const sitesRmSubcommand = async (args: string[]) => {
	const siteId = args[0];
	if (!siteId) {
		Log.error(
			'No site ID was passed. Run the command again and pass another argument <site-id>.'
		);
		process.exit(1);
	}

	const region = getAwsRegion();
	const {remotionBuckets} = await getRemotionS3Buckets(region);

	if (remotionBuckets.length > 1) {
		Log.error(
			'You have more than one Remotion Lambda bucket. You should only have one - delete all but one before continuing.'
		);
		process.exit(1);
	}

	if (remotionBuckets.length === 0) {
		Log.error(
			`You don't have a Remotion Lambda bucket in the ${region} region. Therefore nothing was deleted.`
		);
		process.exit(1);
	}

	let files = await lambdaLs({
		bucketName: remotionBuckets[0].Name as string,
		prefix: getSitesKey(siteId),
		region,
	});

	if (files.length === 0) {
		Log.info(`Site ${siteId} doesn't exist. Nothing to delete.`);
		process.exit(0);
	}

	let totalSize = 0;

	while (files.length > 0) {
		totalSize += files.reduce((a, b) => {
			return a + (b.Size ?? 0);
		}, 0);
		await cleanItems({
			list: files,
			bucket: remotionBuckets[0].Name as string,
			onAfterItemDeleted: ({itemName}) => {
				Log.info(CliInternals.chalk.gray(`Deleted ${itemName}`));
			},
			onBeforeItemDeleted: () => undefined,
			region,
		});
		files = await lambdaLs({
			bucketName: remotionBuckets[0].Name as string,
			prefix: getSitesKey(siteId),
			region,
		});
	}

	Log.info(`Deleted site ${siteId} and freed up ${formatBytes(totalSize)}.`);
};
