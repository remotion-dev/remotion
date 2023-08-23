import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../shared/constants';
import {PERMISSIONS_COMMAND} from './commands/permissions';
import {REGIONS_COMMAND} from './commands/regions';
import {RENDER_COMMAND} from './commands/render';
import {SERVICES_COMMAND} from './commands/services';
import {SITES_COMMAND} from './commands/sites';
import {STILL_COMMAND} from './commands/still';
import {Log} from './log';

const packagejson = require('../../package.json');

export const printHelp = () => {
	Log.info(
		`${BINARY_NAME} ${
			packagejson.version
		} © ${new Date().getFullYear()} The Remotion developers`,
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');

	Log.info();
	Log.info(`${BINARY_NAME} ${RENDER_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Render Remotion media on GCP Cloud Run.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${STILL_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Render Remotion still on GCP Cloud Run.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${SERVICES_COMMAND}`);
	Log.info(
		CliInternals.chalk.gray('Deploy and manage Cloud Run services on GCP.'),
	);

	Log.info();
	Log.info(`${BINARY_NAME} ${SITES_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Deploy and manage Remotion projects.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${PERMISSIONS_COMMAND}`);
	Log.info(
		CliInternals.chalk.gray('View and validate required GCP permissions.'),
	);

	Log.info();
	Log.info(`${BINARY_NAME} ${REGIONS_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Show the list of GCP regions supported.'));
};
