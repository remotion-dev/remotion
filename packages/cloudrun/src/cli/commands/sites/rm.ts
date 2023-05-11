import {deleteSite} from '../../../api/delete-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {getSites} from '../../../api/get-sites';
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

	const deployedSites = await getSites();

	for (const siteName of args) {
		const {bucketName} = await getOrCreateBucket();

		const site = deployedSites.sites.find((s) => s.id === siteName.trim());
		if (!site) {
			Log.error(
				`No site ${siteName.trim()} was found in your bucket ${bucketName}.`
			);
			return quit(1);
		}

		const confirmDelete = await confirmCli({
			delMessage: `Site ${site.id} in bucket ${site.bucketName}: Delete? (Y/n)`,
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info('Aborting.');
			return;
		}

		await deleteSite({
			bucketName,
			siteName,
		});

		Log.info(`Deleted site ${siteName} from bucket ${site.bucketName}.`);
	}
};
