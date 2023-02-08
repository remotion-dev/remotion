import {CliInternals} from '@remotion/cli';
import {deleteSite} from '../../../api/delete-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {getSites} from '../../../api/get-sites';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const SITES_RMALL_COMMAND = 'rmall';

export const sitesRmallSubcommand = async () => {
	const region = getAwsRegion();
	const deployedSites = await getSites({
		region,
	});

	const bucketName =
		parsedLambdaCli['force-bucket-name'] ??
		(await getOrCreateBucket({region})).bucketName;

	for (const site of deployedSites.sites) {
		await confirmCli({
			delMessage: `Site ${site.id} in bucket ${
				site.bucketName
			} (${CliInternals.formatBytes(site.sizeInBytes)}): Delete? (Y/n)`,
			allowForceFlag: true,
		});

		const {totalSizeInBytes: totalSize} = await deleteSite({
			bucketName,
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
