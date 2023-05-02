import {deleteSite} from '../../../api/delete-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {getSites} from '../../../api/get-sites';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const SITES_RMALL_COMMAND = 'rmall';

export const sitesRmallSubcommand = async () => {
	const region = getGcpRegion();
	const deployedSites = await getSites();

	const {bucketName} = await getOrCreateBucket({region});

	for (const site of deployedSites.sites) {
		const confirmDelete = await confirmCli({
			delMessage: `Site ${site.id} in bucket ${site.bucketName}: Delete? (Y/n)`,
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info(`Skipping site - ${site.id}.`);
			continue;
		}

		await deleteSite({
			bucketName,
			siteName: site.id,
		});

		Log.info(`Deleted site ${site.id} from bucket ${site.bucketName}.`);
	}
};
