import type {LogLevel} from '@remotion/renderer';
import {displaySiteInfo} from '.';
import {deleteSite} from '../../../api/delete-site';
import {getSites} from '../../../api/get-sites';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const SITES_RMALL_COMMAND = 'rmall';

export const sitesRmallSubcommand = async (logLevel: LogLevel) => {
	const allRegions = parsedCloudrunCli['all-regions'];

	const region = allRegions ? 'all regions' : getGcpRegion();
	Log.infoAdvanced({indent: false, logLevel}, `Retrieving sites in ${region}.`);

	const deployedSites = await getSites(region);

	for (const site of deployedSites.sites) {
		Log.infoAdvanced({indent: false, logLevel});
		Log.infoAdvanced({indent: false, logLevel}, displaySiteInfo(site));
		Log.infoAdvanced({indent: false, logLevel});
		const confirmDelete = await confirmCli({
			delMessage: 'Delete? (Y/n)',
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.infoAdvanced(
				{indent: false, logLevel},
				`Skipping site - ${site.id}.`,
			);
			Log.infoAdvanced({indent: false, logLevel});
			continue;
		}

		await deleteSite({
			bucketName: site.bucketName,
			siteName: site.id,
		});

		Log.infoAdvanced(
			{indent: false, logLevel},
			`Deleted site ${site.id} from bucket ${site.bucketName}.`,
		);
		Log.infoAdvanced({indent: false, logLevel});
	}
};
