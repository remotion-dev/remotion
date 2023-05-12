import {CliInternals} from '@remotion/cli';
import {deleteSite} from '../../../api/delete-site';
import {getSites} from '../../../api/get-sites';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_RM_COMMAND = 'rm';
const LEFT_COL = 16;

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

	const deployedSites = await getSites('all regions');

	for (const siteName of args) {
		const infoOutput = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
		});
		infoOutput.update('Getting site info...');

		const site = deployedSites.sites.find((s) => s.id === siteName.trim());
		if (!site) {
			throw new Error(`${siteName.trim()} was not found.`);
		}

		infoOutput.update(
			[
				'Site: '.padEnd(LEFT_COL, ' ') + ' ' + site.id,
				'Bucket: '.padEnd(LEFT_COL, ' ') + ' ' + site.bucketName,
				'Region: '.padEnd(LEFT_COL, ' ') + ' ' + site.bucketRegion,
				'Serve Url: '.padEnd(LEFT_COL, ' ') + ' ' + site.serveUrl,
			].join('\n')
		);
		Log.info();
		Log.info();

		const confirmDelete = await confirmCli({
			delMessage: `Site ${site.id} in bucket ${site.bucketName}: Delete? (Y/n)`,
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info('Aborting.');
			return;
		}

		await deleteSite({
			bucketName: site.bucketName,
			siteName,
		});

		Log.info(`Deleted site ${siteName} from bucket ${site.bucketName}.`);
	}
};
