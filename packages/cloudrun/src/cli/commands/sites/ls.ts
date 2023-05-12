import {CliInternals} from '@remotion/cli';
import {getSites} from '../../../api/get-sites';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';

export const SITES_LS_SUBCOMMAND = 'ls';

const COLS: [number, number, number] = [20, 30, 15];

const logRow = (data: [string, string, string]) => {
	return [
		data[0].padEnd(COLS[0], ' '),
		data[1].padEnd(COLS[1], ' '),
		String(data[2]).padEnd(COLS[2], ' '),
	].join('');
};

export const sitesLsSubcommand = async () => {
	// check if --allRegions flag is provided
	// if so, list all sites
	// else, list only the sites that are in the current project
	const allRegions = parsedCloudrunCli['all-regions'];

	const region = allRegions ? 'all regions' : getGcpRegion();

	const {sites, buckets} = await getSites(region);

	if (buckets.length > 1 && !CliInternals.quietFlagProvided()) {
		CliInternals.Log.warn(
			'Warning: You have more than one Remotion Cloud Storage bucket, but only one is needed. This can lead to conflicts. Remove all but one of them.'
		);
	}

	const sitesPluralized = sites.length === 1 ? 'site' : 'sites';
	if (!CliInternals.quietFlagProvided()) {
		CliInternals.Log.info(
			`${sites.length} ${sitesPluralized} in ${region}, in the ${process.env.REMOTION_GCP_PROJECT_ID} project.`
		);
	}

	if (CliInternals.quietFlagProvided()) {
		if (sites.length === 0) {
			CliInternals.Log.info('()');
			return;
		}

		return CliInternals.Log.info(sites.map((s) => s.id).join(' '));
	}

	if (sites.length > 0) {
		CliInternals.Log.info();
		CliInternals.Log.info(
			CliInternals.chalk.gray(logRow(['Site Name', 'Bucket', 'Region']))
		);

		for (const site of sites) {
			CliInternals.Log.info(
				logRow([site.id, site.bucketName, site.bucketRegion])
			);
			CliInternals.Log.info(site.serveUrl);
			CliInternals.Log.info();
		}
	}
};
