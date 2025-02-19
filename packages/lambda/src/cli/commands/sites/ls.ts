import {CliInternals} from '@remotion/cli';
import {getSites} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import {getAwsRegion} from '../../get-aws-region';
import {dateString} from '../../helpers/date-string';

export const SITES_LS_SUBCOMMAND = 'ls';

const COLS: [number, number, number, number] = [20, 30, 10, 15];

const logRow = (data: [string, string, string, string]) => {
	return [
		data[0].padEnd(COLS[0], ' '),
		data[1].padEnd(COLS[1], ' '),
		data[2].padEnd(COLS[2], ' '),
		String(data[3]).padEnd(COLS[3], ' '),
	].join('');
};

export const sitesLsSubcommand = async (logLevel: LogLevel) => {
	const region = getAwsRegion();
	const {sites, buckets} = await getSites({region});

	if (buckets.length > 1 && !CliInternals.quietFlagProvided()) {
		CliInternals.Log.warn(
			{indent: false, logLevel},
			'Warning: You have more than one Remotion S3 bucket, but only one is needed. This can lead to conflicts. Remove all but one of them.',
		);
	}

	const sitesPluralized = sites.length === 1 ? 'site' : 'sites';
	if (!CliInternals.quietFlagProvided()) {
		CliInternals.Log.info(
			{indent: false, logLevel},
			`${sites.length} ${sitesPluralized} in the ${region} region.`,
		);
	}

	if (CliInternals.quietFlagProvided()) {
		if (sites.length === 0) {
			CliInternals.Log.info({indent: false, logLevel}, '()');
			return;
		}

		return CliInternals.Log.info(
			{indent: false, logLevel},
			sites.map((s) => s.id).join(' '),
		);
	}

	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			logRow(['Site Name', 'Bucket', 'Size', 'Last updated']),
		),
	);

	for (const site of sites) {
		CliInternals.Log.info(
			{indent: false, logLevel},
			logRow([
				site.id,
				site.bucketName,
				CliInternals.formatBytes(site.sizeInBytes),
				site.lastModified ? dateString(new Date(site.lastModified)) : 'n/a',
			]),
		);
		CliInternals.Log.info({indent: false, logLevel}, site.serveUrl);
		CliInternals.Log.info({indent: false, logLevel});
	}
};
