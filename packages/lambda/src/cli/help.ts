import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {COMPOSITIONS_COMMAND} from './commands/compositions';
import {FUNCTIONS_COMMAND} from './commands/functions';
import {POLICIES_COMMAND} from './commands/policies/policies';
import {QUOTAS_COMMAND} from './commands/quotas';
import {REGIONS_COMMAND} from './commands/regions';
import {RENDER_COMMAND} from './commands/render/render';
import {SITES_COMMAND} from './commands/sites';
import {STILL_COMMAND} from './commands/still';
import {Log} from './log';

const packagejson = require('../../package.json');

export const printHelp = (logLevel: LogLevel) => {
	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${
			packagejson.version
		} © ${new Date().getFullYear()} The Remotion developers`,
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available commands:');
	Log.info({indent: false, logLevel}, '');

	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${RENDER_COMMAND} <s3-url> <composition-id>`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Render a video in the cloud.'),
	);

	Log.info(
		{indent: false, logLevel},
		`${BINARY_NAME} ${STILL_COMMAND} <s3-url> <composition-id>`,
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Render a still image in the cloud.'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, `${BINARY_NAME} ${FUNCTIONS_COMMAND}`);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Deploy and manage AWS Lambda functions.'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, `${BINARY_NAME} ${SITES_COMMAND}`);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Deploy and manage Remotion projects.'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, `${BINARY_NAME} ${COMPOSITIONS_COMMAND}`);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Print list of composition IDs from a serve URL.'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, `${BINARY_NAME} ${POLICIES_COMMAND}`);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('View and validate AWS policy files.'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, `${BINARY_NAME} ${REGIONS_COMMAND}`);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Show the list of AWS regions supported.'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, `${BINARY_NAME} ${QUOTAS_COMMAND}`);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray('Shows AWS quotas and allows to increase them.'),
	);
};
