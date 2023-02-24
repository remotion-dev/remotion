import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../shared/constants';
import {CLOUD_RUN_COMMAND} from './commands/cloud-run';
import {SITES_COMMAND} from './commands/sites';
import {Log} from './log';

const packagejson = require('../../package.json');

export const printHelp = () => {
	Log.info(
		`${BINARY_NAME} ${
			packagejson.version
		} © ${new Date().getFullYear()} The Remotion developers`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');

	// Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <s3-url> <composition-id>`);
	// Log.info(CliInternals.chalk.gray('Render a video in the cloud.'));

	// Log.info(`${BINARY_NAME} ${STILL_COMMAND} <s3-url> <composition-id>`);
	// Log.info(CliInternals.chalk.gray('Render a still image in the cloud.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${CLOUD_RUN_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Deploy and manage GCP Cloud Run services.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${SITES_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Deploy and manage Remotion projects.'));

};
