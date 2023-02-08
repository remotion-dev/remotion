import {CliInternals} from '@remotion/cli';
import {deleteSite} from '../../../api/delete-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {getSites} from '../../../api/get-sites';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
export const SITES_RM_COMMAND = 'rm';

export const sitesRmSubcommand = async (args: string[]) => {
	if (args.length === 0) {
		Log.error(
			'No site name was passed. Run the command again and pass another argument <site-name>.'
		);
		quit(1);
	}

	if (args[0] === '()') {
		Log.info('No sites to remove.');
		return;
	}

	const region = getAwsRegion();
	const deployedSites = await getSites({
		region,
	});

	for (const siteName of args) {
		const bucketName =
			parsedLambdaCli['force-bucket-name'] ??
			(await getOrCreateBucket({region})).bucketName;

		const site = deployedSites.sites.find((s) => s.id === siteName.trim());
		if (!site) {
			Log.error(
				`No site ${siteName.trim()} was found in your bucket ${bucketName}.`
			);
			return quit(1);
		}

		await confirmCli({
			delMessage: `Site ${site.id} in bucket ${
				site.bucketName
			} (${CliInternals.formatBytes(site.sizeInBytes)}): Delete? (Y/n)`,
			allowForceFlag: true,
		});

		const {totalSizeInBytes: totalSize} = await deleteSite({
			bucketName,
			siteName,
			region,
			onAfterItemDeleted: ({itemName}) => {
				Log.info(CliInternals.chalk.gray(`Deleted ${itemName}`));
			},
		});

		Log.info(
			`Deleted site ${siteName} and freed up ${CliInternals.formatBytes(
				totalSize
			)}.`
		);
	}
};
