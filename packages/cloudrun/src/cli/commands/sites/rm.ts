import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {displaySiteInfo, SITES_COMMAND} from '.';
import {deleteSite} from '../../../api/delete-site';
import {getSites} from '../../../api/get-sites';
import {BINARY_NAME} from '../../../shared/constants';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {SITES_LS_SUBCOMMAND} from './ls';

export const SITES_RM_COMMAND = 'rm';

export const sitesRmSubcommand = async (args: string[], logLevel: LogLevel) => {
	if (args.length === 0) {
		Log.error(
			{indent: false, logLevel},
			'No site name was passed. Run the command again and pass another argument <site-name>.',
		);
		Log.error(
			{indent: false, logLevel},
			`To get a list of sites, run \`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}\``,
		);
		quit(1);
	}

	if (args[0] === '()') {
		Log.info({indent: false, logLevel}, 'No sites to remove.');
		return;
	}

	const region = getGcpRegion();
	const infoOutput = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		updatesDontOverwrite: false,
		indent: false,
	});
	infoOutput.update(`Checking ${region} for sites...`, false);

	const deployedSites = await getSites(region);

	for (const siteName of args) {
		infoOutput.update('Getting site info...', false);

		const site = deployedSites.sites.find((s) => s.id === siteName.trim());
		if (!site) {
			infoOutput.update('', false);
			throw new Error(`${siteName.trim()} was not found in ${region}.`);
		}

		infoOutput.update(displaySiteInfo(site), false);
		Log.info({indent: false, logLevel});
		Log.info({indent: false, logLevel});

		const confirmDelete = await confirmCli({
			delMessage: 'Delete? (Y/n)',
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info({indent: false, logLevel}, 'Aborting.');
			return;
		}

		await deleteSite({
			bucketName: site.bucketName,
			siteName,
		});

		Log.info(
			{indent: false, logLevel},
			`Deleted site ${siteName} from bucket ${site.bucketName}.`,
		);
	}
};
