import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../shared/constants';
import {FUNCTIONS_COMMAND} from './commands/functions';
import {POLICIES_COMMAND} from './commands/policies/policies';
import {QUOTAS_COMMAND} from './commands/quotas';
import {REGIONS_COMMAND} from './commands/regions';
import {RENDER_COMMAND} from './commands/render/render';
import {SITES_COMMAND} from './commands/sites';
import {STILL_COMMAND} from './commands/still';
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

	Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <s3-url> <composition-id>`);
	Log.info(CliInternals.chalk.gray('Render a video in the cloud.'));

	Log.info(`${BINARY_NAME} ${STILL_COMMAND} <s3-url> <composition-id>`);
	Log.info(CliInternals.chalk.gray('Render a still image in the cloud.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Deploy and manage AWS Lambda functions.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${SITES_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Deploy and manage Remotion projects.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND}`);
	Log.info(CliInternals.chalk.gray('View and validate AWS policy files.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${REGIONS_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Show the list of AWS regions supported.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${QUOTAS_COMMAND}`);
	Log.info(
		CliInternals.chalk.gray('Shows AWS quotas and allows to increase them.')
	);
};
