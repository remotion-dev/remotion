import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {deleteSite} from '../../../api/delete-site';
import {internalGetOrCreateBucket} from '../../../api/get-or-create-bucket';
import {getSites} from '../../../api/get-sites';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const SITES_RMALL_COMMAND = 'rmall';

export const sitesRmallSubcommand = async (logLevel: LogLevel) => {
	const region = getAwsRegion();
	const deployedSites = await getSites({
		region,
	});

	const bucketName =
		parsedLambdaCli['force-bucket-name'] ??
		(
			await internalGetOrCreateBucket({
				region,
				enableFolderExpiry: false,
				customCredentials: null,
			})
		).bucketName;

	for (const site of deployedSites.sites) {
		if (
			!(await confirmCli({
				delMessage: `Site ${site.id} in bucket ${
					site.bucketName
				} (${CliInternals.formatBytes(site.sizeInBytes)}): Delete? (Y/n)`,
				allowForceFlag: true,
			}))
		) {
			continue;
		}

		const {totalSizeInBytes: totalSize} = await deleteSite({
			bucketName,
			siteName: site.id,
			region,
			onAfterItemDeleted: ({itemName}) => {
				Log.info(
					{indent: false, logLevel},
					CliInternals.chalk.gray(`Deleted ${itemName}`),
				);
			},
		});

		Log.info(
			{indent: false, logLevel},
			`Deleted site ${site.id} and freed up ${CliInternals.formatBytes(
				totalSize,
			)}.`,
		);
	}
};
