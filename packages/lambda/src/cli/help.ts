import chalk from 'chalk';
import {BINARY_NAME} from '../bundle-remotion';
import {Log} from './log';

const packagejson = require('../../package.json');

export const printHelp = () => {
	Log.info(
		`${BINARY_NAME} ${
			packagejson.version
		} © ${new Date().getFullYear()} Jonny Burger`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');
	Log.info(`${BINARY_NAME} deploy <index-file.ts>`);
	Log.info(chalk.gray('Deploy a lambda.'));
	Log.info();

	Log.info(`${BINARY_NAME} render <index-file.ts>`);
	Log.info(chalk.gray('Render a video on the cloud.'));

	Log.info();
	Log.info(`${BINARY_NAME} cleanup`);
	Log.info(
		chalk.gray('Delete Remotion-related infrastructure from your AWS account.')
	);
};
