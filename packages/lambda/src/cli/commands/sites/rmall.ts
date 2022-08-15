import {CliInternals} from '@remotion/cli';
import {deleteSite} from '../../../api/delete-site';
import {getRemotionS3Buckets} from '../../../api/get-buckets';
import {getSites} from '../../../api/get-sites';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_RMALL_COMMAND = 'rmall';

export const sitesRmallSubcommand = async () => {
	const region = getAwsRegion();
	const deployedSites = await getSites({
		region,
	});

	const {remotionBuckets} = await getRemotionS3Buckets(region);

	if (remotionBuckets.length > 1) {
		Log.error('You have more than one Remotion Lambda bucket:');
		for (const bucket of remotionBuckets) {
			Log.error(`- ${bucket.name}`);
		}

		Log.error(
			'You should only have one - delete all but one before continuing.'
		);
		quit(1);
	}

	if (remotionBuckets.length === 0) {
		Log.error(
			`You don't have a Remotion Lambda bucket in the ${region} region. Therefore nothing was deleted.`
		);
		quit(1);
	}

	for (const site of deployedSites.sites) {
		await confirmCli({
			delMessage: `Site ${site.id} in bucket ${
				site.bucketName
			} (${CliInternals.formatBytes(site.sizeInBytes)}): Delete? (Y/n)`,
			allowForceFlag: true,
		});

		const {totalSizeInBytes: totalSize} = await deleteSite({
			bucketName: remotionBuckets[0].name,
			siteName: site.id,
			region,
			onAfterItemDeleted: ({itemName}) => {
				Log.info(CliInternals.chalk.gray(`Deleted ${itemName}`));
			},
		});

		Log.info(
			`Deleted site ${site.id} and freed up ${CliInternals.formatBytes(
				totalSize
			)}.`
		);
	}
};
