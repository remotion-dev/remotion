import {displaySiteInfo} from '.';
import {deleteSite} from '../../../api/delete-site';
import {getSites} from '../../../api/get-sites';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const SITES_RMALL_COMMAND = 'rmall';

export const sitesRmallSubcommand = async () => {
	const allRegions = parsedCloudrunCli['all-regions'];

	const region = allRegions ? 'all regions' : getGcpRegion();
	Log.info(`Retrieving sites in ${region}.`);

	const deployedSites = await getSites(region);

	for (const site of deployedSites.sites) {
		Log.info();
		Log.info(displaySiteInfo(site));
		Log.info();
		const confirmDelete = await confirmCli({
			delMessage: 'Delete? (Y/n)',
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info(`Skipping site - ${site.id}.`);
			Log.info();
			continue;
		}

		await deleteSite({
			bucketName: site.bucketName,
			siteName: site.id,
		});

		Log.info(`Deleted site ${site.id} from bucket ${site.bucketName}.`);
		Log.info();
	}
};
