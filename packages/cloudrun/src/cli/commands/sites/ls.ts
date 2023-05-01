import {CliInternals} from '@remotion/cli';
import {getSites} from '../../../api/get-sites';
import {dateString} from '../../helpers/date-string';

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
	const {sites, buckets} = await getSites();

	if (buckets.length > 1 && !CliInternals.quietFlagProvided()) {
		CliInternals.Log.warn(
			'Warning: You have more than one Remotion Cloud Storage bucket, but only one is needed. This can lead to conflicts. Remove all but one of them.'
		);
	}

	const sitesPluralized = sites.length === 1 ? 'site' : 'sites';
	if (!CliInternals.quietFlagProvided()) {
		CliInternals.Log.info(
			`${sites.length} ${sitesPluralized} in the ${process.env.REMOTION_GCP_PROJECT_ID} project.`
		);
	}

	if (CliInternals.quietFlagProvided()) {
		if (sites.length === 0) {
			CliInternals.Log.info('()');
			return;
		}

		return CliInternals.Log.info(sites.map((s) => s.id).join(' '));
	}

	CliInternals.Log.info();
	CliInternals.Log.info(
		CliInternals.chalk.gray(logRow(['Site Name', 'Bucket', 'Last updated']))
	);

	for (const site of sites) {
		CliInternals.Log.info(
			logRow([
				site.id,
				site.bucketName,
				site.lastModified ? dateString(new Date(site.lastModified)) : 'n/a',
			])
		);
		CliInternals.Log.info(site.serveUrl);
		CliInternals.Log.info();
	}
};
