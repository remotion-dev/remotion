import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {displaySiteInfo} from '.';
import {getSites} from '../../../api/get-sites';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {Log} from '../../log';

export const SITES_LS_SUBCOMMAND = 'ls';

export const sitesLsSubcommand = async (logLevel: LogLevel) => {
	// check if --allRegions flag is provided
	// if so, list all sites
	// else, list only the sites that are in the current project
	const allRegions = parsedCloudrunCli['all-regions'];

	const region = allRegions ? 'all regions' : getGcpRegion();

	const {sites, buckets} = await getSites(region);

	if (buckets.length > 1 && !CliInternals.quietFlagProvided() && !allRegions) {
		Log.warn(
			{indent: false, logLevel},
			`Warning: You have more than one Remotion Cloud Storage bucket in ${region}, but only one is needed. This can lead to conflicts. Remove all but one of them.`,
		);
	}

	const sitesPluralized = sites.length === 1 ? 'site' : 'sites';
	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			{indent: false, logLevel},
			`${sites.length} ${sitesPluralized} in ${region}, in the ${process.env.REMOTION_GCP_PROJECT_ID} project.`,
		);
	}

	if (CliInternals.quietFlagProvided()) {
		if (sites.length === 0) {
			Log.info({indent: false, logLevel}, '()');
			return;
		}

		return Log.info(
			{indent: false, logLevel},
			sites.map((s) => s.id).join(' '),
		);
	}

	if (sites.length > 0) {
		Log.info({indent: false, logLevel});

		for (const site of sites) {
			Log.info({indent: false, logLevel}, displaySiteInfo(site));
			Log.info({indent: false, logLevel});
		}
	}
};
